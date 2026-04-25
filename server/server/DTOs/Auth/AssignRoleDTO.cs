namespace server.DTOs.Auth
{
    public class AssignRoleDTO
    {
        public int UserId { get; set; }
        public string Role { get; set; } // Admin, Organizer, Player
    }
}
