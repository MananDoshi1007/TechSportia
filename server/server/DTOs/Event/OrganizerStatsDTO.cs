namespace server.DTOs.Event
{
    public class OrganizerStatsDTO
    {
        public int TotalEvents { get; set; }
        public int ActiveEvents { get; set; }
        public int TotalParticipants { get; set; }
        public int PendingApprovals { get; set; }
    }
}
