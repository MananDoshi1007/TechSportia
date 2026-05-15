using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Models;
using System.Linq;
using System.Security.Claims;

[ApiController]
[Route("api/[controller]")]
public class RegistrationController : ControllerBase
{
    private readonly TechsportiaDbContext _context;

    public RegistrationController(TechsportiaDbContext context)
    {
        _context = context;
    }

    // 🔹 REGISTER FOR SPORT
    [HttpPost]
    [Authorize(Roles = "Player")]
    public async Task<IActionResult> Register(int sportId)
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdString)) return Unauthorized();

        var userId = int.Parse(userIdString);
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return Unauthorized();

        var sport = await _context.Sports
            .Include(s => s.Event)
            .FirstOrDefaultAsync(s => s.SportId == sportId);

        if (sport == null) return BadRequest(new { message = "Invalid SportId" });
        if (sport.Event == null) return BadRequest(new { message = "Sport is not linked to any event" });

        if (sport.Event.Status == "Draft") return BadRequest(new { message = "Registration is not open for this event (Draft)" });
        if (sport.Event.Status == "Completed") return BadRequest(new { message = "Event is already completed" });
        if (sport.Event.Status == "Upcoming") return BadRequest(new { message = "Event has not started yet" });
        
        if (sport.Event.Status != "RegistrationOpen" && sport.Event.Status != "Ongoing") 
             return BadRequest(new { message = "Registration is only allowed for events with 'RegistrationOpen' or 'Ongoing' status" });

        if (user.CollegeId != sport.Event.CollegeId) return BadRequest(new { message = "You can only register in your own college event" });

        // 🔹 CONFLICT CHECK (Same Date & Time)
        if (sport.StartDate != null && !string.IsNullOrEmpty(sport.StartTime))
        {
            // Check Individual Registrations
            var individualConflict = await _context.IndividualRegistrations
                .Include(r => r.Sport)
                .AnyAsync(r => r.UserId == userId && 
                               r.Sport.StartDate == sport.StartDate && 
                               r.Sport.StartTime == sport.StartTime);

            // Check Team Registrations
            var teamConflict = await _context.TeamMembers
                .Include(tm => tm.Team)
                .ThenInclude(t => t.Sport)
                .AnyAsync(tm => tm.UserId == userId && 
                                tm.Team.Sport.StartDate == sport.StartDate && 
                                tm.Team.Sport.StartTime == sport.StartTime);

            if (individualConflict || teamConflict)
                return BadRequest(new { message = "Schedule Conflict: You are already participating in another sport at the same date and time." });
        }

        var existingReg = await _context.IndividualRegistrations
            .FirstOrDefaultAsync(r => r.UserId == userId && r.SportId == sportId);

        if (existingReg != null)
        {
            if (existingReg.IsApproved == false)
                return BadRequest(new { message = "You have been rejected for this sport by the organizer and cannot register again." });
            
            return BadRequest(new { message = "Already registered for this sport." });
        }

        var approvedCount = await _context.IndividualRegistrations
            .CountAsync(r => r.SportId == sportId && r.IsApproved == true);

        if (sport.MaxPlayers != null && approvedCount >= sport.MaxPlayers)
            return BadRequest(new { message = "Maximum player limit reached" });

        var reg = new IndividualRegistration
        {
            UserId = userId,
            SportId = sportId,
            IsApproved = null, // 🔹 Set to null for PENDING
            RegisteredAt = DateTime.Now
        };

        await _context.IndividualRegistrations.AddAsync(reg);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Registered successfully (Pending Approval)" });
    }

    // 🔹 GET MY REGISTRATIONS
    [HttpGet("my")]
    [Authorize(Roles = "Player")]
    public async Task<IActionResult> MyRegistrations()
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdString)) return Unauthorized();
        var userId = int.Parse(userIdString);

        // Individual
        var ind = await _context.IndividualRegistrations
            .Where(r => r.UserId == userId)
            .Select(r => new
            {
                Id = r.IndividualRegistrationId,
                SportName = r.Sport != null ? r.Sport.Name : "N/A",
                EventName = r.Sport != null && r.Sport.Event != null ? r.Sport.Event.Name : "N/A",
                Type = "Individual",
                IsApproved = r.IsApproved,
                IsDraft = (bool?)false, // 🔹 Match type with Team IsDraft
                Date = r.RegisteredAt,
                TeamName = "",
                SportId = r.SportId ?? 0
            })
            .ToListAsync();

        // Team
        var team = await _context.TeamMembers
            .Where(tm => tm.UserId == userId)
            .Select(tm => new
            {
                Id = tm.TeamId ?? 0,
                SportName = tm.Team != null && tm.Team.Sport != null ? tm.Team.Sport.Name : "N/A",
                EventName = tm.Team != null && tm.Team.Sport != null && tm.Team.Sport.Event != null ? tm.Team.Sport.Event.Name : "N/A",
                Type = "Team",
                IsApproved = tm.Team != null ? tm.Team.IsApproved : null,
                IsDraft = tm.Team != null ? tm.Team.IsDraft : (bool?)false, // 🔹 Match type with Individual IsDraft
                Date = tm.Team != null ? tm.Team.CreatedAt : DateTime.Now,
                TeamName = tm.Team != null ? tm.Team.TeamName : "N/A",
                SportId = tm.Team != null ? tm.Team.SportId : 0
            })
            .ToListAsync();

        var combined = ind.Cast<object>().Concat(team.Cast<object>()).OrderByDescending(x => ((dynamic)x).Date);
        return Ok(combined);
    }

    // 🔹 GET PARTICIPANTS BY SPORT (Organizer/SuperAdmin)
    [HttpGet("sport/{sportId}")]
    [Authorize(Roles = "SuperAdmin,Organizer")]
    public async Task<IActionResult> GetParticipants(int sportId)
    {
        var users = await _context.IndividualRegistrations
            .Where(r => r.SportId == sportId)
            .Select(r => new
            {
                Id = r.IndividualRegistrationId,
                UserId = r.User != null ? r.User.UserId : 0,
                FullName = r.User != null ? r.User.FullName : "N/A",
                Email = r.User != null ? r.User.Email : "N/A",
                r.IsApproved
            })
            .ToListAsync();

        return Ok(users);
    }

    // 🔹 GET ALL INDIVIDUAL REGISTRATIONS FOR COLLEGE (Organizer/SuperAdmin)
    [HttpGet("college")]
    [Authorize(Roles = "SuperAdmin,Organizer")]
    public async Task<IActionResult> GetCollegeRegistrations()
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdString)) return Unauthorized();
        var user = await _context.Users.FindAsync(int.Parse(userIdString));
        if (user == null) return Unauthorized();

        var regs = await _context.IndividualRegistrations
            .Include(r => r.User)
            .Include(r => r.Sport)
            .ThenInclude(s => s.Event)
            .Where(r => r.Sport.Event.CollegeId == user.CollegeId)
            .Select(r => new
            {
                Id = r.IndividualRegistrationId,
                UserId = r.User != null ? r.User.UserId : 0,
                FullName = r.User != null ? r.User.FullName : "N/A",
                Email = r.User != null ? r.User.Email : "N/A",
                r.IsApproved,
                SportName = r.Sport != null ? r.Sport.Name : "N/A",
                SportId = r.SportId
            })
            .ToListAsync();

        return Ok(regs);
    }

    // 🔹 APPROVE REGISTRATION (Organizer/SuperAdmin)
    [HttpPut("approve/{id}")]
    [Authorize(Roles = "SuperAdmin,Organizer")]
    public async Task<IActionResult> Approve(int id)
    {
        var reg = await _context.IndividualRegistrations.Include(r => r.Sport).ThenInclude(s => s.Event).FirstOrDefaultAsync(r => r.IndividualRegistrationId == id);
        if (reg == null) return NotFound();

        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var role = User.FindFirst(ClaimTypes.Role)?.Value;
        if (role == "Organizer")
        {
            var user = await _context.Users.FindAsync(int.Parse(userIdString));
            if (user == null || reg.Sport?.Event?.CollegeId != user.CollegeId)
                return Forbid("You can only approve registrations for your own college's events");
        }

        reg.IsApproved = true;
        await _context.SaveChangesAsync();
        return Ok(new { message = "Registration approved" });
    }

    // 🔹 DELETE/REJECT REGISTRATION (Organizer/SuperAdmin)
    [HttpDelete("{id}")]
    [Authorize(Roles = "SuperAdmin,Organizer")]
    public async Task<IActionResult> Reject(int id)
    {
        var reg = await _context.IndividualRegistrations.Include(r => r.Sport).ThenInclude(s => s.Event).FirstOrDefaultAsync(r => r.IndividualRegistrationId == id);
        if (reg == null) return NotFound();

        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var role = User.FindFirst(ClaimTypes.Role)?.Value;
        if (role == "Organizer")
        {
            var user = await _context.Users.FindAsync(int.Parse(userIdString));
            if (user == null || reg.Sport?.Event?.CollegeId != user.CollegeId)
                return Forbid("You can only reject registrations for your own college's events");
        }

        reg.IsApproved = false;
        await _context.SaveChangesAsync();
        return Ok(new { message = "Registration rejected" });
    }
}