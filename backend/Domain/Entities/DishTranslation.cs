namespace TourGuideBackend.Domain.Entities
{
    public class DishTranslation
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid DishId { get; set; }
        public string LanguageCode { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;

        // Navigation property
        public Dish Dish { get; set; } = null!;
    }
}
