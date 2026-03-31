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
    }
}
