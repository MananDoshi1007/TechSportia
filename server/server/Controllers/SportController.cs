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

        var sportName = dto.Name?.Trim();
        if (string.IsNullOrWhiteSpace(sportName))
            return BadRequest(new { message = "Sport name is required." });

        if (dto.StartDate == null)
            return BadRequest(new { message = "Sport start date is required." });

        var sportStartDate = dto.StartDate.Value.Date;
        var sportEndDate = (dto.EndDate ?? dto.StartDate).Value.Date;
        var eventStartDate = @event.StartDate?.Date;
        var eventEndDate = @event.EndDate?.Date;

        if (eventStartDate != null && sportStartDate < eventStartDate.Value)
            return BadRequest(new { message = "Sport date must be within the event start and end dates." });

        if (eventEndDate != null && (sportStartDate > eventEndDate.Value || sportEndDate > eventEndDate.Value))
            return BadRequest(new { message = "Sport date cannot be after the event end date." });

        if (sportEndDate < sportStartDate)
            return BadRequest(new { message = "Sport end date cannot be before sport start date." });

        if (eventStartDate != null && eventEndDate != null && sportEndDate > eventEndDate.Value)
            return BadRequest(new { message = "Sport date must be within the event start and end dates." });

        var sportType = string.IsNullOrWhiteSpace(dto.Type) ? "Individual" : dto.Type.Trim();
        if (sportType == "Team" && (dto.MinPlayers == null || dto.MaxPlayers == null || dto.MinPlayers < 1 || dto.MaxPlayers < 1))
            return BadRequest(new { message = "Team sports require valid min and max players." });

        if (sportType == "Team" && dto.MinPlayers > dto.MaxPlayers)
            return BadRequest(new { message = "Min players cannot exceed max players." });

        var userIdString = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
        if (role == "Organizer" && userIdString != null)
        {
            var user = await _context.Users.FindAsync(int.Parse(userIdString));
            if (user == null || @event.CollegeId != user.CollegeId)
                return Forbid("You can only add sports to events from your own college");
        }

        var normalizedName = sportName.ToLower();
        var nameExists = await _context.Sports.AnyAsync(s =>
            s.EventId == dto.EventId &&
            s.Name != null &&
            s.Name.ToLower() == normalizedName);
        if (nameExists) return BadRequest(new { message = "A sport with this name already exists in this event." });

        var startTime = NormalizeStartTime(dto.StartTime);
        if (string.IsNullOrWhiteSpace(startTime))
            return BadRequest(new { message = "Sport start time is required." });

        if (!TryParseTime(startTime, out var newTime))
            return BadRequest(new { message = "Please enter a valid sport start time." });

        var sameDaySports = await _context.Sports
            .Where(s => s.EventId == dto.EventId && s.StartDate != null && s.StartTime != null)
            .Select(s => new { s.Name, s.StartDate, s.StartTime })
            .ToListAsync();

        var timeConflict = sameDaySports.FirstOrDefault(s =>
            s.StartDate!.Value.Date == sportStartDate &&
            TryParseTime(s.StartTime, out var existingTime) &&
            Math.Abs((existingTime - newTime).TotalMinutes) < 60);

        if (timeConflict != null)
            return BadRequest(new { message = $"Sport time conflicts with '{timeConflict.Name}'. Keep at least a 1-hour gap between sports on the same date." });

        var sport = new Sport
        {
            Name = sportName,
            EventId = dto.EventId,
            Type = sportType,
            MaxPlayers = sportType == "Team" ? dto.MaxPlayers : 1,
            MinPlayers = sportType == "Team" ? dto.MinPlayers : 1,
            Rules = dto.Rules,
            StartTime = startTime,
            StartDate = sportStartDate,
            EndDate = sportEndDate
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

        var sportName = dto.Name?.Trim();
        if (string.IsNullOrWhiteSpace(sportName))
            return BadRequest(new { message = "Sport name is required." });

        if (dto.StartDate == null)
            return BadRequest(new { message = "Sport start date is required." });

        var sportStartDate = dto.StartDate.Value.Date;
        var sportEndDate = (dto.EndDate ?? dto.StartDate).Value.Date;
        var eventStartDate = sport.Event?.StartDate?.Date;
        var eventEndDate = sport.Event?.EndDate?.Date;

        if (eventStartDate != null && sportStartDate < eventStartDate.Value)
            return BadRequest(new { message = "Sport date must be within the event start and end dates." });

        if (eventEndDate != null && (sportStartDate > eventEndDate.Value || sportEndDate > eventEndDate.Value))
            return BadRequest(new { message = "Sport date cannot be after the event end date." });

        if (sportEndDate < sportStartDate)
            return BadRequest(new { message = "Sport end date cannot be before sport start date." });

        var sportType = string.IsNullOrWhiteSpace(dto.Type) ? sport.Type ?? "Individual" : dto.Type.Trim();
        if (sportType == "Team" && (dto.MinPlayers == null || dto.MaxPlayers == null || dto.MinPlayers < 1 || dto.MaxPlayers < 1))
            return BadRequest(new { message = "Team sports require valid min and max players." });

        if (sportType == "Team" && dto.MinPlayers > dto.MaxPlayers)
            return BadRequest(new { message = "Min players cannot exceed max players." });

        var userIdString = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
        if (role == "Organizer" && userIdString != null)
        {
            var user = await _context.Users.FindAsync(int.Parse(userIdString));
            if (user == null || sport.Event?.CollegeId != user.CollegeId)
                return Forbid("You can only update sports from your own college's events");
        }

        if (!string.Equals(sportName, sport.Name, StringComparison.OrdinalIgnoreCase))
        {
            var normalizedName = sportName.ToLower();
            var nameExists = await _context.Sports.AnyAsync(s =>
                s.EventId == sport.EventId &&
                s.SportId != id &&
                s.Name != null &&
                s.Name.ToLower() == normalizedName);
            if (nameExists) return BadRequest(new { message = "A sport with this name already exists in this event." });
        }

        var startTime = NormalizeStartTime(dto.StartTime);
        if (string.IsNullOrWhiteSpace(startTime))
            return BadRequest(new { message = "Sport start time is required." });

        if (!TryParseTime(startTime, out var newTime))
            return BadRequest(new { message = "Please enter a valid sport start time." });

        var sameDaySports = await _context.Sports
            .Where(s => s.EventId == sport.EventId && s.SportId != id && s.StartDate != null && s.StartTime != null)
            .Select(s => new { s.Name, s.StartDate, s.StartTime })
            .ToListAsync();

        var timeConflict = sameDaySports.FirstOrDefault(s =>
            s.StartDate!.Value.Date == sportStartDate &&
            TryParseTime(s.StartTime, out var existingTime) &&
            Math.Abs((existingTime - newTime).TotalMinutes) < 60);

        if (timeConflict != null)
            return BadRequest(new { message = $"Sport time conflicts with '{timeConflict.Name}'. Keep at least a 1-hour gap between sports on the same date." });

        sport.Name = sportName;
        sport.Type = sportType;
        sport.MaxPlayers = sportType == "Team" ? dto.MaxPlayers : 1;
        sport.MinPlayers = sportType == "Team" ? dto.MinPlayers : 1;
        sport.Rules = dto.Rules;
        sport.StartTime = startTime;
        sport.StartDate = sportStartDate;
        sport.EndDate = sportEndDate;

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

    private static string? NormalizeStartTime(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;
        return value.Trim();
    }

    private static bool TryParseTime(string? value, out TimeSpan time)
    {
        time = default;
        if (string.IsNullOrWhiteSpace(value)) return false;

        if (TimeSpan.TryParse(value, out time)) return true;
        if (DateTime.TryParse(value, out var parsed))
        {
            time = parsed.TimeOfDay;
            return true;
        }

        return false;
    }
}
