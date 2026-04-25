using System;
using System.Collections.Generic;

namespace server.Models;

public partial class IndividualRegistration
{
    public int IndividualRegistrationId { get; set; }

    public int? UserId { get; set; }

    public int? SportId { get; set; }

    public bool? IsApproved { get; set; }

    public DateTime? RegisteredAt { get; set; }

    public virtual Sport? Sport { get; set; }

    public virtual User? User { get; set; }
}
