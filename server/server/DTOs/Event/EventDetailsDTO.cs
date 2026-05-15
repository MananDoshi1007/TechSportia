using System;
using System.Collections.Generic;

namespace server.DTOs.Event
{
    public class EventDetailsDTO
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? Status { get; set; }
        public string? CollegeName { get; set; }
    }
}
