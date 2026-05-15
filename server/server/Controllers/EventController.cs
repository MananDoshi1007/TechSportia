using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.DTOs.Event;
using server.Models;

[ApiController]
[Route("api/[controller]")]
public class EventController : ControllerBase
{
    private readonly TechsportiaDbContext _context;

    public EventController(TechsportiaDbContext context)
    {
        _context = context;
    }

    // 🔹 GET ORGANIZER DASHBOARD STATS
    [HttpGet("organizer-stats")]
    [Authorize(Roles = "Organizer")]
    public async Task<IActionResult> GetOrganizerStats()
    {
        var userIdString = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdString)) return Unauthorized();
        var userId = int.Parse(userIdString);
        var user = await _context.Users.FindAsync(userId);
        if (user == null || user.CollegeId == null) return Unauthorized();

        var collegeId = user.CollegeId;

        var totalEvents = await _context.Events.CountAsync(e => e.CollegeId == collegeId);
        var activeEvents = await _context.Events.CountAsync(e => e.CollegeId == collegeId && (e.Status == "Ongoing" || e.Status == "RegistrationOpen"));
        
        // Participants = Individual + Team Members
        var indRegCount = await _context.IndividualRegistrations
            .Include(r => r.Sport)
            .CountAsync(r => r.Sport != null && r.Sport.Event != null && r.Sport.Event.CollegeId == collegeId);

        var teamMemberCount = await _context.TeamMembers
            .Include(tm => tm.Team)
            .ThenInclude(t => t!.Sport)
            .CountAsync(tm => tm.Team != null && tm.Team.Sport != null && tm.Team.Sport.Event != null && tm.Team.Sport.Event.CollegeId == collegeId);

        // Pending = Individual (not approved) + Teams (not approved)
        var pendingInd = await _context.IndividualRegistrations
            .Include(r => r.Sport)
            .CountAsync(r => r.Sport != null && r.Sport.Event != null && r.Sport.Event.CollegeId == collegeId && r.IsApproved == null);

        var pendingTeams = await _context.Teams
            .Include(t => t.Sport)
            .CountAsync(t => t.Sport != null && t.Sport.Event != null && t.Sport.Event.CollegeId == collegeId && t.IsApproved == null);

        return Ok(new OrganizerStatsDTO
        {
            TotalEvents = totalEvents,
            ActiveEvents = activeEvents,
            TotalParticipants = indRegCount + teamMemberCount,
            PendingApprovals = pendingInd + pendingTeams
        });
    }

    // 🔹 GET GLOBAL STATS (SuperAdmin)
    [HttpGet("stats")]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<IActionResult> GetStats()
    {
        var totalEvents = await _context.Events.CountAsync();
        var totalSports = await _context.Sports.CountAsync();
        var ongoingEvents = await _context.Events.CountAsync(e => e.Status == "Ongoing");
        return Ok(new { totalEvents, totalSports, ongoingEvents });
    }

    // 🔹 GET ALL EVENTS (College-scoped for Player/Organizer, all for Guest/SuperAdmin)
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll([FromQuery] string? q)
    {
        var query = _context.Events
            .Include(e => e.College)
            .Include(e => e.Sports)
            .AsQueryable();

        // 🔹 College-level isolation: Player & Organizer only see own college events
        var userIdString = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;

        if (!string.IsNullOrEmpty(userIdString) && (role == "Player" || role == "Organizer"))
        {
            var userId = int.Parse(userIdString);
            var user = await _context.Users.FindAsync(userId);
            if (user?.CollegeId != null)
            {
                query = query.Where(e => e.CollegeId == user.CollegeId);
            }
        }

        if (!string.IsNullOrEmpty(q))
        {
            query = query.Where(e => (e.Name != null && e.Name.Contains(q)) || 
                                     (e.Description != null && e.Description.Contains(q)) || 
                                     (e.College != null && e.College.Name != null && e.College.Name.Contains(q)));
        }

        var events = await query
            .Select(e => new GetEventDTO
            {
                Id = e.EventId,
                Name = e.Name,
                Description = e.Description,
                StartDate = e.StartDate,
                EndDate = e.EndDate,
                CollegeId = e.CollegeId,
                CollegeName = e.College != null ? e.College.Name : "N/A",
                Status = e.Status ?? "RegistrationOpen",
                Sports = e.Sports.Select(s => new EventSportDTO { SportId = s.SportId, Name = s.Name }).ToList()
            })
            .ToListAsync();

        return Ok(events);
    }

    // 🔹 GET EVENTS BY COLLEGE (Organizer only sees their college)
    [HttpGet("college/{collegeId}")]
    [Authorize(Roles = "SuperAdmin,Organizer")]
    public async Task<IActionResult> GetByCollege(int collegeId)
    {
        var events = await _context.Events
            .Include(e => e.Sports)
            .Where(e => e.CollegeId == collegeId)
            .Select(e => new GetEventDTO
            {
                Id = e.EventId,
                Name = e.Name,
                Description = e.Description,
                StartDate = e.StartDate,
                EndDate = e.EndDate,
                CollegeId = e.CollegeId,
                Status = e.Status ?? "RegistrationOpen",
                Sports = e.Sports.Select(s => new EventSportDTO { SportId = s.SportId, Name = s.Name }).ToList()
            })
            .ToListAsync();

        return Ok(events);
    }

    // 🔹 GET EVENT BY ID
    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int id)
    {
        var ev = await _context.Events
            .Include(e => e.College)
            .Include(e => e.Sports)
            .FirstOrDefaultAsync(e => e.EventId == id);

        if (ev == null) return NotFound();

        var dto = new GetEventDTO
        {
            Id = ev.EventId,
            Name = ev.Name,
            Description = ev.Description,
            StartDate = ev.StartDate,
            EndDate = ev.EndDate,
            CollegeId = ev.CollegeId,
            CollegeName = ev.College?.Name,
            Status = ev.Status,
            Sports = ev.Sports.Select(s => new EventSportDTO { SportId = s.SportId, Name = s.Name }).ToList()
        };

        return Ok(dto);
    }

    // 🔹 CREATE EVENT (Organizer/SuperAdmin only)
    [HttpPost]
    [Authorize(Roles = "SuperAdmin,Organizer")]
    public async Task<IActionResult> Create([FromBody] CreateEventDTO dto)
    {
        var userIdString = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdString)) return Unauthorized();

        var userId = int.Parse(userIdString);
        var user = await _context.Users.FindAsync(userId);
        
        if (user == null) return Unauthorized();

        // 🔹 7-EVENT LIMIT CHECK
        var activeStatus = new[] { "Draft", "Upcoming", "RegistrationOpen", "Ongoing" };
        var activeCount = await _context.Events
            .Where(e => e.CollegeId == user.CollegeId && activeStatus.Contains(e.Status))
            .CountAsync();

        if (activeCount >= 7)
            return BadRequest(new { message = "Limit reached: A college can only have maximum 7 active events at a time. Please complete existing events first." });

        // 🔹 UNIQUE NAME CHECK
        var nameExists = await _context.Events.AnyAsync(e => e.Name == dto.Name);
        if (nameExists)
            return BadRequest(new { message = "An event with this name already exists. Please choose a unique name." });

        var newEvent = new Event
        {
            Name = dto.Name,
            Description = dto.Description,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            MaxSports = dto.MaxSports,
            CollegeId = user.CollegeId, // Auto-assign to organizer's college
            Status = "Draft",
            CreatedAt = DateTime.Now
        };

        await _context.Events.AddAsync(newEvent);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Event created successfully", eventId = newEvent.EventId });
    }

    // 🔹 UPDATE EVENT STATUS
    [HttpPatch("{id}/status")]
    [Authorize(Roles = "SuperAdmin,Organizer")]
    public async Task<IActionResult> UpdateStatus(int id, [FromQuery] string status)
    {
        var @event = await _context.Events.FindAsync(id);
        if (@event == null) return NotFound();

        var userIdString = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
        if (role == "Organizer")
        {
            var user = await _context.Users.FindAsync(int.Parse(userIdString));
            if (user == null || @event.CollegeId != user.CollegeId)
                return Forbid("You can only update events from your own college");
        }

        @event.Status = status;
        await _context.SaveChangesAsync();
        return Ok(new { message = $"Event moved to {status}" });
    }

    // 🔹 DELETE EVENT
    [HttpDelete("{id}")]
    [Authorize(Roles = "SuperAdmin,Organizer")]
    public async Task<IActionResult> Delete(int id)
    {
        var @event = await _context.Events.FindAsync(id);
        if (@event == null) return NotFound();

        var userIdString = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
        if (role == "Organizer")
        {
            var user = await _context.Users.FindAsync(int.Parse(userIdString));
            if (user == null || @event.CollegeId != user.CollegeId)
                return Forbid("You can only delete events from your own college");
        }

        _context.Events.Remove(@event);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Event deleted successfully" });
    }
}