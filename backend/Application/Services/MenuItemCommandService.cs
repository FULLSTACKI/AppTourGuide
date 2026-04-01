using TourGuideBackend.Application.DTOs.MenuItems;
using TourGuideBackend.Domain.Entities;
using TourGuideBackend.Domain.Repositories;

namespace TourGuideBackend.Application.Services
{
    public class MenuItemCommandService
    {
        private readonly IMenuItemCommandRepository _repo;

        public MenuItemCommandService(IMenuItemCommandRepository repo)
        {
            _repo = repo;
        }

        public async Task<MenuItemDto> CreateAsync(CreateMenuItemRequest req)
        {
            var menuItem = new MenuItem
            {
                PlaceId = req.PlaceId,
                ImageUrl = req.ImageUrl,
                BasePrice = req.BasePrice,
                IsRecommended = req.IsRecommended,
                DietaryTags = req.DietaryTags,
                Translations = req.Translations.Select(t => new MenuItemTranslation
                {
                    LanguageCode = t.LanguageCode,
                    Name = t.Name,
                    Description = t.Description
                }).ToList()
            };

            var created = await _repo.CreateAsync(menuItem);
            return MapToDto(created);
        }

        public async Task<MenuItemDto> UpdateAsync(Guid id, UpdateMenuItemRequest req)
        {
            var menuItem = new MenuItem
            {
                Id = id,
                ImageUrl = req.ImageUrl,
                BasePrice = req.BasePrice,
                IsRecommended = req.IsRecommended,
                DietaryTags = req.DietaryTags,
                Translations = req.Translations.Select(t => new MenuItemTranslation
                {
                    LanguageCode = t.LanguageCode,
                    Name = t.Name,
                    Description = t.Description
                }).ToList()
            };

            var updated = await _repo.UpdateAsync(menuItem);
            return MapToDto(updated);
        }

        public async Task DeleteAsync(Guid id)
        {
            await _repo.DeleteAsync(id);
        }

        private static MenuItemDto MapToDto(MenuItem m)
        {
            var viTranslation = m.Translations.FirstOrDefault(t => t.LanguageCode == "vi");
            var translation = m.Translations.FirstOrDefault();

            return new MenuItemDto
            {
                Id = m.Id,
                PlaceId = m.PlaceId,
                ImageUrl = m.ImageUrl,
                BasePrice = m.BasePrice,
                IsRecommended = m.IsRecommended,
                DietaryTags = m.DietaryTags
                    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                    .ToList(),
                OriginalName = viTranslation?.Name ?? string.Empty,
                Translation = translation == null ? null : new MenuItemTranslationDto
                {
                    Id = translation.Id,
                    LanguageCode = translation.LanguageCode,
                    Name = translation.Name,
                    Description = translation.Description
                }
            };
        }
    }
}
