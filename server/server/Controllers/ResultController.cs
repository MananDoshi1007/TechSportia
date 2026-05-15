using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Models;
using server.DTOs.Result;

namespace server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ResultController : ControllerBase
{
    private readonly TechsportiaDbContext _context;

    public ResultController(TechsportiaDbContext context)
    {
        _context = context;
    }

    // 🔹 GET RESULTS FOR EVENT
    [HttpGet("event/{eventId}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetByEvent(int eventId)
    {
        var results = await _context.Results
            .Include(r => r.Sport)
            .Include(r => r.Team)
            .Include(r => r.User)
            .Where(r => r.Sport != null && r.Sport.EventId == eventId)
            .Select(r => new {
                r.ResultId,
                SportName = r.Sport != null ? r.Sport.Name : "N/A",
                r.Rank,
                WinnerName = r.Team != null ? r.Team.TeamName : (r.User != null ? r.User.FullName : "N/A"),
                r.AwardName
            })
            .ToListAsync();
        return Ok(results);
    }

    // 🔹 PUBLISH RESULT (Organizer only)
    [HttpPost("publish")]
    [Authorize(Roles = "SuperAdmin,Organizer")]
    public async Task<IActionResult> Publish([FromBody] Result result)
    {
        result.PublishedAt = DateTime.Now;
        await _context.Results.AddAsync(result);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Result published successfully" });
    }

    // 🔹 BULK PUBLISH RESULTS (Organizer only)
    [HttpPost("bulk-publish")]
    [Authorize(Roles = "SuperAdmin,Organizer")]
    public async Task<IActionResult> BulkPublish([FromBody] BulkPublishResultDTO dto)
    {
        if (dto.Winners == null || !dto.Winners.Any())
            return BadRequest("No winners provided");

        var sport = await _context.Sports.Include(s => s.Event).FirstOrDefaultAsync(s => s.SportId == dto.SportId);
        if (sport == null) return NotFound("Sport not found");

        // Authorization check
        var userIdString = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
        if (role == "Organizer")
        {
            var user = await _context.Users.FindAsync(int.Parse(userIdString));
            if (user == null || sport.Event?.CollegeId != user.CollegeId)
                return Forbid("You can only publish results for your own college's events");
        }

        // Delete existing results for this sport before publishing new ones (to allow updates)
        var existingResults = await _context.Results.Where(r => r.SportId == dto.SportId).ToListAsync();
        _context.Results.RemoveRange(existingResults);

        var results = dto.Winners.Select(w => new Result
        {
            SportId = dto.SportId,
            UserId = w.UserId,
            TeamId = w.TeamId,
            Rank = w.Rank,
            AwardName = w.AwardName,
            PublishedAt = DateTime.Now
        });

        await _context.Results.AddRangeAsync(results);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Results published successfully" });
    }
}
