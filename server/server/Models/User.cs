using System;
using System.Collections.Generic;

namespace server.Models;

public partial class User
{
    public int UserId { get; set; }
    public string? FullName { get; set; }
    public string? Email { get; set; }
    public string? Password { get; set; }
    public string? Role { get; set; }
    public int? CollegeId { get; set; }
    
    // 🔹 NEW PROFILE FIELDS
    public string? PhoneNumber { get; set; }
    public string? Department { get; set; }
    public string? YearOfStudy { get; set; } // e.g. "1st Year"
    public DateTime? DateOfBirth { get; set; }
    public string? Gender { get; set; }

    public bool? IsActive { get; set; }
    public DateTime? CreatedAt { get; set; }

    public virtual College? College { get; set; }
    public virtual ICollection<IndividualRegistration> IndividualRegistrations { get; set; } = new List<IndividualRegistration>();
    public virtual ICollection<Result> Results { get; set; } = new List<Result>();
    public virtual ICollection<Score> Scores { get; set; } = new List<Score>();
    public virtual ICollection<TeamMember> TeamMembers { get; set; } = new List<TeamMember>();
}
