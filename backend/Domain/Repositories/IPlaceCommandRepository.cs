using TourGuideBackend.Domain.Entities;

namespace TourGuideBackend.Domain.Repositories
{
    public interface IPlaceCommandRepository
    {
        Task<Place> CreateAsync(Place place);
        Task<Place> UpdateAsync(Place place);
        Task DeleteAsync(Guid id);
    }
}
