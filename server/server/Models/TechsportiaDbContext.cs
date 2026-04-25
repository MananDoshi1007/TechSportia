using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace server.Models;

public partial class TechsportiaDbContext : DbContext
{
    public TechsportiaDbContext()
    {
    }

    public TechsportiaDbContext(DbContextOptions<TechsportiaDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<College> Colleges { get; set; }

    public virtual DbSet<Event> Events { get; set; }

    public virtual DbSet<IndividualRegistration> IndividualRegistrations { get; set; }

    public virtual DbSet<Result> Results { get; set; }

    public virtual DbSet<Score> Scores { get; set; }

    public virtual DbSet<Sport> Sports { get; set; }

    public virtual DbSet<Team> Teams { get; set; }

    public virtual DbSet<TeamMember> TeamMembers { get; set; }

    public virtual DbSet<User> Users { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("Data Source=LAPTOP-8TT8N6UR\\SQLEXPRESS;Initial Catalog=TechsportiaDB;Integrated Security=True;Encrypt=False");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<College>(entity =>
        {
            entity.HasKey(e => e.CollegeId).HasName("PK__Colleges__294095397F60ED59");

            entity.HasIndex(e => e.Email, "UQ__Colleges__A9D10534023D5A04").IsUnique();

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Email)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.IsApproved).HasDefaultValue(false);
        });

        modelBuilder.Entity<Event>(entity =>
        {
            entity.HasKey(e => e.EventId).HasName("PK__Events__7944C810117F9D94");

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.EndDate).HasColumnType("datetime");
            entity.Property(e => e.Name)
                .HasMaxLength(150)
                .IsUnicode(false);
            entity.Property(e => e.StartDate).HasColumnType("datetime");
            entity.Property(e => e.Status).HasMaxLength(50);

            entity.HasOne(d => d.College).WithMany(p => p.Events)
                .HasForeignKey(d => d.CollegeId)
                .HasConstraintName("FK_Events_College");
        });

        modelBuilder.Entity<IndividualRegistration>(entity =>
        {
            entity.HasKey(e => e.IndividualRegistrationId).HasName("PK__Individu__B7721C9C29572725");

            entity.Property(e => e.IsApproved).HasDefaultValue(false);
            entity.Property(e => e.RegisteredAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");

            entity.HasOne(d => d.Sport).WithMany(p => p.IndividualRegistrations)
                .HasForeignKey(d => d.SportId)
                .HasConstraintName("FK_IndReg_Sport");

            entity.HasOne(d => d.User).WithMany(p => p.IndividualRegistrations)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK_IndReg_User");
        });

        modelBuilder.Entity<Result>(entity =>
        {
            entity.HasKey(e => e.ResultId).HasName("PK__Results__9769020837A5467C");

            entity.HasOne(d => d.Sport).WithMany(p => p.Results)
                .HasForeignKey(d => d.SportId)
                .HasConstraintName("FK_Results_Sport");

            entity.HasOne(d => d.Team).WithMany(p => p.Results)
                .HasForeignKey(d => d.TeamId)
                .HasConstraintName("FK_Results_Team");

            entity.HasOne(d => d.User).WithMany(p => p.Results)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK_Results_User");
        });

        modelBuilder.Entity<Score>(entity =>
        {
            entity.HasKey(e => e.ScoreId).HasName("PK__Scores__7DD229D130F848ED");

            entity.HasOne(d => d.Sport).WithMany(p => p.Scores)
                .HasForeignKey(d => d.SportId)
                .HasConstraintName("FK_Scores_Sport");

            entity.HasOne(d => d.Team).WithMany(p => p.Scores)
                .HasForeignKey(d => d.TeamId)
                .HasConstraintName("FK_Scores_Team");

            entity.HasOne(d => d.User).WithMany(p => p.Scores)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK_Scores_User");
        });

        modelBuilder.Entity<Sport>(entity =>
        {
            entity.HasKey(e => e.SportId).HasName("PK__Sports__7A41AF3C173876EA");

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.RegistrationEndDate).HasColumnType("datetime");
            entity.Property(e => e.RegistrationStartDate).HasColumnType("datetime");
            entity.Property(e => e.Type).HasMaxLength(50);

            entity.HasOne(d => d.Event).WithMany(p => p.Sports)
                .HasForeignKey(d => d.EventId)
                .HasConstraintName("FK_Sports_Event");
        });

        modelBuilder.Entity<Team>(entity =>
        {
            entity.HasKey(e => e.TeamId).HasName("PK__Teams__123AE7991CF15040");

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.IsApproved).HasDefaultValue(false);

            entity.HasOne(d => d.Sport).WithMany(p => p.Teams)
                .HasForeignKey(d => d.SportId)
                .HasConstraintName("FK_Teams_Sport");
        });

        modelBuilder.Entity<TeamMember>(entity =>
        {
            entity.HasKey(e => e.TeamMemberId).HasName("PK__TeamMemb__C7C092E5239E4DCF");

            entity.Property(e => e.Role).HasMaxLength(50);

            entity.HasOne(d => d.Team).WithMany(p => p.TeamMembers)
                .HasForeignKey(d => d.TeamId)
                .HasConstraintName("FK_TeamMembers_Team");

            entity.HasOne(d => d.User).WithMany(p => p.TeamMembers)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK_TeamMembers_User");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__Users__1788CC4C07F6335A");

            entity.HasIndex(e => e.Email, "UQ__Users__A9D105340AD2A005").IsUnique();

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Email)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.FullName)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.Password)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.Role).HasMaxLength(50);

            entity.HasOne(d => d.College).WithMany(p => p.Users)
                .HasForeignKey(d => d.CollegeId)
                .HasConstraintName("FK_Users_College");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
