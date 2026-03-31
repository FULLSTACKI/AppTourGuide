using TourGuideBackend.Application.DTOs.Orders;
using TourGuideBackend.Domain.Entities;
using TourGuideBackend.Domain.Repositories;

namespace TourGuideBackend.Application.Services
{
    public class OrderService
    {
        private readonly IOrderRepository _repo;

        public OrderService(IOrderRepository repo)
        {
            _repo = repo;
        }

        public async Task<OrderDto> CreateAsync(CreateOrderRequest req)
        {
            var order = new Order
            {
                PlaceId = req.PlaceId,
                CustomerName = req.CustomerName,
                ArrivalTime = req.ArrivalTime,
                NumberOfPeople = req.NumberOfPeople,
                Note = req.Note,
                Status = "pending",
                CreatedAt = DateTime.UtcNow,
                Items = req.Items.Select(i => new OrderItem
                {
                    DishId = i.DishId,
                    Quantity = i.Quantity,
                    DishNameSnapshot = i.DishNameSnapshot
                }).ToList()
            };

            var created = await _repo.CreateAsync(order);
            return MapToDto(created);
        }

        public async Task<OrderDto?> GetByIdAsync(Guid id)
        {
            var order = await _repo.GetByIdAsync(id);
            return order == null ? null : MapToDto(order);
        }

        public async Task<List<OrderDto>> GetAllAsync()
        {
            var orders = await _repo.GetAllAsync();
            return orders.Select(MapToDto).ToList();
        }

        public async Task<List<OrderDto>> GetByPlaceIdAsync(Guid placeId)
        {
            var orders = await _repo.GetByPlaceIdAsync(placeId);
            return orders.Select(MapToDto).ToList();
        }

        public async Task<OrderDto> UpdateStatusAsync(Guid id, string status)
        {
            var order = await _repo.UpdateStatusAsync(id, status);
            // Reload with items
            var full = await _repo.GetByIdAsync(order.Id);
            return MapToDto(full!);
        }

        private static OrderDto MapToDto(Order o) => new(
            o.Id,
            o.PlaceId,
            o.CustomerName,
            o.ArrivalTime,
            o.NumberOfPeople,
            o.Note,
            o.Status,
            o.CreatedAt,
            o.Items.Select(i => new OrderItemDto(
                i.Id,
                i.DishId,
                i.Quantity,
                i.DishNameSnapshot
            )).ToList()
        );
    }
}
