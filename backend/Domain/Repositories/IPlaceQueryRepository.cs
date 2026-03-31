using TourGuideBackend.Domain.Entities;

namespace TourGuideBackend.Domain.Repositories
{
    public interface IPlaceQueryRepository
    {
        Task<Place?> GetByIdAsync(Guid id, string languageCode);
        Task<List<Place>> GetAllAsync(string languageCode);
    }
}
