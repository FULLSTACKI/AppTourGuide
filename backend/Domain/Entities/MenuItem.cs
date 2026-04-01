namespace TourGuideBackend.Domain.Entities
{
    public class MenuItem
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid PlaceId { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public decimal BasePrice { get; set; }
        public bool IsRecommended { get; set; }

        /// <summary>
        /// Comma-separated dietary/allergy tags.
        /// Examples: "seafood,spicy" or "peanut-free,vegetarian".
        /// Stored as a simple string; parsed at the Application layer for filtering.
        /// </summary>
        public string DietaryTags { get; set; } = string.Empty;

        // Navigation properties
        public Place Place { get; set; } = null!;
        public ICollection<MenuItemTranslation> Translations { get; set; } = new List<MenuItemTranslation>();
    }
}
