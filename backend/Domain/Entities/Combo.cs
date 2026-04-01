namespace TourGuideBackend.Domain.Entities
{
    /// <summary>
    /// A combo / set menu that bundles multiple dishes at a discounted price.
    /// Example: "Saigon Night Combo: 2 Dishes + 2 Beers" at a fixed BasePrice in VND.
    /// Belongs to a Place, has multilingual translations via ComboTranslation,
    /// and links to included dishes via ComboDish.
    /// </summary>
    public class Combo
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid PlaceId { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public decimal BasePrice { get; set; }

        // Navigation properties
        public Place Place { get; set; } = null!;
        public ICollection<ComboTranslation> Translations { get; set; } = new List<ComboTranslation>();
        public ICollection<ComboDish> ComboDishes { get; set; } = new List<ComboDish>();
    }
}
