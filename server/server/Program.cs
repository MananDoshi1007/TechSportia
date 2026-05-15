using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using Microsoft.OpenApi.Models;
using server.Models;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

//  Controllers
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

//  Swagger with JWT Auth Button
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "TechSportia API", Version = "v1" });

    //  Add JWT Auth in Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter: Bearer YOUR_TOKEN"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

//  DB Connection
builder.Services.AddDbContext<TechsportiaDbContext>(
    options => options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"))
);

//  JWT Config
var key = builder.Configuration["Jwt:Key"];

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;

    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,

        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],

        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(key ?? "TechSportiaDefaultSecretKey123!")
        )
    };
});

builder.Services.AddAuthorization();

// CORS — allow React client
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactClient", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// 🚀 Seed Super Admin
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var context = services.GetRequiredService<TechsportiaDbContext>();
    var config = services.GetRequiredService<IConfiguration>();

    var adminEmail = config["SuperAdmin:Email"];
    
    // Check if SuperAdmin already exists
    if (!context.Users.Any(u => u.Email == adminEmail || u.Role == "SuperAdmin"))
    {
        var admin = new User
        {
            FullName = config["SuperAdmin:Name"],
            Email = adminEmail,
            Password = BCrypt.Net.BCrypt.HashPassword(config["SuperAdmin:Password"]),
            Role = "SuperAdmin",
            CollegeId = null, // Super Admin doesn't belong to a college
            IsActive = true,
            CreatedAt = DateTime.Now
        };

        context.Users.Add(admin);
        context.SaveChanges();
        Console.WriteLine("✅ SuperAdmin seeded successfully.");
    }
}

//  Swagger UI
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "TechSportia API V1");
    c.RoutePrefix = string.Empty;
});

//  Middleware
app.UseCors("AllowReactClient");
// app.UseHttpsRedirection(); // Disabled for local dev to prevent header issues

app.UseAuthentication();  //  MUST FIRST
app.UseAuthorization();

app.MapControllers();

app.Run();