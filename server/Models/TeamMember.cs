using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TechSportia.Models
{
    public enum TeamRole
    {
        Captain,
        ViceCaptain,
        Player,
        Substitute
    }

    public class TeamMember
    {
        public int TeamMemberId { get; set; }

        // 🔹 Relation with Team
        [Required]
        public int TeamId { get; set; }

        [ForeignKey("TeamId")]
        public Team Team { get; set; }

        // 🔹 Relation with User
        [Required]
        public int UserId { get; set; }

        [ForeignKey("UserId")]
        public User User { get; set; }

        // 🔹 Role inside team
        [Required]
        public TeamRole Role { get; set; }
    }
}
