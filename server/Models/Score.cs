using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TechSportia.Models
{
    public class Score
    {
        public int ScoreId { get; set; }

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

        // 🔹 Actual score
        [Required]
        public double Value { get; set; }

        // 🔹 Ranking (1st, 2nd, 3rd)
        public int? Rank { get; set; }
    }
}
