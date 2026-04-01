using TourGuideBackend.Domain.Entities;

namespace TourGuideBackend.Domain.Repositories
{
    public interface IMenuItemQueryRepository
    {
        Task<MenuItem?> GetByIdAsync(Guid id, string languageCode);
        Task<List<MenuItem>> GetByPlaceIdAsync(Guid placeId, string languageCode);
    }
}
