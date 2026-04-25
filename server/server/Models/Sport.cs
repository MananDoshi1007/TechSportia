using System;
using System.Collections.Generic;

namespace server.Models;

public partial class Sport
{
    public int SportId { get; set; }

    public string? Name { get; set; }

    public string? Type { get; set; }

    public string? Rules { get; set; }

    public string? AdditionalDetails { get; set; }

    public int? MinPlayers { get; set; }

    public int? MaxPlayers { get; set; }

    public int? MaxSubstitutes { get; set; }

    public DateTime? RegistrationStartDate { get; set; }

    public DateTime? RegistrationEndDate { get; set; }

    public int? EventId { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual Event? Event { get; set; }

    public virtual ICollection<IndividualRegistration> IndividualRegistrations { get; set; } = new List<IndividualRegistration>();

    public virtual ICollection<Result> Results { get; set; } = new List<Result>();

    public virtual ICollection<Score> Scores { get; set; } = new List<Score>();

    public virtual ICollection<Team> Teams { get; set; } = new List<Team>();
}
