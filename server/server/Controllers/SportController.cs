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
                s.MinPlayers
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

    // 🔹 CREATE SPORT (Admin/Organizer)
    [HttpPost]
    [Authorize(Roles = "Admin,Organizer")]
    public async Task<IActionResult> Create([FromBody] Sport dto)
    {
        var eventExists = await _context.Events
            .AnyAsync(e => e.EventId == dto.EventId);

        if (!eventExists)
            return BadRequest("Invalid EventId");

        var sport = new Sport
        {
            Name = dto.Name,
            EventId = dto.EventId,
            MaxPlayers = dto.MaxPlayers,
            MinPlayers = dto.MinPlayers
        };

        await _context.Sports.AddAsync(sport);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Sport created successfully" });
    }

    // 🔹 UPDATE SPORT
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Organizer")]
    public async Task<IActionResult> Update(int id, [FromBody] Sport dto)
    {
        var sport = await _context.Sports.FindAsync(id);

        if (sport == null)
            return NotFound();

        sport.Name = dto.Name;
        sport.MaxPlayers = dto.MaxPlayers;
        sport.MinPlayers = dto.MinPlayers;

        await _context.SaveChangesAsync();

        return Ok(new { message = "Sport updated successfully" });
    }

    // 🔹 DELETE SPORT (Admin only)
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var sport = await _context.Sports.FindAsync(id);

        if (sport == null)
            return NotFound();

        _context.Sports.Remove(sport);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Sport deleted successfully" });
    }
}