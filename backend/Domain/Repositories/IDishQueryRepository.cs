using TourGuideBackend.Domain.Entities;

namespace TourGuideBackend.Domain.Repositories
{
    public interface IDishQueryRepository
    {
        Task<Dish?> GetByIdAsync(Guid id, string languageCode);
        Task<List<Dish>> GetByPlaceIdAsync(Guid placeId, string languageCode);
    }
}
