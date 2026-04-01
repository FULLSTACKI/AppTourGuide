using Microsoft.EntityFrameworkCore;
using TourGuideBackend.Domain.Entities;
using TourGuideBackend.Domain.Repositories;

namespace TourGuideBackend.Infrastructure.Persistence.Repositories
{
    public class MenuItemCommandRepository : IMenuItemCommandRepository
    {
        private readonly AppDbContext _db;

        public MenuItemCommandRepository(AppDbContext db)
        {
            _db = db;
        }

        public async Task<MenuItem> CreateAsync(MenuItem menuItem)
        {
            _db.MenuItems.Add(menuItem);
            await _db.SaveChangesAsync();
            return menuItem;
        }

        public async Task<MenuItem> UpdateAsync(MenuItem menuItem)
        {
            var existing = await _db.MenuItems
                .Include(m => m.Translations)
                .FirstOrDefaultAsync(m => m.Id == menuItem.Id)
                ?? throw new KeyNotFoundException($"MenuItem {menuItem.Id} not found");

            existing.ImageUrl = menuItem.ImageUrl;
            existing.BasePrice = menuItem.BasePrice;
            existing.IsRecommended = menuItem.IsRecommended;
            existing.DietaryTags = menuItem.DietaryTags;

            // Replace translations
            _db.MenuItemTranslations.RemoveRange(existing.Translations);
            foreach (var t in menuItem.Translations)
            {
                t.MenuItemId = existing.Id;
                _db.MenuItemTranslations.Add(t);
            }

            await _db.SaveChangesAsync();
            return existing;
        }

        public async Task DeleteAsync(Guid id)
        {
            var menuItem = await _db.MenuItems.FindAsync(id)
                ?? throw new KeyNotFoundException($"MenuItem {id} not found");
            _db.MenuItems.Remove(menuItem);
            await _db.SaveChangesAsync();
        }
    }
}
