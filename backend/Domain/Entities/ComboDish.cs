namespace TourGuideBackend.Domain.Entities
{
    /// <summary>
    /// Many-to-Many junction table between Combo and Dish.
    /// Links which dishes are included in a specific combo.
    /// </summary>
    public class ComboDish
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid ComboId { get; set; }
        public Guid DishId { get; set; }

        // Navigation properties
        public Combo Combo { get; set; } = null!;
        public Dish Dish { get; set; } = null!;
    }
}
