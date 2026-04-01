using TourGuideBackend.Application.DTOs.Places;
using TourGuideBackend.Domain.Entities;
using TourGuideBackend.Domain.Repositories;
using TourGuideBackend.Domain.Services;

namespace TourGuideBackend.Application.Services
{
    public class ComboQueryService
    {
        private readonly IComboQueryRepository _repo;
        private readonly ICurrencyExchangeService _currencyService;

        public ComboQueryService(IComboQueryRepository repo, ICurrencyExchangeService currencyService)
        {
            _repo = repo;
            _currencyService = currencyService;
        }

        /// <summary>
        /// Fetches all combos for a place with dual-language translations
        /// and real-time currency conversion on both combo price and included dish prices.
        /// </summary>
        public async Task<List<ComboDto>> GetCombosByPlaceAsync(Guid placeId, string targetLang)
        {
            var combos = await _repo.GetByPlaceWithTranslationsAsync(placeId, targetLang);
            var dtos = combos.Select(c => MapToDto(c, targetLang)).ToList();
            await ApplyCurrencyConversionBatchAsync(dtos, targetLang);
            return dtos;
        }

        // ─── Mapping ─────────────────────────────────────────────

        private static ComboDto MapToDto(Combo combo, string targetLang)
        {
            var viTranslation = combo.Translations.FirstOrDefault(t => t.LanguageCode == "vi");
            var targetTranslation = combo.Translations.FirstOrDefault(t => t.LanguageCode == targetLang);
            targetTranslation ??= combo.Translations.FirstOrDefault(t => t.LanguageCode != "vi") ?? viTranslation;

            return new ComboDto
            {
                Id = combo.Id,
                PlaceId = combo.PlaceId,
                ImageUrl = combo.ImageUrl,
                BasePrice = combo.BasePrice,
                OriginalName = viTranslation?.Name ?? string.Empty,
                TranslatedName = targetTranslation?.Name ?? viTranslation?.Name ?? string.Empty,
                TranslatedDescription = targetTranslation?.Description ?? viTranslation?.Description ?? string.Empty,
                Translation = targetTranslation == null ? null : new ComboTranslationDto
                {
                    Id = targetTranslation.Id,
                    LanguageCode = targetTranslation.LanguageCode,
                    Name = targetTranslation.Name,
                    Description = targetTranslation.Description
                },
                Dishes = combo.ComboDishes
                    .Select(cd => MapDishToDto(cd.Dish, targetLang))
                    .ToList()
            };
        }

        private static DishDto MapDishToDto(Dish dish, string targetLang)
        {
            var viTranslation = dish.Translations.FirstOrDefault(t => t.LanguageCode == "vi");
            var targetTranslation = dish.Translations.FirstOrDefault(t => t.LanguageCode == targetLang);
            targetTranslation ??= dish.Translations.FirstOrDefault(t => t.LanguageCode != "vi") ?? viTranslation;

            return new DishDto
            {
                Id = dish.Id,
                PlaceId = dish.PlaceId,
                ImageUrl = dish.ImageUrl,
                BasePrice = dish.BasePrice,
                IsRecommended = dish.IsRecommended,
                DietaryTags = ParseDietaryTags(dish.DietaryTags),
                OriginalName = viTranslation?.Name ?? string.Empty,
                TranslatedName = targetTranslation?.Name ?? viTranslation?.Name ?? string.Empty,
                TranslatedDescription = targetTranslation?.Description ?? viTranslation?.Description ?? string.Empty,
                Translation = targetTranslation == null ? null : new DishTranslationDto
                {
                    Id = targetTranslation.Id,
                    LanguageCode = targetTranslation.LanguageCode,
                    Name = targetTranslation.Name,
                    Description = targetTranslation.Description
                }
            };
        }

        private static List<string> ParseDietaryTags(string? tags)
        {
            if (string.IsNullOrWhiteSpace(tags)) return [];
            return tags.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                       .Select(t => t.ToLowerInvariant())
                       .ToList();
        }

        // ─── Currency Conversion ─────────────────────────────────

        private async Task ApplyCurrencyConversionBatchAsync(List<ComboDto> dtos, string targetLang)
        {
            if (dtos.Count == 0) return;

            foreach (var dto in dtos)
            {
                // Convert combo price
                var comboResult = await _currencyService.ConvertFromVndAsync(dto.BasePrice, targetLang);
                if (comboResult != null)
                {
                    dto.ConvertedPrice = comboResult.ConvertedPrice;
                    dto.TargetCurrencyCode = comboResult.CurrencyCode;
                    dto.TargetCurrencySymbol = comboResult.CurrencySymbol;
                }

                // Convert each included dish price
                foreach (var dish in dto.Dishes)
                {
                    var dishResult = await _currencyService.ConvertFromVndAsync(dish.BasePrice, targetLang);
                    if (dishResult != null)
                    {
                        dish.ConvertedPrice = dishResult.ConvertedPrice;
                        dish.TargetCurrencyCode = dishResult.CurrencyCode;
                        dish.TargetCurrencySymbol = dishResult.CurrencySymbol;
                    }
                }
            }
        }
    }
}
