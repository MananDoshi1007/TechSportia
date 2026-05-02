using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using server.DTOs.Auth;
using server.DTOs.User;
using server.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly TechsportiaDbContext _context;
    private readonly IConfiguration _config;

    public UserController(TechsportiaDbContext context, IConfiguration config)
    {
        _context = context;
        _config = config;
    }

    // 🔹 REGISTER (Public)
    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<IActionResult> Register([FromBody] CreateUserDTO dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
            return BadRequest("Email and Password are required");

        if (!dto.Email.Contains("@"))
            return BadRequest("Invalid email format");

        var collegeExists = await _context.Colleges
            .AnyAsync(c => c.CollegeId == dto.CollegeId);

        if (!collegeExists)
            return BadRequest("Invalid CollegeId");

        if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
            return BadRequest("Email already exists");

        string hashedPassword = BCrypt.Net.BCrypt.HashPassword(dto.Password);

        var user = new User
        {
            FullName = dto.Name,
            Email = dto.Email,
            Password = hashedPassword,
            Role = "Player", // default
            CollegeId = dto.CollegeId,
            CreatedAt = DateTime.Now,
            IsActive = true
        };

        await _context.Users.AddAsync(user);
        await _context.SaveChangesAsync();

        return Ok(new { message = "User registered successfully" });
    }

    // 🔹 LOGIN (Public)
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginUserDTO dto)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == dto.Email);

        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.Password))
            return Unauthorized("Invalid credentials");

        var token = GenerateJwtToken(user);

        return Ok(new AuthResponseDTO
        {
            UserName = user.FullName,
            Role = user.Role,
            Token = token
        });
    }

    // 🔹 GET ALL USERS (Admin only)
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll()
    {
        var users = await _context.Users
            .Select(u => new GetUserDTO
            {
                Id = u.UserId,
                Name = u.FullName,
                Email = u.Email
            })
            .ToListAsync();

        return Ok(users);
    }

    // 🔹 GET USER BY ID (Any logged-in user)
    [HttpGet("{id}")]
    [Authorize]
    public async Task<IActionResult> GetById(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return NotFound();

        var userIdFromToken = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var roleFromToken = User.FindFirst(ClaimTypes.Role)?.Value;

        if (userIdFromToken != id.ToString() && roleFromToken != "Admin")
            return Forbid("You can only view your own profile");

        return Ok(new GetUserDTO
        {
            Id = user.UserId,
            Name = user.FullName,
            Email = user.Email
        });
    }

    // 🔹 UPDATE USER (Logged-in user)
    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateUserDTO dto)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return NotFound();

        //  Get user info from token
        var userIdFromToken = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var roleFromToken = User.FindFirst(ClaimTypes.Role)?.Value;

        //  Block if not same user AND not admin
        if (userIdFromToken != id.ToString() && roleFromToken != "Admin")
            return Forbid("You can only update your own profile");

        //  Allowed
        user.FullName = dto.Name;
        user.Email = dto.Email;

        await _context.SaveChangesAsync();

        return Ok(new { message = "User updated successfully" });
    }

    // 🔹 DELETE USER (Admin only)
    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return NotFound();

        var userIdFromToken = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var roleFromToken = User.FindFirst(ClaimTypes.Role)?.Value;

        if (roleFromToken != "Admin")
            return Forbid("Only Admin can delete users");

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();

        return Ok(new { message = "User deleted successfully" });
    }

    // 🔹 ASSIGN ROLE (Admin only)
    [HttpPost("assign-role")]
    [Authorize(Roles = "Admin")]
    //[AllowAnonymous]
    public async Task<IActionResult> AssignRole([FromBody] AssignRoleDTO dto)
    {
        var user = await _context.Users.FindAsync(dto.UserId);

        if (user == null)
            return NotFound();

        user.Role = dto.Role;

        await _context.SaveChangesAsync();

        return Ok(new { message = "Role updated successfully" });
    }

    // 🔑 JWT TOKEN
    private string GenerateJwtToken(User user)
    {
        var claims = new[]
        {
        new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()), //  ADD THIS
        new Claim(ClaimTypes.Name, user.FullName ?? ""),
        new Claim(ClaimTypes.Email, user.Email ?? ""),
        new Claim(ClaimTypes.Role, user.Role ?? "")
    };

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_config["Jwt:Key"])
        );

        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.Now.AddHours(2),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}