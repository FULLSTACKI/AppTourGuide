using Microsoft.EntityFrameworkCore;
using TourGuideBackend.Domain.Entities;
using TourGuideBackend.Domain.Repositories;

namespace TourGuideBackend.Infrastructure.Persistence.Repositories
{
    public class DishQueryRepository : IDishQueryRepository
    {
        private readonly AppDbContext _db;

        public DishQueryRepository(AppDbContext db)
        {
            _db = db;
        }

        public async Task<Dish?> GetByIdAsync(Guid id, string languageCode)
        {
            return await _db.Dishes
                .AsNoTracking()
                .Include(d => d.Translations.Where(t => t.LanguageCode == languageCode))
                .FirstOrDefaultAsync(d => d.Id == id);
        }

        public async Task<List<Dish>> GetByPlaceIdAsync(Guid placeId, string languageCode)
        {
            return await _db.Dishes
                .AsNoTracking()
                .Where(d => d.PlaceId == placeId)
                .Include(d => d.Translations.Where(t => t.LanguageCode == languageCode))
                .ToListAsync();
        }

        public async Task<List<Dish>> GetByPlaceWithTranslationsAsync(Guid placeId, string targetLang, string sourceLang = "vi")
        {
            return await _db.Dishes
                .AsNoTracking()
                .Where(d => d.PlaceId == placeId)
                .Include(d => d.Translations.Where(t => t.LanguageCode == targetLang || t.LanguageCode == sourceLang))
                .ToListAsync();
        }

        public async Task<List<Dish>> GetRecommendedByPlaceAsync(Guid placeId, string targetLang, string sourceLang = "vi")
        {
            return await _db.Dishes
                .AsNoTracking()
                .Where(d => d.PlaceId == placeId && d.IsRecommended)
                .Include(d => d.Translations.Where(t => t.LanguageCode == targetLang || t.LanguageCode == sourceLang))
                .ToListAsync();
        }

        public async Task<List<Dish>> GetRelatedDishesAsync(Guid dishId, string targetLang, string sourceLang = "vi")
        {
            // Fetch related dish IDs from DishRelation (bidirectional)
            var relatedDishIds = await _db.DishRelations
                .AsNoTracking()
                .Where(r => r.PrimaryDishId == dishId || r.RelatedDishId == dishId)
                .Select(r => r.PrimaryDishId == dishId ? r.RelatedDishId : r.PrimaryDishId)
                .Distinct()
                .ToListAsync();

            if (relatedDishIds.Count == 0) return [];

            return await _db.Dishes
                .AsNoTracking()
                .Where(d => relatedDishIds.Contains(d.Id))
                .Include(d => d.Translations.Where(t => t.LanguageCode == targetLang || t.LanguageCode == sourceLang))
                .ToListAsync();
        }
    }
}
