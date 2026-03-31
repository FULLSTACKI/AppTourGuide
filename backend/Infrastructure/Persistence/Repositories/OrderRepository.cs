using Microsoft.EntityFrameworkCore;
using TourGuideBackend.Domain.Entities;
using TourGuideBackend.Domain.Repositories;

namespace TourGuideBackend.Infrastructure.Persistence.Repositories
{
    public class OrderRepository : IOrderRepository
    {
        private readonly AppDbContext _db;

        public OrderRepository(AppDbContext db)
        {
            _db = db;
        }

        public async Task<Order> CreateAsync(Order order)
        {
            _db.Orders.Add(order);
            await _db.SaveChangesAsync();
            return order;
        }

        public async Task<Order?> GetByIdAsync(Guid id)
        {
            return await _db.Orders
                .Include(o => o.Items)
                .FirstOrDefaultAsync(o => o.Id == id);
        }

        public async Task<List<Order>> GetAllAsync()
        {
            return await _db.Orders
                .Include(o => o.Items)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<Order>> GetByPlaceIdAsync(Guid placeId)
        {
            return await _db.Orders
                .Include(o => o.Items)
                .Where(o => o.PlaceId == placeId)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();
        }

        public async Task<Order> UpdateStatusAsync(Guid id, string status)
        {
            var order = await _db.Orders.FindAsync(id)
                ?? throw new KeyNotFoundException($"Order {id} not found");
            order.Status = status;
            await _db.SaveChangesAsync();
            return order;
        }
    }
}
