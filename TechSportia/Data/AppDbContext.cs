using Microsoft.EntityFrameworkCore;
using TechSportia.Models;

namespace TechSportia.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        { }

        public DbSet<College> Colleges { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Event> Events { get; set; }
        public DbSet<Sport> Sports { get; set; }
        public DbSet<Team> Teams { get; set; }
        public DbSet<TeamMember> TeamMembers { get; set; }
        public DbSet<IndividualRegistration> IndividualRegistrations { get; set; }
        public DbSet<Score> Scores { get; set; }
        public DbSet<Result> Results { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Unique Email for College
            modelBuilder.Entity<College>()
                .HasIndex(c => c.Email)
                .IsUnique();

            // Unique Email for User
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            // Unique Players: Prevent same user joining same team multiple times
            modelBuilder.Entity<TeamMember>()
                .HasIndex(tm => new { tm.TeamId, tm.UserId })
                .IsUnique();

            // Unique Players: Prevent duplicate registration
            modelBuilder.Entity<IndividualRegistration>()
                .HasIndex(ir => new { ir.UserId, ir.SportId })
                .IsUnique();

            //Prevent duplicate positions
            modelBuilder.Entity<Result>()
                .HasIndex(r => new { r.SportId, r.Position })
                .IsUnique();

            // Store Enum as string
            modelBuilder.Entity<User>()
                .Property(u => u.Role)
                .HasConversion<string>();

            // Store Enum as string
            modelBuilder.Entity<Event>()
                .Property(e => e.Status)
                .HasConversion<string>();

            // Store Enum as string
            modelBuilder.Entity<Sport>()
                .Property(s => s.Type)
                .HasConversion<string>();

            // Store Enum as string
            modelBuilder.Entity<TeamMember>()
                .Property(tm => tm.Role)
                .HasConversion<string>();


        }
    }
}
