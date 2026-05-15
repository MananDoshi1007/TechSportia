using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Models;
using server.DTOs.College;
using BCrypt.Net;

[ApiController]
[Route("api/[controller]")]
public class CollegeController : ControllerBase
{
    private readonly TechsportiaDbContext _context;

    public CollegeController(TechsportiaDbContext context)
    {
        _context = context;
    }

    // 🔹 GET ALL COLLEGES (SuperAdmin sees all)
    [HttpGet]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<IActionResult> GetAll()
    {
        var colleges = await _context.Colleges
            .Select(c => new
            {
                c.CollegeId,
                c.Name,
                c.Email,
                c.ContactNumber,
                c.Address,
                c.IsApproved,
                c.CreatedAt
            })
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

        return Ok(colleges);
    }

    // 🔹 GET PUBLIC LIST (For Registration Dropdown)
    [HttpGet("public-list")]
    [AllowAnonymous]
    public async Task<IActionResult> GetPublicList()
    {
        var colleges = await _context.Colleges
            .Where(c => c.IsApproved == true)
            .Select(c => new { c.CollegeId, c.Name })
            .ToListAsync();
        return Ok(colleges);
    }

    // 🔹 GET COLLEGE BY ID (Logged-in users)
    [HttpGet("{id}")]
    [Authorize]
    public async Task<IActionResult> GetById(int id)
    {
        var college = await _context.Colleges.FindAsync(id);

        if (college == null)
            return NotFound();

        return Ok(college);
    }

    // 🔹 CREATE COLLEGE & INITIAL ORGANIZER (SuperAdmin only)
    [HttpPost]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<IActionResult> Create([FromBody] CreateCollegeDTO dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        // Check if college email exists
        if (await _context.Colleges.AnyAsync(c => c.Email == dto.Email))
            return BadRequest("College with this email already exists.");

        // Check if admin email exists in Users table
        if (await _context.Users.AnyAsync(u => u.Email == dto.AdminEmail))
            return BadRequest("An account with the administrator email already exists.");

        // 1. Create College
        var college = new College
        {
            Name = dto.Name,
            Email = dto.Email,
            ContactNumber = dto.ContactNumber,
            Address = dto.Address,
            IsApproved = true,
            CreatedAt = DateTime.Now
        };

        await _context.Colleges.AddAsync(college);
        await _context.SaveChangesAsync();

        // 2. Create Initial Organizer User
        var user = new User
        {
            FullName = dto.AdminName,
            Email = dto.AdminEmail,
            Password = BCrypt.Net.BCrypt.HashPassword(dto.AdminPassword),
            Role = "Organizer",
            CollegeId = college.CollegeId,
            IsActive = true,
            CreatedAt = DateTime.Now
        };

        await _context.Users.AddAsync(user);
        await _context.SaveChangesAsync();

        return Ok(new { 
            message = "College and Coordinator account created successfully", 
            collegeId = college.CollegeId,
            coordinatorEmail = dto.AdminEmail 
        });
    }

    // 🔹 APPROVE/TOGGLE COLLEGE (SuperAdmin only)
    [HttpPatch("{id}/toggle-approval")]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<IActionResult> ToggleApproval(int id)
    {
        var college = await _context.Colleges.FindAsync(id);
        if (college == null) return NotFound();
        college.IsApproved = !(college.IsApproved ?? false);
        await _context.SaveChangesAsync();
        return Ok(new { message = $"College {(college.IsApproved == true ? "approved" : "suspended")} successfully" });
    }

    // 🔹 DELETE COLLEGE & ALL ASSOCIATED DATA (SuperAdmin only)
    [HttpDelete("{id}")]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<IActionResult> Delete(int id)
    {
        var college = await _context.Colleges.FindAsync(id);
        if (college == null) return NotFound();

        // 1. Get all events for this college
        var eventIds = await _context.Events
            .Where(e => e.CollegeId == id)
            .Select(e => e.EventId)
            .ToListAsync();

        // 2. Get all sports under those events
        var sportIds = await _context.Sports
            .Where(s => eventIds.Contains(s.EventId ?? 0))
            .Select(s => s.SportId)
            .ToListAsync();

        // 3. Delete Results linked to those sports
        var results = await _context.Results.Where(r => sportIds.Contains(r.SportId ?? 0)).ToListAsync();
        _context.Results.RemoveRange(results);

        // 4. Delete Scores linked to those sports
        var scores = await _context.Scores.Where(s => sportIds.Contains(s.SportId ?? 0)).ToListAsync();
        _context.Scores.RemoveRange(scores);

        // 5. Delete Individual Registrations
        var indRegs = await _context.IndividualRegistrations.Where(r => sportIds.Contains(r.SportId ?? 0)).ToListAsync();
        _context.IndividualRegistrations.RemoveRange(indRegs);

        // 6. Delete Team Members, then Teams
        var teamIds = await _context.Teams.Where(t => sportIds.Contains(t.SportId ?? 0)).Select(t => t.TeamId).ToListAsync();
        var teamMembers = await _context.TeamMembers.Where(tm => teamIds.Contains(tm.TeamId ?? 0)).ToListAsync();
        _context.TeamMembers.RemoveRange(teamMembers);

        var teams = await _context.Teams.Where(t => teamIds.Contains(t.TeamId)).ToListAsync();
        _context.Teams.RemoveRange(teams);

        // 7. Delete Sports
        var sports = await _context.Sports.Where(s => sportIds.Contains(s.SportId)).ToListAsync();
        _context.Sports.RemoveRange(sports);

        // 8. Delete Events
        var events = await _context.Events.Where(e => eventIds.Contains(e.EventId)).ToListAsync();
        _context.Events.RemoveRange(events);

        // 9. Delete Users belonging to this college
        var users = await _context.Users.Where(u => u.CollegeId == id).ToListAsync();
        _context.Users.RemoveRange(users);

        // 10. Finally delete the college
        _context.Colleges.Remove(college);
        await _context.SaveChangesAsync();

        return Ok(new { message = "College and all associated data deleted successfully" });
    }
}