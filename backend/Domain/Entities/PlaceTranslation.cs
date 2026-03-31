namespace TourGuideBackend.Domain.Entities
{
    public class PlaceTranslation
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid PlaceId { get; set; }
        public string LanguageCode { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string AudioUrl { get; set; } = string.Empty;

        // Navigation property
        public Place Place { get; set; } = null!;
    }
}
