using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Models;
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
    [Authorize]
    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Register(int sportId)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

        // ✅ Get user
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
            return Unauthorized();

        // ✅ Get sport with event
        var sport = await _context.Sports
            .Include(s => s.Event)
            .FirstOrDefaultAsync(s => s.SportId == sportId);

        if (sport == null)
            return BadRequest("Invalid SportId");

        if (sport.Event == null)
            return BadRequest("Sport is not linked to any event");

        // 🔥 EVENT STATUS CHECK (IMPORTANT)
        if (sport.Event.Status == "Completed")
            return BadRequest("Event is already completed");

        if (sport.Event.Status == "Upcoming")
            return BadRequest("Event has not started yet");

        // ✅ College restriction
        if (user.CollegeId != sport.Event.CollegeId)
            return BadRequest("You can only register in your own college event");

        // ✅ Prevent duplicate
        var alreadyRegistered = await _context.IndividualRegistrations
            .AnyAsync(r => r.UserId == userId && r.SportId == sportId);

        if (alreadyRegistered)
            return BadRequest("Already registered");

        // 🔥 MAX PLAYER CHECK (only approved users)
        var approvedCount = await _context.IndividualRegistrations
            .CountAsync(r => r.SportId == sportId && r.IsApproved == true);

        if (sport.MaxPlayers != null && approvedCount >= sport.MaxPlayers)
            return BadRequest("Maximum player limit reached");

        // ✅ Create registration
        var reg = new IndividualRegistration
        {
            UserId = userId,
            SportId = sportId,
            IsApproved = false,
            RegisteredAt = DateTime.Now
        };

        await _context.IndividualRegistrations.AddAsync(reg);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Registered successfully (Pending Approval)" });
    }

    // 🔹 GET MY REGISTRATIONS
    [HttpGet("my")]
    [Authorize]
    public async Task<IActionResult> MyRegistrations()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

        var data = await _context.IndividualRegistrations
            .Where(r => r.UserId == userId)
            .Select(r => new
            {
                r.IndividualRegistrationId,
                r.SportId,
                SportName = r.Sport.Name,
                r.IsApproved,
                r.RegisteredAt
            })
            .ToListAsync();

        return Ok(data);
    }

    // 🔹 GET PARTICIPANTS BY SPORT (Organizer/Admin)
    [HttpGet("sport/{sportId}")]
    [Authorize(Roles = "Admin,Organizer")]
    public async Task<IActionResult> GetParticipants(int sportId)
    {
        var users = await _context.IndividualRegistrations
            .Where(r => r.SportId == sportId)
            .Select(r => new
            {
                r.User.UserId,
                r.User.FullName,
                r.User.Email,
                r.IsApproved
            })
            .ToListAsync();

        return Ok(users);
    }

    // 🔹 APPROVE REGISTRATION (Admin/Organizer)
    [HttpPut("approve/{id}")]
    [Authorize(Roles = "Admin,Organizer")]
    public async Task<IActionResult> Approve(int id)
    {
        var reg = await _context.IndividualRegistrations.FindAsync(id);

        if (reg == null)
            return NotFound();

        reg.IsApproved = true;

        await _context.SaveChangesAsync();

        return Ok(new { message = "Registration approved" });
    }
}