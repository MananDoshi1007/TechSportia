namespace server.DTOs.College
{
    public class CreateCollegeDTO
    {
        // College details
        public string Name { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? ContactNumber { get; set; }
        public string? Address { get; set; }

        // Initial Organizer details
        public string AdminName { get; set; } = string.Empty;
        public string AdminEmail { get; set; } = string.Empty;
        public string AdminPassword { get; set; } = "Organizer@123"; // Default password
    }
}
