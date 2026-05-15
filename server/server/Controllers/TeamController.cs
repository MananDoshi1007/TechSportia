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
    [Authorize(Roles = "Player")]
    public async Task<IActionResult> Create(string teamName, int sportId)
    {
        var cleanTeamName = teamName?.Trim();
        if (string.IsNullOrWhiteSpace(cleanTeamName))
            return BadRequest(new { message = "Team name is required." });

        var userIdString = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdString)) return Unauthorized();

        var userId = int.Parse(userIdString);
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return Unauthorized();

        var sport = await _context.Sports
            .Include(s => s.Event)
            .FirstOrDefaultAsync(s => s.SportId == sportId);

        if (sport == null || sport.Event == null)
            return BadRequest("Invalid sport");

        var normalizedTeamName = cleanTeamName.ToLower();
        var teamNameExists = await _context.Teams.AnyAsync(t =>
            t.TeamName != null &&
            t.TeamName.ToLower() == normalizedTeamName &&
            t.Sport != null &&
            t.Sport.Event != null &&
            t.Sport.Event.CollegeId == sport.Event.CollegeId);

        if (teamNameExists)
            return BadRequest(new { message = "A team with this name already exists in your college." });

        if (sport.Event.Status != "RegistrationOpen")
            return BadRequest("Registration is not open for this event");

        if (user.CollegeId != sport.Event.CollegeId)
            return BadRequest("You can only join events from your own college");

        // 🔹 CONFLICT CHECK (Same Date & Time)
        if (sport.StartDate != null && !string.IsNullOrEmpty(sport.StartTime))
        {
            var individualConflict = await _context.IndividualRegistrations
                .Include(r => r.Sport)
                .AnyAsync(r => r.UserId == userId && 
                               r.Sport != null &&
                               r.Sport.StartDate == sport.StartDate && 
                               r.Sport.StartTime == sport.StartTime);

            var teamConflict = await _context.TeamMembers
                .Include(tm => tm.Team)
                .ThenInclude(t => t!.Sport)
                .AnyAsync(tm => tm.UserId == userId && 
                                tm.Team != null &&
                                tm.Team.Sport != null &&
                                tm.Team.Sport.StartDate == sport.StartDate && 
                                tm.Team.Sport.StartTime == sport.StartTime);

            if (individualConflict || teamConflict)
                return BadRequest("Schedule Conflict: You are already participating in another sport at the same date and time.");
        }

        // ❌ Already in any team FOR THIS SPORT (Wait, user said already in any team in line 44, I should check if it's sport specific)
        // Re-evaluating: user.alreadyInTeam on line 44 is global.
        var alreadyInTeam = await _context.TeamMembers
            .AnyAsync(tm => tm.UserId == userId && tm.Team.SportId == sportId);

        if (alreadyInTeam)
            return BadRequest("You are already in a team for this sport");

        // Check if user was previously rejected for this sport in any team
        // (Assuming if a user was in a rejected team for this sport, they shouldn't create another one)
        var previouslyRejected = await _context.Teams
            .Include(t => t.TeamMembers)
            .AnyAsync(t => t.SportId == sportId && t.IsApproved == false && t.TeamMembers.Any(tm => tm.UserId == userId));

        if (previouslyRejected)
            return BadRequest("You have been rejected for this sport and cannot register again.");

        var team = new Team
        {
            TeamName = cleanTeamName,
            SportId = sportId,
            IsDraft = true, // 🔹 Start as DRAFT
            IsApproved = null,
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

        return Ok(new { message = "Team created successfully", teamId = team.TeamId });
    }

    // 🔹 ADD MEMBER (Captain only, before approval)
    [HttpPost("add-member")]
    [Authorize]
    public async Task<IActionResult> AddMember(int teamId, int userId)
    {
        var currentUserIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(currentUserIdString)) return Unauthorized();
        var currentUserId = int.Parse(currentUserIdString);

        var team = await _context.Teams
            .Include(t => t.Sport)
            .ThenInclude(s => s.Event)
            .Include(t => t.TeamMembers)
            .ThenInclude(tm => tm.User)
            .FirstOrDefaultAsync(t => t.TeamId == teamId);

        var user = await _context.Users.FindAsync(userId);

        if (team == null || user == null)
            return BadRequest("Invalid data");

        // ❌ No changes after registration (IsDraft = false)
        if (team.IsDraft == false)
            return BadRequest("Team is already registered and pending approval. Cannot modify roster.");

        // ✅ Only captain
        var isCaptain = team.TeamMembers
            .Any(m => m.UserId == currentUserId && m.Role == "Captain");

        if (!isCaptain)
            return Forbid("Only captain can add members");

        // ✅ Only Players can be members
        if (user.Role != "Player") return BadRequest("Only users with the 'Player' role can be added to a team.");

        // 🔹 CONFLICT CHECK for the new member
        if (team.Sport?.StartDate != null && !string.IsNullOrEmpty(team.Sport.StartTime))
        {
            var individualConflict = await _context.IndividualRegistrations
                .Include(r => r.Sport)
                .AnyAsync(r => r.UserId == userId && 
                               r.Sport != null &&
                               r.Sport.StartDate == team.Sport.StartDate && 
                               r.Sport.StartTime == team.Sport.StartTime);

            var teamConflict = await _context.TeamMembers
                .Include(tm => tm.Team)
                .ThenInclude(t => t!.Sport)
                .AnyAsync(tm => tm.UserId == userId && 
                                tm.Team != null &&
                                tm.Team.Sport != null &&
                                tm.Team.Sport.StartDate == team.Sport.StartDate && 
                                tm.Team.Sport.StartTime == team.Sport.StartTime);

            if (individualConflict || teamConflict)
                return BadRequest($"Schedule Conflict: {user.FullName} is already participating in another sport at the same date and time.");
        }

        if (user.CollegeId != team.Sport?.Event?.CollegeId)
            return BadRequest("Different college not allowed");

        if (team.TeamMembers.Any(m => m.UserId == userId))
            return BadRequest("User already in this team");

        var duplicateName = team.TeamMembers.Any(m =>
            !string.IsNullOrWhiteSpace(m.User?.FullName) &&
            !string.IsNullOrWhiteSpace(user.FullName) &&
            string.Equals(m.User.FullName.Trim(), user.FullName.Trim(), StringComparison.OrdinalIgnoreCase));

        if (duplicateName)
            return BadRequest("A player with this name is already in the team.");

        var existsInSameSport = await _context.TeamMembers
            .AnyAsync(tm => tm.UserId == userId && tm.Team.SportId == team.SportId);

        if (existsInSameSport)
            return BadRequest("User already in another team for this sport");

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

        // ❌ No changes after registration (IsDraft = false)
        if (team.IsDraft == false)
            return BadRequest("Team is already registered and pending approval. Cannot modify roster.");

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
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var role = User.FindFirst(ClaimTypes.Role)?.Value;
        if (string.IsNullOrEmpty(userIdString) || role == null) return Unauthorized();
        var userId = int.Parse(userIdString);

        if (role == "Organizer")
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null || user.CollegeId == null) return Unauthorized();

            var teams = await _context.Teams
                .Include(t => t.Sport)
                .Include(t => t.TeamMembers)
                .ThenInclude(tm => tm.User)
                .Where(t => t.Sport.Event.CollegeId == user.CollegeId)
                .Select(t => new
                {
                    t.TeamId,
                    t.TeamName,
                    t.SportId,
                    SportName = t.Sport != null ? t.Sport.Name : "N/A",
                    t.IsApproved,
                    t.IsDraft,
                    MemberCount = t.TeamMembers.Count,
                    Members = t.TeamMembers.Select(m => new {
                        FullName = m.User != null ? m.User.FullName : "N/A",
                        m.Role
                    })
                })
                .ToListAsync();
            return Ok(teams);
        }

        // For Players
        var myTeams = await _context.TeamMembers
            .Where(tm => tm.UserId == userId)
            .Include(tm => tm.Team)
            .ThenInclude(t => t!.Sport)
            .ThenInclude(s => s!.Event)
            .Include(tm => tm.Team)
            .ThenInclude(t => t!.TeamMembers)
            .ThenInclude(m => m.User)
            .Select(tm => new
            {
                TeamId = tm.Team != null ? tm.Team.TeamId : 0,
                TeamName = tm.Team != null ? tm.Team.TeamName : "N/A",
                SportId = tm.Team != null ? tm.Team.SportId : 0,
                SportName = tm.Team != null && tm.Team.Sport != null ? tm.Team.Sport.Name : "N/A",
                EventName = tm.Team != null && tm.Team.Sport != null && tm.Team.Sport.Event != null ? tm.Team.Sport.Event.Name : "N/A",
                IsApproved = tm.Team != null ? tm.Team.IsApproved : null,
                IsDraft = tm.Team != null ? tm.Team.IsDraft : false,
                MyRole = tm.Role,
                Members = tm.Team != null ? tm.Team.TeamMembers.Select(m => new {
                    UserId = m.UserId,
                    FullName = m.User != null ? m.User.FullName : "N/A",
                    Role = m.Role
                }) : null
            })
            .ToListAsync();

        return Ok(myTeams);
    }

    // 🔹 GET MY TEAM FOR A SPECIFIC SPORT
    [HttpGet("sport/{sportId}/my")]
    [Authorize]
    public async Task<IActionResult> GetMyTeamBySport(int sportId)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

        var teamMember = await _context.TeamMembers
            .Include(tm => tm.Team)
            .ThenInclude(t => t.TeamMembers)
            .ThenInclude(m => m.User)
            .FirstOrDefaultAsync(tm => tm.UserId == userId && tm.Team.SportId == sportId);

        if (teamMember == null) return NotFound();

        var team = teamMember.Team;

        return Ok(new
        {
            team.TeamId,
            team.TeamName,
            team.SportId,
            team.IsApproved,
            team.IsDraft,
            Members = team.TeamMembers.Select(m => new
            {
                m.UserId,
                Name = m.User?.FullName,
                m.Role,
                m.User?.Email
            })
        });
    }

    // 🔹 GET TEAM BY ID
    [HttpGet("{id}")]
    [Authorize]
    public async Task<IActionResult> GetById(int id)
    {
        var team = await _context.Teams
            .Include(t => t.Sport)
            .Include(t => t.TeamMembers)
            .ThenInclude(tm => tm.User)
            .FirstOrDefaultAsync(t => t.TeamId == id);

        if (team == null) return NotFound();

        return Ok(new
        {
            team.TeamId,
            team.TeamName,
            team.SportId,
            SportName = team.Sport?.Name,
            team.IsApproved,
            team.IsDraft,
            Members = team.TeamMembers.Select(m => new
            {
                m.UserId,
                Name = m.User?.FullName,
                m.Role,
                m.User?.Email
            })
        });
    }

    // 🔹 APPROVE TEAM (SuperAdmin/Organizer)
    [HttpPut("approve/{teamId}")]
    [Authorize(Roles = "SuperAdmin,Organizer")]
    public async Task<IActionResult> Approve(int teamId)
    {
        var team = await _context.Teams
            .Include(t => t.TeamMembers)
            .Include(t => t.Sport)
            .ThenInclude(s => s.Event)
            .FirstOrDefaultAsync(t => t.TeamId == teamId);

        if (team == null) return NotFound();
        if (team.IsDraft == true) return BadRequest("Cannot approve a team that is still in draft mode.");

        var userIdString = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
        if (role == "Organizer" && userIdString != null)
        {
            var user = await _context.Users.FindAsync(int.Parse(userIdString));
            if (user == null || (team.Sport != null && team.Sport.Event != null && team.Sport.Event.CollegeId != user.CollegeId))
                return Forbid("You can only approve teams for your own college's events");
        }

        var count = team.TeamMembers.Count;

        if (team.Sport != null && team.Sport.MinPlayers != null && count < team.Sport.MinPlayers)
            return BadRequest("Not enough players");

        if (team.Sport != null && team.Sport.MaxPlayers != null && count > team.Sport.MaxPlayers)
            return BadRequest("Too many players");

        team.IsApproved = true;

        await _context.SaveChangesAsync();
        return Ok(new { message = "Team approved" });
    }

    // 🔹 GET ALL TEAMS FOR ORGANIZER'S COLLEGE
    [HttpGet("college")]
    [Authorize(Roles = "SuperAdmin,Organizer")]
    public async Task<IActionResult> GetCollegeTeams()
    {
        var userIdString = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdString)) return Unauthorized();
        var user = await _context.Users.FindAsync(int.Parse(userIdString));
        if (user == null) return Unauthorized();

        var teams = await _context.Teams
            .Include(t => t.Sport)
            .ThenInclude(s => s!.Event)
            .Include(t => t.TeamMembers)
            .ThenInclude(tm => tm.User)
            .Where(t => t.Sport != null && t.Sport.Event != null && t.Sport.Event.CollegeId == user.CollegeId && t.IsDraft != true)
            .Select(t => new
            {
                t.TeamId,
                t.TeamName,
                t.SportId,
                SportName = t.Sport != null ? t.Sport.Name : "N/A",
                t.IsApproved,
                MemberCount = t.TeamMembers.Count,
                Members = t.TeamMembers.Select(tm => new { 
                    FullName = tm.User != null ? tm.User.FullName : "N/A", 
                    tm.Role 
                })
            })
            .ToListAsync();

        return Ok(teams);
    }

    // 🔹 REGISTER TEAM (Move from DRAFT to PENDING)
    [HttpPut("register/{teamId}")]
    [Authorize(Roles = "Player")]
    public async Task<IActionResult> RegisterTeam(int teamId)
    {
        var userIdString = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdString)) return Unauthorized();
        var userId = int.Parse(userIdString);

        var team = await _context.Teams
            .Include(t => t.Sport)
            .Include(t => t.TeamMembers)
            .FirstOrDefaultAsync(t => t.TeamId == teamId);

        if (team == null) return NotFound();
        if (team.IsDraft != true) return BadRequest("Team is already registered or not in draft mode.");

        // Only captain can register
        var isCaptain = team.TeamMembers.Any(m => m.UserId == userId && m.Role == "Captain");
        if (!isCaptain) return Forbid("Only the captain can register the team.");

        if (team.IsDraft == false) return BadRequest("Team is already registered.");

        // Validation
        var count = team.TeamMembers.Count;
        if (team.Sport != null && team.Sport.MinPlayers != null && count < team.Sport.MinPlayers)
            return BadRequest($"Minimum {team.Sport.MinPlayers} players required to register.");

        // Check registration deadline (1 day before start date)
        if (team.Sport?.StartDate != null)
        {
            var deadline = team.Sport.StartDate.Value.AddDays(-1);
            if (DateTime.Now > deadline)
                return BadRequest("Registration deadline has passed (1 day before sport start).");
        }

        team.IsDraft = false; // 🔹 Move to PENDING
        await _context.SaveChangesAsync();

        return Ok(new { message = "Team registered successfully! Now waiting for organizer approval." });
    }

    // 🔹 WITHDRAW REGISTRATION (Move from PENDING back to DRAFT)
    [HttpPut("withdraw/{teamId}")]
    [Authorize(Roles = "Player")]
    public async Task<IActionResult> Withdraw(int teamId)
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdString)) return Unauthorized();
        var userId = int.Parse(userIdString);

        var team = await _context.Teams
            .Include(t => t.TeamMembers)
            .FirstOrDefaultAsync(t => t.TeamId == teamId);

        if (team == null) return NotFound();
        if (team.IsDraft == true) return BadRequest("Team is already in draft mode.");
        if (team.IsApproved == true) return BadRequest("Cannot withdraw an already approved team.");

        // Only captain can withdraw
        var isCaptain = team.TeamMembers.Any(m => m.UserId == userId && m.Role == "Captain");
        if (!isCaptain) return Forbid("Only the captain can withdraw the registration.");

        team.IsDraft = true; // 🔹 Move back to DRAFT
        await _context.SaveChangesAsync();

        return Ok(new { message = "Registration withdrawn. You can now edit your roster again." });
    }

    // 🔹 REJECT/DELETE TEAM (Organizer/SuperAdmin)
    [HttpDelete("{id}")]
    [Authorize(Roles = "SuperAdmin,Organizer")]
    public async Task<IActionResult> Reject(int id)
    {
        var team = await _context.Teams.Include(t => t.Sport).ThenInclude(s => s.Event).FirstOrDefaultAsync(t => t.TeamId == id);
        if (team == null) return NotFound();
        if (team.IsDraft == true) return BadRequest("Cannot reject a team that is still in draft mode.");

        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var role = User.FindFirst(ClaimTypes.Role)?.Value;

        if (string.IsNullOrEmpty(userIdString)) return Unauthorized();

        if (role == "Organizer")
        {
            var user = await _context.Users.FindAsync(int.Parse(userIdString));
            if (user == null || (team.Sport != null && team.Sport.Event != null && team.Sport.Event.CollegeId != user.CollegeId))
                return Forbid("You can only reject teams for your own college's events");
        }

        team.IsApproved = false;
        await _context.SaveChangesAsync();
        return Ok(new { message = "Team rejected" });
    }

    // 🔹 GET TEAMS BY SPORT (Organizer/SuperAdmin)
    [HttpGet("sport/{sportId}")]
    [Authorize(Roles = "SuperAdmin,Organizer")]
    public async Task<IActionResult> GetBySport(int sportId)
    {
        var teams = await _context.Teams
            .Include(t => t.TeamMembers)
            .ThenInclude(tm => tm.User)
            .Where(t => t.SportId == sportId && t.IsApproved == true)
            .Select(t => new
            {
                t.TeamId,
                t.TeamName,
                t.IsApproved,
                MemberCount = t.TeamMembers.Count,
                Members = t.TeamMembers.Select(tm => new { 
                    FullName = tm.User != null ? tm.User.FullName : "N/A", 
                    tm.Role 
                })
            })
            .ToListAsync();

        return Ok(teams);
    }
}
