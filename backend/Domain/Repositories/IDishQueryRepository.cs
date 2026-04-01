using TourGuideBackend.Domain.Entities;

namespace TourGuideBackend.Domain.Repositories
{
    public interface IDishQueryRepository
    {
        Task<Dish?> GetByIdAsync(Guid id, string languageCode);
        Task<List<Dish>> GetByPlaceIdAsync(Guid placeId, string languageCode);

        /// <summary>
        /// Fetches all dishes for a place including both the target language
        /// translation AND the source ("vi") translation in a single query.
        /// This enables the "Visual Ordering" feature (OriginalName).
        /// </summary>
        Task<List<Dish>> GetByPlaceWithTranslationsAsync(Guid placeId, string targetLang, string sourceLang = "vi");

        /// <summary>
        /// Fetches only recommended dishes (IsRecommended == true) for a place
        /// with dual-language translations.
        /// </summary>
        Task<List<Dish>> GetRecommendedByPlaceAsync(Guid placeId, string targetLang, string sourceLang = "vi");

        /// <summary>
        /// Fetches the "Perfect Match" related dishes for a given dish,
        /// including dual-language translations.
        /// </summary>
        Task<List<Dish>> GetRelatedDishesAsync(Guid dishId, string targetLang, string sourceLang = "vi");
    }
}
