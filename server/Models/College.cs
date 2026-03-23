using System;
using System.ComponentModel.DataAnnotations;

namespace TechSportia.Models
{
    public class College
    {
        public int CollegeId { get; set; }

        [Required]
        public string Name { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public string ContactNumber { get; set; }

        public string Address { get; set; }

        public bool IsApproved { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}
