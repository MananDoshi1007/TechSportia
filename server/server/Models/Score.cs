using System;
using System.Collections.Generic;

namespace server.Models;

public partial class Score
{
    public int ScoreId { get; set; }

    public int? SportId { get; set; }

    public int? UserId { get; set; }

    public int? TeamId { get; set; }

    public double? Value { get; set; }

    public int? Rank { get; set; }

    public virtual Sport? Sport { get; set; }

    public virtual Team? Team { get; set; }

    public virtual User? User { get; set; }
}
