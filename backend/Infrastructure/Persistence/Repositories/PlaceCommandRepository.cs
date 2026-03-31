using Microsoft.EntityFrameworkCore;
using TourGuideBackend.Domain.Entities;
using TourGuideBackend.Domain.Repositories;

namespace TourGuideBackend.Infrastructure.Persistence.Repositories
{
    public class PlaceCommandRepository : IPlaceCommandRepository
    {
        private readonly AppDbContext _db;

        public PlaceCommandRepository(AppDbContext db)
        {
            _db = db;
        }

        public async Task<Place> CreateAsync(Place place)
        {
            _db.Places.Add(place);
            await _db.SaveChangesAsync();
            return place;
        }

        public async Task<Place> UpdateAsync(Place place)
        {
            var existing = await _db.Places
                .Include(p => p.Translations)
                .Include(p => p.Dishes)
                    .ThenInclude(d => d.Translations)
                .FirstOrDefaultAsync(p => p.Id == place.Id)
                ?? throw new KeyNotFoundException($"Place {place.Id} not found");

            existing.Latitude = place.Latitude;
            existing.Longitude = place.Longitude;
            existing.CoverImageUrl = place.CoverImageUrl;
            existing.PriceRange = place.PriceRange;
            existing.Status = place.Status;

            // Replace translations
            _db.PlaceTranslations.RemoveRange(existing.Translations);
            foreach (var t in place.Translations)
            {
                t.PlaceId = existing.Id;
                _db.PlaceTranslations.Add(t);
            }

            await _db.SaveChangesAsync();
            return existing;
        }

        public async Task DeleteAsync(Guid id)
        {
            var place = await _db.Places.FindAsync(id)
                ?? throw new KeyNotFoundException($"Place {id} not found");
            _db.Places.Remove(place);
            await _db.SaveChangesAsync();
        }
    }
}
