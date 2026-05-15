namespace server.DTOs.User
{
    public class CreateUserDTO
    {
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string? Password { get; set; }
        public string? Role { get; set; }
        public int? CollegeId { get; set; }
        public string? PhoneNumber { get; set; }
        public string? YearOfStudy { get; set; }
    }
}
