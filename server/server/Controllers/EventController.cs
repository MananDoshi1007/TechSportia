using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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

    // 🔹 GET ALL EVENTS (Public)
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll()
    {
        var events = await _context.Events
            .Select(e => new
            {
                e.EventId,
                e.Name,
                e.Status,
                e.StartDate,
                e.EndDate,
                e.CollegeId
            })
            .ToListAsync();

        return Ok(events);
    }

    // 🔥 NEW: GET ACTIVE EVENTS
    [HttpGet("active")]
    [AllowAnonymous]
    public async Task<IActionResult> GetActive()
    {
        var events = await _context.Events
            .Where(e => e.Status == "Upcoming" || e.Status == "Ongoing")
            .ToListAsync();

        return Ok(events);
    }

    // 🔹 GET EVENT BY ID
    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int id)
    {
        var ev = await _context.Events
            .Include(e => e.Sports)
            .FirstOrDefaultAsync(e => e.EventId == id);

        if (ev == null)
            return NotFound();

        return Ok(ev);
    }

    // 🔹 CREATE EVENT
    [HttpPost]
    [Authorize(Roles = "Admin,Organizer")]
    public async Task<IActionResult> Create([FromBody] Event dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var collegeExists = await _context.Colleges
            .AnyAsync(c => c.CollegeId == dto.CollegeId);

        if (!collegeExists)
            return BadRequest("Invalid CollegeId");

        var ev = new Event
        {
            Name = dto.Name,
            Description = dto.Description,
            Status = "Upcoming", // ✅ default
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            CollegeId = dto.CollegeId,
            MaxSports = dto.MaxSports,
            CreatedAt = DateTime.Now
        };

        await _context.Events.AddAsync(ev);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Event created successfully" });
    }

    // 🔹 UPDATE EVENT
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Organizer")]
    public async Task<IActionResult> Update(int id, [FromBody] Event dto)
    {
        var ev = await _context.Events.FindAsync(id);

        if (ev == null)
            return NotFound();

        ev.Name = dto.Name;
        ev.Description = dto.Description;
        ev.StartDate = dto.StartDate;
        ev.EndDate = dto.EndDate;
        ev.MaxSports = dto.MaxSports;

        await _context.SaveChangesAsync();

        return Ok(new { message = "Event updated successfully" });
    }

    // 🔥 NEW: START EVENT
    [HttpPut("start/{id}")]
    [Authorize(Roles = "Admin,Organizer")]
    public async Task<IActionResult> Start(int id)
    {
        var ev = await _context.Events.FindAsync(id);

        if (ev == null)
            return NotFound();

        ev.Status = "Ongoing";
        await _context.SaveChangesAsync();

        return Ok(new { message = "Event started" });
    }

    // 🔥 NEW: CLOSE EVENT
    [HttpPut("close/{id}")]
    [Authorize(Roles = "Admin,Organizer")]
    public async Task<IActionResult> Close(int id)
    {
        var ev = await _context.Events.FindAsync(id);

        if (ev == null)
            return NotFound();

        ev.Status = "Completed";
        await _context.SaveChangesAsync();

        return Ok(new { message = "Event closed" });
    }

    // 🔹 DELETE EVENT
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var ev = await _context.Events.FindAsync(id);

        if (ev == null)
            return NotFound();

        _context.Events.Remove(ev);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Event deleted successfully" });
    }
}