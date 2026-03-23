using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TechSportia.Models
{
    public enum EventStatus
    {
        Draft,
        RegistrationOpen,
        Ongoing,
        Completed
    }

    public class Event
    {
        public int EventId { get; set; }

        [Required]
        [StringLength(150)]
        public string Name { get; set; }

        public string Description { get; set; }

        //Start with Draft(under construction)
        // Max 7 ACTIVE events per college is enforced in backend logic
        // (Draft, RegistrationOpen, Ongoing)
        [Required]
        public EventStatus Status { get; set; } = EventStatus.Draft;

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        // 🔹 Max number of sports allowed in this event
        // Default = 10 (can be changed per event)
        public int MaxSports { get; set; } = 10;

        // Relation with College
        [Required]
        public int CollegeId { get; set; }

        [ForeignKey("CollegeId")]
        public College College { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}
