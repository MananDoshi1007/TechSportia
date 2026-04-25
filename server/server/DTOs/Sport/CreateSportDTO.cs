namespace server.DTOs.Sport
{
    public class CreateSportDTO
    {
        public string SportName { get; set; }
        public int EventId { get; set; } // which event this sport belongs to
    }
}
