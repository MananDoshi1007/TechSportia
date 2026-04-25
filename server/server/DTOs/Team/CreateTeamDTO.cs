namespace server.DTOs.Team
{
    public class CreateTeamDTO
    {
        public string TeamName { get; set; }
        public int SportId { get; set; }
        public int CaptainId { get; set; }
    }
}
