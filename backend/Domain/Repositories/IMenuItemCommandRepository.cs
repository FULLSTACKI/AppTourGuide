using TourGuideBackend.Domain.Entities;

namespace TourGuideBackend.Domain.Repositories
{
    public interface IMenuItemCommandRepository
    {
        Task<MenuItem> CreateAsync(MenuItem menuItem);
        Task<MenuItem> UpdateAsync(MenuItem menuItem);
        Task DeleteAsync(Guid id);
    }
}
