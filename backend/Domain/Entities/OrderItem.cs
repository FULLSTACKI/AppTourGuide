namespace TourGuideBackend.Domain.Entities
{
    public class OrderItem
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid OrderId { get; set; }
        public Guid DishId { get; set; }
        public int Quantity { get; set; } = 1;
        public string DishNameSnapshot { get; set; } = string.Empty;

        // Navigation properties
        public Order Order { get; set; } = null!;
        public Dish Dish { get; set; } = null!;
    }
}
