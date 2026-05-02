using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Models;

[ApiController]
[Route("api/[controller]")]
public class CollegeController : ControllerBase
{
    private readonly TechsportiaDbContext _context;

    public CollegeController(TechsportiaDbContext context)
    {
        _context = context;
    }

    // 🔹 GET ALL COLLEGES (Public - for dropdown)
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll()
    {
        var colleges = await _context.Colleges
            .Select(c => new
            {
                c.CollegeId,
                c.Name
            })
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

    // 🔹 CREATE COLLEGE (Admin only)
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] College dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

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

        return Ok(new { message = "College created successfully" });
    }

    // 🔹 UPDATE COLLEGE (Admin only)
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] College dto)
    {
        var college = await _context.Colleges.FindAsync(id);

        if (college == null)
            return NotFound();

        college.Name = dto.Name;
        college.Email = dto.Email;
        college.ContactNumber = dto.ContactNumber;
        college.Address = dto.Address;

        await _context.SaveChangesAsync();

        return Ok(new { message = "College updated successfully" });
    }

    // 🔹 DELETE COLLEGE (Admin only)
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var college = await _context.Colleges.FindAsync(id);

        if (college == null)
            return NotFound();

        _context.Colleges.Remove(college);
        await _context.SaveChangesAsync();

        return Ok(new { message = "College deleted successfully" });
    }
}