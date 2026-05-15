using System;

namespace server.DTOs.User
{
    public class UpdateUserDTO
    {
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Department { get; set; }
        public string? YearOfStudy { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? Gender { get; set; }
    }
}
