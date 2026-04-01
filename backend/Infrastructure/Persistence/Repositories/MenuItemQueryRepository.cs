using Microsoft.EntityFrameworkCore;
using TourGuideBackend.Domain.Entities;
using TourGuideBackend.Domain.Repositories;

namespace TourGuideBackend.Infrastructure.Persistence.Repositories
{
    public class MenuItemQueryRepository : IMenuItemQueryRepository
    {
        private readonly AppDbContext _db;

        public MenuItemQueryRepository(AppDbContext db)
        {
            _db = db;
        }

        public async Task<MenuItem?> GetByIdAsync(Guid id, string languageCode)
        {
            // Include both the requested language AND "vi" (original) for OriginalName
            return await _db.MenuItems
                .AsNoTracking()
                .Include(m => m.Translations.Where(t => t.LanguageCode == languageCode || t.LanguageCode == "vi"))
                .FirstOrDefaultAsync(m => m.Id == id);
        }

        public async Task<List<MenuItem>> GetByPlaceIdAsync(Guid placeId, string languageCode)
        {
            return await _db.MenuItems
                .AsNoTracking()
                .Where(m => m.PlaceId == placeId)
                .Include(m => m.Translations.Where(t => t.LanguageCode == languageCode || t.LanguageCode == "vi"))
                .ToListAsync();
        }
    }
}
