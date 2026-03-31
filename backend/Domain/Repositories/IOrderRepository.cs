using TourGuideBackend.Domain.Entities;

namespace TourGuideBackend.Domain.Repositories
{
    public interface IOrderRepository
    {
        Task<Order> CreateAsync(Order order);
        Task<Order?> GetByIdAsync(Guid id);
        Task<List<Order>> GetAllAsync();
        Task<List<Order>> GetByPlaceIdAsync(Guid placeId);
        Task<Order> UpdateStatusAsync(Guid id, string status);
    }
}
