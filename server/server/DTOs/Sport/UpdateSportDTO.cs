namespace server.DTOs.Sport
{
    public class UpdateSportDTO
    {
        public string? Name { get; set; }
        public string? Type { get; set; }
        public int? MaxPlayers { get; set; }
        public int? MinPlayers { get; set; }
        public string? Rules { get; set; }
        public string? StartTime { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }
}
