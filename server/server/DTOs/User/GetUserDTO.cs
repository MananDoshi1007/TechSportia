namespace server.DTOs.User
{
    public class GetUserDTO
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string? Role { get; set; }
        public int? CollegeId { get; set; }
        public string? CollegeName { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Department { get; set; }
        public string? YearOfStudy { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? Gender { get; set; }
    }
}
