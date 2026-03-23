using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TechSportia.Models
{
    public enum UserRole
    {
        SuperAdmin,
        Organizer,
        Player
    }
    public class User
    {
        public int UserId { get; set; }

        [Required]
        [StringLength(100)]
        public string FullName { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        [MinLength(6)]
        [MaxLength(12)]
        public string Password { get; set; }

        [Required]
        public UserRole Role { get; set; }

        // Nullable for SuperAdmin
        public int? CollegeId { get; set; }

        [ForeignKey("CollegeId")]
        public College College { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}
