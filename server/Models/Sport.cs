using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TechSportia.Models
{
    public enum SportType
    {
        Individual,
        Team
    }

    public class Sport
    {
        public int SportId { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; } // e.g., Cricket, Football, Chess

        [Required]
        public SportType Type { get; set; }

        // 🔹 Rules for participants
        public string Rules { get; set; }

        // 🔹 Additional flexible data (stored as JSON string)
        public string AdditionalDetails { get; set; }

        // 🔹 Team configuration (only applicable if Type = Team)
        public int? MinPlayers { get; set; }
        public int? MaxPlayers { get; set; }
        public int? MaxSubstitutes { get; set; }

        // 🔹 Registration control
        [Required]
        public DateTime RegistrationStartDate { get; set; }

        [Required]
        public DateTime RegistrationEndDate { get; set; }

        // 🔹 Relation with Event
        [Required]
        public int EventId { get; set; }

        [ForeignKey("EventId")]
        public Event Event { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}
