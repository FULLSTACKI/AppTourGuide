namespace TourGuideBackend.Domain.Entities
{
    public class Dish
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid PlaceId { get; set; }
        public string ImageUrl { get; set; } = string.Empty;

        // Navigation properties
        public Place Place { get; set; } = null!;
        public ICollection<DishTranslation> Translations { get; set; } = new List<DishTranslation>();
    }
}
