using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Models;
using System.Security.Claims;

[ApiController]
[Route("api/[controller]")]
public class TeamController : ControllerBase
{
    private readonly TechsportiaDbContext _context;

    public TeamController(TechsportiaDbContext context)
    {
        _context = context;
    }

    // 🔹 CREATE TEAM
    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create(string teamName, int sportId)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

        var user = await _context.Users.FindAsync(userId);

        var sport = await _context.Sports
            .Include(s => s.Event)
            .FirstOrDefaultAsync(s => s.SportId == sportId);

        if (sport == null || sport.Event == null)
            return BadRequest("Invalid sport");

        if (sport.Event.Status != "Ongoing")
            return BadRequest("Event is not active");

        if (user.CollegeId != sport.Event.CollegeId)
            return BadRequest("Different college not allowed");

        // ❌ Already in any team
        var alreadyInTeam = await _context.TeamMembers
            .AnyAsync(tm => tm.UserId == userId);

        if (alreadyInTeam)
            return BadRequest("You are already in a team");

        var team = new Team
        {
            TeamName = teamName,
            SportId = sportId,
            IsApproved = false,
            CreatedAt = DateTime.Now
        };

        await _context.Teams.AddAsync(team);
        await _context.SaveChangesAsync();

        // ✅ Add captain
        var captain = new TeamMember
        {
            TeamId = team.TeamId,
            UserId = userId,
            Role = "Captain"
        };

        await _context.TeamMembers.AddAsync(captain);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Team created successfully" });
    }

    // 🔹 ADD MEMBER (Captain only, before approval)
    [HttpPost("add-member")]
    [Authorize]
    public async Task<IActionResult> AddMember(int teamId, int userId)
    {
        var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

        var team = await _context.Teams
            .Include(t => t.Sport)
            .ThenInclude(s => s.Event)
            .Include(t => t.TeamMembers)
            .FirstOrDefaultAsync(t => t.TeamId == teamId);

        var user = await _context.Users.FindAsync(userId);

        if (team == null || user == null)
            return BadRequest("Invalid data");

        // ❌ No changes after approval
        if (team.IsApproved == true)
            return BadRequest("Team already approved, cannot modify");

        // ✅ Only captain
        var isCaptain = team.TeamMembers
            .Any(m => m.UserId == currentUserId && m.Role == "Captain");

        if (!isCaptain)
            return Forbid("Only captain can add members");

        if (user.CollegeId != team.Sport.Event.CollegeId)
            return BadRequest("Different college not allowed");

        if (team.TeamMembers.Any(m => m.UserId == userId))
            return BadRequest("User already in this team");

        var exists = await _context.TeamMembers
            .AnyAsync(tm => tm.UserId == userId);

        if (exists)
            return BadRequest("User already in another team");

        var member = new TeamMember
        {
            TeamId = teamId,
            UserId = userId,
            Role = "Player"
        };

        await _context.TeamMembers.AddAsync(member);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Member added" });
    }

    // 🔹 REMOVE MEMBER (Captain only, before approval)
    [HttpDelete("remove-member")]
    [Authorize]
    public async Task<IActionResult> RemoveMember(int teamId, int userId)
    {
        var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

        var team = await _context.Teams
            .Include(t => t.TeamMembers)
            .FirstOrDefaultAsync(t => t.TeamId == teamId);

        if (team == null)
            return NotFound();

        if (team.IsApproved == true)
            return BadRequest("Team already approved, cannot modify");

        var isCaptain = team.TeamMembers
            .Any(m => m.UserId == currentUserId && m.Role == "Captain");

        if (!isCaptain)
            return Forbid("Only captain can remove members");

        var member = team.TeamMembers
            .FirstOrDefault(m => m.UserId == userId);

        if (member == null)
            return NotFound("Member not found");

        if (member.Role == "Captain")
            return BadRequest("Cannot remove captain");

        _context.TeamMembers.Remove(member);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Member removed" });
    }

    // 🔹 GET MY TEAMS
    [HttpGet("my")]
    [Authorize]
    public async Task<IActionResult> MyTeams()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

        var teams = await _context.TeamMembers
            .Where(tm => tm.UserId == userId)
            .Select(tm => new
            {
                tm.Team.TeamId,
                tm.Team.TeamName,
                tm.Team.SportId,
                tm.Team.IsApproved,
                tm.Role
            })
            .ToListAsync();

        return Ok(teams);
    }

    // 🔹 APPROVE TEAM (Admin/Organizer)
    [HttpPut("approve/{teamId}")]
    [Authorize(Roles = "Admin,Organizer")]
    public async Task<IActionResult> Approve(int teamId)
    {
        var team = await _context.Teams
            .Include(t => t.TeamMembers)
            .Include(t => t.Sport)
            .FirstOrDefaultAsync(t => t.TeamId == teamId);

        if (team == null)
            return NotFound();

        var count = team.TeamMembers.Count;

        if (team.Sport.MinPlayers != null && count < team.Sport.MinPlayers)
            return BadRequest("Not enough players");

        if (team.Sport.MaxPlayers != null && count > team.Sport.MaxPlayers)
            return BadRequest("Too many players");

        team.IsApproved = true;

        await _context.SaveChangesAsync();

        return Ok(new { message = "Team approved" });
    }
}