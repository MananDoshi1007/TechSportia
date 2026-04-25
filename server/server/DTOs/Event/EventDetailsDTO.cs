using server.DTOs.Sport;

namespace server.DTOs.Event
{
    public class EventDetailsDTO
    {
        public int Id { get; set; }
        public string EventName { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Location { get; set; }

        public List<GetSportDTO> Sports { get; set; }
    }
}
