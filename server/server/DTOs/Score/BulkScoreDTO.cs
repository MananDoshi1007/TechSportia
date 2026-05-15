namespace server.DTOs.Score
{
    public class BulkScoreDTO
    {
        public int SportId { get; set; }
        public int? TeamId { get; set; }
        public int? UserId { get; set; }
        public int Points { get; set; }
    }
}
