using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Models;
using System.Security.Claims;
using server.DTOs.Score;

namespace server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ScoreController : ControllerBase
{
    private readonly TechsportiaDbContext _context;

    public ScoreController(TechsportiaDbContext context)
    {
        _context = context;
    }

    // 🔹 GET SCORES FOR SPORT
    [HttpGet("sport/{sportId}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetBySport(int sportId)
    {
        var scores = await _context.Scores
            .Where(s => s.SportId == sportId)
            .Select(s => new {
                s.ScoreId,
                s.Points,
                s.UpdateAt,
                TeamName = s.Team != null ? s.Team.TeamName : "Individual",
                PlayerName = s.User != null ? s.User.FullName : "Team"
            })
            .ToListAsync();
        return Ok(scores);
    }

    // 🔹 UPDATE OR ADD SCORE (Organizer only)
    [HttpPost("update")]
    [Authorize(Roles = "SuperAdmin,Organizer")]
    public async Task<IActionResult> UpdateScore(int sportId, int? teamId, int? userId, int points)
    {
        var sport = await _context.Sports.Include(s => s.Event).FirstOrDefaultAsync(s => s.SportId == sportId);
        if (sport == null || sport.Event == null) return NotFound("Sport not found");

        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var role = User.FindFirst(ClaimTypes.Role)?.Value;
        if (role == "Organizer")
        {
            var user = await _context.Users.FindAsync(int.Parse(userIdString));
            if (user == null || sport.Event.CollegeId != user.CollegeId)
                return Forbid("You can only update scores for your own college's events");
        }
        
        // Safety: Only ongoing events can have scores updated
        if (sport.Event.Status != "Ongoing")
            return BadRequest("Scores can only be updated for ongoing events.");

        var score = await _context.Scores
            .FirstOrDefaultAsync(s => s.SportId == sportId && s.TeamId == teamId && s.UserId == userId);

        if (score == null)
        {
            score = new Score {
                SportId = sportId,
                TeamId = teamId,
                UserId = userId,
                Points = points,
                UpdateAt = DateTime.Now
            };
            await _context.Scores.AddAsync(score);
        }
        else
        {
            score.Points = points;
            score.UpdateAt = DateTime.Now;
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = "Score updated successfully" });
    }

    // 🔹 BULK UPDATE SCORES (Organizer only)
    [HttpPost("bulk-update")]
    [Authorize(Roles = "SuperAdmin,Organizer")]
    public async Task<IActionResult> BulkUpdate([FromBody] List<BulkScoreDTO> scores)
    {
        if (scores == null || !scores.Any()) return BadRequest("No scores provided");

        var firstSportId = scores.First().SportId;
        var sport = await _context.Sports.Include(s => s.Event).FirstOrDefaultAsync(s => s.SportId == firstSportId);
        if (sport == null || sport.Event == null) return NotFound("Sport not found");

        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var role = User.FindFirst(ClaimTypes.Role)?.Value;
        if (role == "Organizer")
        {
            var user = await _context.Users.FindAsync(int.Parse(userIdString));
            if (user == null || sport.Event.CollegeId != user.CollegeId)
                return Forbid("You can only update scores for your own college's events");
        }

        if (sport.Event.Status != "Ongoing")
            return BadRequest("Scores can only be updated for ongoing events.");

        foreach (var item in scores)
        {
            var score = await _context.Scores
                .FirstOrDefaultAsync(s => s.SportId == item.SportId && s.TeamId == item.TeamId && s.UserId == item.UserId);

            if (score == null)
            {
                score = new Score {
                    SportId = item.SportId,
                    TeamId = item.TeamId,
                    UserId = item.UserId,
                    Points = item.Points,
                    UpdateAt = DateTime.Now
                };
                await _context.Scores.AddAsync(score);
            }
            else
            {
                score.Points = item.Points;
                score.UpdateAt = DateTime.Now;
            }
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = "Scores updated successfully" });
    }
}
