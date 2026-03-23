using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TechSportia.Models
{
    public class Team
    {
        public int TeamId { get; set; }

        [Required]
        public string TeamName { get; set; }

        public int SportId { get; set; }
        public Sport Sport { get; set; }

        public bool IsApproved { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}
