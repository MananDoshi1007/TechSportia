using System;

namespace server.DTOs.Event
{
    public class GetEventDTO
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int? CollegeId { get; set; }
        public string? CollegeName { get; set; }
        public string? Status { get; set; }
        public string? Location { get; set; }
        public List<EventSportDTO> Sports { get; set; } = new();
    }
}
