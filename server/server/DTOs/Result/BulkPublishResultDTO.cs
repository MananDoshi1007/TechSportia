namespace server.DTOs.Result;

public class BulkPublishResultDTO
{
    public int SportId { get; set; }
    public List<ParticipantResultDTO> Winners { get; set; } = new();
}

public class ParticipantResultDTO
{
    public int? UserId { get; set; }
    public int? TeamId { get; set; }
    public int Rank { get; set; }
    public string? AwardName { get; set; }
}
