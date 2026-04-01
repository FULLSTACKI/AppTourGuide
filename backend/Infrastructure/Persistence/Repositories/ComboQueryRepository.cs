using Microsoft.EntityFrameworkCore;
using TourGuideBackend.Domain.Entities;
using TourGuideBackend.Domain.Repositories;

namespace TourGuideBackend.Infrastructure.Persistence.Repositories
{
    public class ComboQueryRepository : IComboQueryRepository
    {
        private readonly AppDbContext _db;

        public ComboQueryRepository(AppDbContext db)
        {
            _db = db;
        }

        public async Task<List<Combo>> GetByPlaceWithTranslationsAsync(Guid placeId, string targetLang, string sourceLang = "vi")
        {
            return await _db.Combos
                .AsNoTracking()
                .Where(c => c.PlaceId == placeId)
                .Include(c => c.Translations.Where(t => t.LanguageCode == targetLang || t.LanguageCode == sourceLang))
                .Include(c => c.ComboDishes)
                    .ThenInclude(cd => cd.Dish)
                        .ThenInclude(d => d.Translations.Where(t => t.LanguageCode == targetLang || t.LanguageCode == sourceLang))
                .ToListAsync();
        }
    }
}
