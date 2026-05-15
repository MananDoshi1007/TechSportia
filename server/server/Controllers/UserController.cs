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

        var email = dto.Email.ToLower().Trim();

        if (await _context.Users.AnyAsync(u => u.Email == email))
            return BadRequest("Email already exists");

        string hashedPassword = BCrypt.Net.BCrypt.HashPassword(dto.Password);

        var user = new User
        {
            FullName = dto.FullName,
            Email = email,
            Password = hashedPassword,
            Role = "Player", // default
            CollegeId = dto.CollegeId,
            PhoneNumber = dto.PhoneNumber,
            YearOfStudy = dto.YearOfStudy,
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
        var email = dto.Email.ToLower().Trim();
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == email);

        if (user == null || user.Password == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.Password))
            return Unauthorized("Invalid credentials");

        var token = GenerateJwtToken(user);

        return Ok(new AuthResponseDTO
        {
            UserId = user.UserId,
            UserName = user.FullName,
            Email = user.Email,
            Role = user.Role,
            CollegeId = user.CollegeId,
            Token = token
        });
    }

    // 🔹 GET ALL USERS (Admin only)
    [HttpGet]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<IActionResult> GetAll()
    {
        var users = await _context.Users
            .Include(u => u.College)
            .Select(u => new GetUserDTO
            {
                Id = u.UserId,
                Name = u.FullName,
                Email = u.Email,
                Role = u.Role,
                CollegeId = u.CollegeId,
                CollegeName = u.College != null ? u.College.Name : "N/A"
            })
            .ToListAsync();

        return Ok(users);
    }

    // 🔹 GET USER BY ID (Any logged-in user)
    [HttpGet("{id}")]
    [Authorize]
    public async Task<IActionResult> GetById(int id)
    {
        var user = await _context.Users
            .Include(u => u.College)
            .FirstOrDefaultAsync(u => u.UserId == id);

        if (user == null)
            return NotFound();

        return Ok(new GetUserDTO
        {
            Id = user.UserId,
            Name = user.FullName,
            Email = user.Email,
            Role = user.Role,
            CollegeId = user.CollegeId,
            CollegeName = user.College != null ? user.College.Name : "N/A",
            PhoneNumber = user.PhoneNumber,
            Department = user.Department,
            YearOfStudy = user.YearOfStudy,
            DateOfBirth = user.DateOfBirth,
            Gender = user.Gender
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
        if (userIdFromToken != id.ToString() && roleFromToken != "SuperAdmin")
            return Forbid("You can only update your own profile");

        //  Allowed
        user.FullName = dto.FullName ?? user.FullName;
        user.Email = dto.Email ?? user.Email;
        user.PhoneNumber = dto.PhoneNumber ?? user.PhoneNumber;
        user.Department = dto.Department ?? user.Department;
        user.YearOfStudy = dto.YearOfStudy ?? user.YearOfStudy;
        user.DateOfBirth = dto.DateOfBirth ?? user.DateOfBirth;
        user.Gender = dto.Gender ?? user.Gender;

        await _context.SaveChangesAsync();

        return Ok(new { message = "User updated successfully" });
    }
    
    // 🔹 CHANGE PASSWORD (Logged-in user)
    [HttpPost("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDTO dto)
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdString)) return Unauthorized();
        
        var user = await _context.Users.FindAsync(int.Parse(userIdString));
        if (user == null || user.Password == null) return NotFound();

        if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.Password))
            return BadRequest(new { message = "Current password is incorrect" });

        user.Password = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Password changed successfully" });
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

        if (roleFromToken != "SuperAdmin")
            return Forbid("Only SuperAdmin can delete users");

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();

        return Ok(new { message = "User deleted successfully" });
    }

    // 🔹 ASSIGN ROLE (Admin only)
    [HttpPost("assign-role")]
    [Authorize(Roles = "SuperAdmin")]
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

    // 🔹 SEARCH USERS (For Team Invites)
    [HttpGet("search")]
    [Authorize]
    public async Task<IActionResult> SearchUsers([FromQuery] string? query)
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdString)) return Unauthorized();
        var currentUserId = int.Parse(userIdString);
        
        var user = await _context.Users.FindAsync(currentUserId);
        if (user == null) return Unauthorized();

        var baseQuery = _context.Users
            .Where(u => u.CollegeId == user.CollegeId && u.UserId != currentUserId && u.Role == "Player");

        if (!string.IsNullOrEmpty(query))
        {
            baseQuery = baseQuery.Where(u => u.FullName.Contains(query) || u.Email.Contains(query));
        }

        var results = await baseQuery
            .Take(10)
            .Select(u => new { u.UserId, Name = u.FullName, u.Email })
            .ToListAsync();

        return Ok(results);
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
            Encoding.UTF8.GetBytes(_config["Jwt:Key"] ?? "super_secret_key_that_is_at_least_32_chars_long")
        );

        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.Now.AddHours(24),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}