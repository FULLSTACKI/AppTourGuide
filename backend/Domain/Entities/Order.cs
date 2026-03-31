namespace TourGuideBackend.Domain.Entities
{
    public class Order
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid PlaceId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string ArrivalTime { get; set; } = string.Empty;
        public int NumberOfPeople { get; set; } = 1;
        public string Note { get; set; } = string.Empty;
        public string Status { get; set; } = "pending"; // pending | confirmed | cancelled
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public Place Place { get; set; } = null!;
        public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
    }
}
