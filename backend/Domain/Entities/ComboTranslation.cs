namespace TourGuideBackend.Domain.Entities
{
    /// <summary>
    /// Multilingual translation for a Combo (mirroring the DishTranslation pattern).
    /// </summary>
    public class ComboTranslation
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid ComboId { get; set; }
        public string LanguageCode { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;

        // Navigation property
        public Combo Combo { get; set; } = null!;
    }
}
