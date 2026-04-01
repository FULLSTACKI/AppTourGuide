using TourGuideBackend.Application.DTOs.MenuItems;
using TourGuideBackend.Domain.Entities;
using TourGuideBackend.Domain.Repositories;

namespace TourGuideBackend.Application.Services
{
    public class MenuItemQueryService
    {
        private readonly IMenuItemQueryRepository _repo;

        public MenuItemQueryService(IMenuItemQueryRepository repo)
        {
            _repo = repo;
        }

        public async Task<MenuItemDto?> GetByIdAsync(Guid id, string languageCode)
        {
            var item = await _repo.GetByIdAsync(id, languageCode);
            return item == null ? null : MapToDto(item, languageCode);
        }

        /// <summary>
        /// Returns all menu items for a place, optionally filtered by dietary tags.
        /// When <paramref name="dietaryFilters"/> is provided, only items whose
        /// DietaryTags contain ALL the requested filters are returned (AND logic).
        /// </summary>
        public async Task<List<MenuItemDto>> GetByPlaceIdAsync(
            Guid placeId,
            string languageCode,
            List<string>? dietaryFilters = null)
        {
            var items = await _repo.GetByPlaceIdAsync(placeId, languageCode);

            if (dietaryFilters is { Count: > 0 })
            {
                items = items.Where(m =>
                {
                    var tags = m.DietaryTags
                        .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                        .Select(t => t.ToLowerInvariant())
                        .ToHashSet();

                    return dietaryFilters.All(f => tags.Contains(f.ToLowerInvariant()));
                }).ToList();
            }

            return items.Select(m => MapToDto(m, languageCode)).ToList();
        }

        /// <summary>
        /// Returns recommended items for a place (IsRecommended == true).
        /// </summary>
        public async Task<List<MenuItemDto>> GetRecommendedAsync(Guid placeId, string languageCode)
        {
            var items = await _repo.GetByPlaceIdAsync(placeId, languageCode);
            return items
                .Where(m => m.IsRecommended)
                .Select(m => MapToDto(m, languageCode))
                .ToList();
        }

        private static MenuItemDto MapToDto(MenuItem m, string languageCode)
        {
            // The repository loads both "vi" and the target language translations.
            var viTranslation = m.Translations.FirstOrDefault(t => t.LanguageCode == "vi");
            var targetTranslation = languageCode == "vi"
                ? viTranslation
                : m.Translations.FirstOrDefault(t => t.LanguageCode == languageCode);

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
                Translation = targetTranslation == null ? null : new MenuItemTranslationDto
                {
                    Id = targetTranslation.Id,
                    LanguageCode = targetTranslation.LanguageCode,
                    Name = targetTranslation.Name,
                    Description = targetTranslation.Description
                }
            };
        }
    }
}
