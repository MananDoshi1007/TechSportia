using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Models;

[ApiController]
[Route("api/[controller]")]
public class SportController : ControllerBase
{
    private readonly TechsportiaDbContext _context;

    public SportController(TechsportiaDbContext context)
    {
        _context = context;
    }

    // 🔹 GET ALL SPORTS (Public)
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll()
    {
        var sports = await _context.Sports
            .Select(s => new
            {
                s.SportId,
                s.Name,
                s.EventId,
                s.MaxPlayers,
                s.MinPlayers,
                s.StartDate
            })
            .ToListAsync();

        return Ok(sports);
    }

    // 🔹 GET SPORTS BY EVENT
    [HttpGet("event/{eventId}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetByEvent(int eventId)
    {
        var sports = await _context.Sports
            .Where(s => s.EventId == eventId)
            .ToListAsync();

        return Ok(sports);
    }

    // 🔹 CREATE SPORT (SuperAdmin/Organizer)
    [HttpPost]
    [Authorize(Roles = "SuperAdmin,Organizer")]
    public async Task<IActionResult> Create([FromBody] server.DTOs.Sport.CreateSportDTO dto)
    {
        var @event = await _context.Events.FindAsync(dto.EventId);
        if (@event == null) return BadRequest("Invalid EventId");

        var userIdString = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
        if (role == "Organizer" && userIdString != null)
        {
            var user = await _context.Users.FindAsync(int.Parse(userIdString));
            if (user == null || @event.CollegeId != user.CollegeId)
                return Forbid("You can only add sports to events from your own college");
        }

        var nameExists = await _context.Sports.AnyAsync(s => s.Name == dto.Name && s.EventId == dto.EventId);
        if (nameExists) return BadRequest(new { message = "A sport with this name already exists in this event." });

        var sport = new Sport
        {
            Name = dto.Name,
            EventId = dto.EventId,
            Type = dto.Type,
            MaxPlayers = dto.MaxPlayers,
            MinPlayers = dto.MinPlayers,
            Rules = dto.Rules,
            StartTime = dto.StartTime,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate
        };

        await _context.Sports.AddAsync(sport);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Sport added successfully" });
    }

    // 🔹 UPDATE SPORT
    [HttpPut("{id}")]
    [Authorize(Roles = "SuperAdmin,Organizer")]
    public async Task<IActionResult> Update(int id, [FromBody] server.DTOs.Sport.UpdateSportDTO dto)
    {
        var sport = await _context.Sports.Include(s => s.Event).FirstOrDefaultAsync(s => s.SportId == id);
        if (sport == null) return NotFound();

        var userIdString = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
        if (role == "Organizer" && userIdString != null)
        {
            var user = await _context.Users.FindAsync(int.Parse(userIdString));
            if (user == null || sport.Event?.CollegeId != user.CollegeId)
                return Forbid("You can only update sports from your own college's events");
        }

        if (dto.Name != sport.Name)
        {
            var nameExists = await _context.Sports.AnyAsync(s => s.Name == dto.Name && s.EventId == sport.EventId && s.SportId != id);
            if (nameExists) return BadRequest(new { message = "A sport with this name already exists in this event." });
        }

        sport.Name = dto.Name;
        sport.MaxPlayers = dto.MaxPlayers;
        sport.MinPlayers = dto.MinPlayers;
        sport.Rules = dto.Rules;
        sport.StartTime = dto.StartTime;
        sport.StartDate = dto.StartDate;
        sport.EndDate = dto.EndDate;

        await _context.SaveChangesAsync();
        return Ok(new { message = "Sport updated successfully" });
    }

    // 🔹 DELETE SPORT (SuperAdmin/Organizer)
    [HttpDelete("{id}")]
    [Authorize(Roles = "SuperAdmin,Organizer")]
    public async Task<IActionResult> Delete(int id)
    {
        var sport = await _context.Sports.Include(s => s.Event).FirstOrDefaultAsync(s => s.SportId == id);
        if (sport == null) return NotFound();

        var userIdString = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
        if (role == "Organizer" && userIdString != null)
        {
            var user = await _context.Users.FindAsync(int.Parse(userIdString));
            if (user == null || sport.Event?.CollegeId != user.CollegeId)
                return Forbid("You can only delete sports from your own college's events");
        }

        _context.Sports.Remove(sport);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Sport deleted successfully" });
    }
}
