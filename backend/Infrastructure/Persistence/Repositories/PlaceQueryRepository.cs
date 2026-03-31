using Microsoft.EntityFrameworkCore;
using TourGuideBackend.Domain.Entities;
using TourGuideBackend.Domain.Repositories;

namespace TourGuideBackend.Infrastructure.Persistence.Repositories
{
    public class PlaceQueryRepository : IPlaceQueryRepository
    {
        private readonly AppDbContext _db;

        public PlaceQueryRepository(AppDbContext db)
        {
            _db = db;
        }

        public async Task<Place?> GetByIdAsync(Guid id, string languageCode)
        {
            return await _db.Places
                .AsNoTracking()
                .Include(p => p.Translations.Where(t => t.LanguageCode == languageCode))
                .Include(p => p.Dishes)
                    .ThenInclude(d => d.Translations.Where(t => t.LanguageCode == languageCode))
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<List<Place>> GetAllAsync(string languageCode)
        {
            return await _db.Places
                .AsNoTracking()
                .Where(p => p.Status)
                .Include(p => p.Translations.Where(t => t.LanguageCode == languageCode))
                .Include(p => p.Dishes)
                    .ThenInclude(d => d.Translations.Where(t => t.LanguageCode == languageCode))
                .ToListAsync();
        }
    }
}
