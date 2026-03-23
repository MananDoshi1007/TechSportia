using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TechSportia.Models
{
    public class Result
    {
        public int ResultId { get; set; }

        // 🔹 Relation with Sport
        [Required]
        public int SportId { get; set; }

        [ForeignKey("SportId")]
        public Sport Sport { get; set; }

        // 🔹 For Individual Sport
        public int? UserId { get; set; }

        [ForeignKey("UserId")]
        public User User { get; set; }

        // 🔹 For Team Sport
        public int? TeamId { get; set; }

        [ForeignKey("TeamId")]
        public Team Team { get; set; }

        // 🔹 Final position (1 = Winner, 2 = Runner-up, etc.)
        [Required]
        public int Position { get; set; }
    }
}
