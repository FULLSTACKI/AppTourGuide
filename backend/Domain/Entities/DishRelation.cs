namespace TourGuideBackend.Domain.Entities
{
    /// <summary>
    /// Many-to-Many self-referencing junction table for manual "Perfect Match" dish pairings.
    /// Example: "Bread goes perfectly with Snails", "Spring Rolls complement Pho".
    /// </summary>
    public class DishRelation
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid PrimaryDishId { get; set; }
        public Guid RelatedDishId { get; set; }

        // Navigation properties
        public Dish PrimaryDish { get; set; } = null!;
        public Dish RelatedDish { get; set; } = null!;
    }
}
