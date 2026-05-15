using System;
using System.Collections.Generic;

namespace server.Models;

public partial class Sport
{
    public int SportId { get; set; }
    public string? Name { get; set; }
    public int? EventId { get; set; }
    
    // 🔹 RESTORED & NEW FIELDS
    public string? Type { get; set; } // Individual or Team
    public int? MaxPlayers { get; set; }
    public int? MinPlayers { get; set; }
    public string? Rules { get; set; }
    public DateTime? RegistrationStartDate { get; set; }
    public DateTime? RegistrationEndDate { get; set; }
    public string? StartTime { get; set; } // e.g. "10:00 AM"
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public DateTime? CreatedAt { get; set; }

    public virtual Event? Event { get; set; }
    public virtual ICollection<IndividualRegistration> IndividualRegistrations { get; set; } = new List<IndividualRegistration>();
    public virtual ICollection<TeamMember> TeamMembers { get; set; } = new List<TeamMember>();
    public virtual ICollection<Team> Teams { get; set; } = new List<Team>();
    
    // 🔹 Relationship fields for database context
    public virtual ICollection<Result> Results { get; set; } = new List<Result>();
    public virtual ICollection<Score> Scores { get; set; } = new List<Score>();
}
