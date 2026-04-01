namespace TourGuideBackend.Domain.Entities
{
    public class MenuItemTranslation
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid MenuItemId { get; set; }
        public string LanguageCode { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;

        // Navigation property
        public MenuItem MenuItem { get; set; } = null!;
    }
}
