using System;
using System.Collections.Generic;

namespace server.Models;

public partial class Event
{
    public int EventId { get; set; }

    public string? Name { get; set; }

    public string? Description { get; set; }

    public string? Status { get; set; }

    public DateTime? StartDate { get; set; }

    public DateTime? EndDate { get; set; }

    public int? CollegeId { get; set; }

    public int? MaxSports { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual College? College { get; set; }

    public virtual ICollection<Sport> Sports { get; set; } = new List<Sport>();
}
