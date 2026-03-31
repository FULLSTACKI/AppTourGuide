using TourGuideBackend.Domain.Entities;

namespace TourGuideBackend.Domain.Repositories
{
    public interface IDishCommandRepository
    {
        Task<Dish> CreateAsync(Dish dish);
        Task<Dish> UpdateAsync(Dish dish);
        Task DeleteAsync(Guid id);
    }
}
