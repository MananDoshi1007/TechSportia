namespace server.DTOs.Auth
{
    public class AuthResponseDTO
    {
        public int UserId { get; set; }
        public string? Token { get; set; }
        public string? Role { get; set; }
        public string? UserName { get; set; }
        public string? Email { get; set; }
        public int? CollegeId { get; set; }
    }
}
