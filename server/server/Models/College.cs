using System;
using System.Collections.Generic;

namespace server.Models;

public partial class College
{
    public int CollegeId { get; set; }

    public string? Name { get; set; }

    public string? Email { get; set; }

    public string? ContactNumber { get; set; }

    public string? Address { get; set; }

    public bool? IsApproved { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual ICollection<Event> Events { get; set; } = new List<Event>();

    public virtual ICollection<User> Users { get; set; } = new List<User>();
}
