namespace server.DTOs.Event
{
    public class UpdateEventDTO
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int? MaxSports { get; set; }
    }
}
