using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TechSportia.Models
{
    public class IndividualRegistration
    {
        public int IndividualRegistrationId { get; set; }

        // 🔹 Relation with User (Player)
        [Required]
        public int UserId { get; set; }

        [ForeignKey("UserId")]
        public User User { get; set; }

        // 🔹 Relation with Sport
        [Required]
        public int SportId { get; set; }

        [ForeignKey("SportId")]
        public Sport Sport { get; set; }

        // 🔹 Approval by Organizer
        public bool IsApproved { get; set; } = false;

        public DateTime RegisteredAt { get; set; } = DateTime.Now;
    }
}
