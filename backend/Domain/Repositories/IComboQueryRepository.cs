using TourGuideBackend.Domain.Entities;

namespace TourGuideBackend.Domain.Repositories
{
    public interface IComboQueryRepository
    {
        /// <summary>
        /// Fetches all combos for a place including dual-language translations
        /// (target + "vi") and the included dishes (with their translations).
        /// </summary>
        Task<List<Combo>> GetByPlaceWithTranslationsAsync(Guid placeId, string targetLang, string sourceLang = "vi");
    }
}
