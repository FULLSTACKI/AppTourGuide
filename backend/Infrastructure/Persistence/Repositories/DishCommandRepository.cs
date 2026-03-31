using Microsoft.EntityFrameworkCore;
using TourGuideBackend.Domain.Entities;
using TourGuideBackend.Domain.Repositories;

namespace TourGuideBackend.Infrastructure.Persistence.Repositories
{
    public class DishCommandRepository : IDishCommandRepository
    {
        private readonly AppDbContext _db;

        public DishCommandRepository(AppDbContext db)
        {
            _db = db;
        }

        public async Task<Dish> CreateAsync(Dish dish)
        {
            _db.Dishes.Add(dish);
            await _db.SaveChangesAsync();
            return dish;
        }

        public async Task<Dish> UpdateAsync(Dish dish)
        {
            var existing = await _db.Dishes
                .Include(d => d.Translations)
                .FirstOrDefaultAsync(d => d.Id == dish.Id)
                ?? throw new KeyNotFoundException($"Dish {dish.Id} not found");

            existing.ImageUrl = dish.ImageUrl;

            // Replace translations
            _db.DishTranslations.RemoveRange(existing.Translations);
            foreach (var t in dish.Translations)
            {
                t.DishId = existing.Id;
                _db.DishTranslations.Add(t);
            }

            await _db.SaveChangesAsync();
            return existing;
        }

        public async Task DeleteAsync(Guid id)
        {
            var dish = await _db.Dishes.FindAsync(id)
                ?? throw new KeyNotFoundException($"Dish {id} not found");
            _db.Dishes.Remove(dish);
            await _db.SaveChangesAsync();
        }
    }
}
