using server.DTOs.User;

namespace server.DTOs.Team
{
    public class TeamDetailsDTO
    {
        public int Id { get; set; }
        public string TeamName { get; set; }

        public int CaptainId { get; set; }
        public List<GetUserDTO> Players { get; set; }
    }
}
