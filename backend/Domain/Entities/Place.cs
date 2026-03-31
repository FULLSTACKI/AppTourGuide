namespace TourGuideBackend.Domain.Entities
{
    public class Place
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string CoverImageUrl { get; set; } = string.Empty;
        public string PriceRange { get; set; } = string.Empty;
        public bool Status { get; set; } = true;

        // Navigation properties
        public ICollection<PlaceTranslation> Translations { get; set; } = new List<PlaceTranslation>();
        public ICollection<Dish> Dishes { get; set; } = new List<Dish>();
    }
}
