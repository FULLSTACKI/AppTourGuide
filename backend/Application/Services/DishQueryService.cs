using TourGuideBackend.Application.DTOs.Places;
using TourGuideBackend.Domain.Entities;
using TourGuideBackend.Domain.Repositories;
using TourGuideBackend.Domain.Services;

namespace TourGuideBackend.Application.Services
{
    public class DishQueryService
    {
        private readonly IDishQueryRepository _repo;
        private readonly ICurrencyExchangeService _currencyService;

        public DishQueryService(IDishQueryRepository repo, ICurrencyExchangeService currencyService)
        {
            _repo = repo;
            _currencyService = currencyService;
        }

        public async Task<DishDto?> GetByIdAsync(Guid id, string languageCode)
        {
            var dish = await _repo.GetByIdAsync(id, languageCode);
            if (dish == null) return null;
            var dto = MapToDto(dish, languageCode);
            await ApplyCurrencyConversionAsync(dto, languageCode);
            return dto;
        }

        public async Task<List<DishDto>> GetByPlaceIdAsync(Guid placeId, string languageCode)
        {
            var dishes = await _repo.GetByPlaceIdAsync(placeId, languageCode);
            var dtos = dishes.Select(d => MapToDto(d, languageCode)).ToList();
            await ApplyCurrencyConversionBatchAsync(dtos, languageCode);
            return dtos;
        }

        /// <summary>
        /// Fetches dishes for a place with dual-language translations (target + "vi").
        /// Supports Smart Dietary &amp; Allergy Search and real-time currency conversion.
        /// </summary>
        public async Task<List<DishDto>> GetDishesByPlaceAsync(Guid placeId, string targetLang, List<string>? dietaryFilters = null)
        {
            var dishes = await _repo.GetByPlaceWithTranslationsAsync(placeId, targetLang);

            // Dietary filtering: exclude dishes that contain ANY of the specified allergens/tags
            if (dietaryFilters != null && dietaryFilters.Count > 0)
            {
                var filters = dietaryFilters
                    .Select(f => f.Trim().ToLowerInvariant())
                    .Where(f => !string.IsNullOrEmpty(f))
                    .ToHashSet();

                dishes = dishes.Where(d =>
                {
                    var tags = ParseDietaryTags(d.DietaryTags);
                    // Keep dish only if NONE of its tags match the filter
                    return !tags.Any(t => filters.Contains(t));
                }).ToList();
            }

            var dtos = dishes.Select(d => MapToDtoWithOriginalName(d, targetLang)).ToList();
            await ApplyCurrencyConversionBatchAsync(dtos, targetLang);
            return dtos;
        }

        /// <summary>
        /// Fetches only recommended dishes for cross-sell recommendations.
        /// Applies real-time currency conversion based on target language.
        /// </summary>
        public async Task<List<DishDto>> GetRecommendedDishesAsync(Guid placeId, string targetLang)
        {
            var dishes = await _repo.GetRecommendedByPlaceAsync(placeId, targetLang);
            var dtos = dishes.Select(d => MapToDtoWithOriginalName(d, targetLang)).ToList();
            await ApplyCurrencyConversionBatchAsync(dtos, targetLang);
            return dtos;
        }

        /// <summary>
        /// Fetches "Perfect Match" related dishes for a given dish.
        /// Relations are bidirectional — if A→B exists, querying B returns A.
        /// </summary>
        public async Task<List<DishDto>> GetRelatedDishesAsync(Guid dishId, string targetLang)
        {
            var dishes = await _repo.GetRelatedDishesAsync(dishId, targetLang);
            var dtos = dishes.Select(d => MapToDtoWithOriginalName(d, targetLang)).ToList();
            await ApplyCurrencyConversionBatchAsync(dtos, targetLang);
            return dtos;
        }

        /// <summary>
        /// Maps a Dish entity to DishDto including OriginalName from "vi" translation.
        /// Uses the target language translation for Translation field.
        /// Falls back to first available translation if target lang is missing.
        /// </summary>
        private static DishDto MapToDtoWithOriginalName(Dish d, string targetLang)
        {
            var viTranslation = d.Translations.FirstOrDefault(t => t.LanguageCode == "vi");
            var targetTranslation = d.Translations.FirstOrDefault(t => t.LanguageCode == targetLang);

            // Fallback: if targetLang translation missing, use any available (excluding "vi" if possible)
            targetTranslation ??= d.Translations.FirstOrDefault(t => t.LanguageCode != "vi")
                                  ?? viTranslation;

            return new DishDto
            {
                Id = d.Id,
                PlaceId = d.PlaceId,
                ImageUrl = d.ImageUrl,
                BasePrice = d.BasePrice,
                IsRecommended = d.IsRecommended,
                DietaryTags = ParseDietaryTags(d.DietaryTags),
                OriginalName = viTranslation?.Name ?? string.Empty,
                Translation = targetTranslation == null ? null : new DishTranslationDto
                {
                    Id = targetTranslation.Id,
                    LanguageCode = targetTranslation.LanguageCode,
                    Name = targetTranslation.Name,
                    Description = targetTranslation.Description
                }
            };
        }

        private static DishDto MapToDto(Dish d, string? targetLang = null)
        {
            var translation = targetLang != null
                ? d.Translations.FirstOrDefault(t => t.LanguageCode == targetLang) ?? d.Translations.FirstOrDefault()
                : d.Translations.FirstOrDefault();

            return new DishDto
            {
                Id = d.Id,
                PlaceId = d.PlaceId,
                ImageUrl = d.ImageUrl,
                BasePrice = d.BasePrice,
                IsRecommended = d.IsRecommended,
                DietaryTags = ParseDietaryTags(d.DietaryTags),
                OriginalName = string.Empty,
                Translation = translation == null ? null : new DishTranslationDto
                {
                    Id = translation.Id,
                    LanguageCode = translation.LanguageCode,
                    Name = translation.Name,
                    Description = translation.Description
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

        // ─── Currency Conversion Helpers ─────────────────────────────

        /// <summary>
        /// Applies currency conversion to a single DishDto in-place.
        /// Only calls the external service once per request (rates are cached).
        /// </summary>
        private async Task ApplyCurrencyConversionAsync(DishDto dto, string targetLang)
        {
            var result = await _currencyService.ConvertFromVndAsync(dto.BasePrice, targetLang);
            if (result != null)
            {
                dto.ConvertedPrice = result.ConvertedPrice;
                dto.TargetCurrencyCode = result.CurrencyCode;
                dto.TargetCurrencySymbol = result.CurrencySymbol;
            }
        }

        /// <summary>
        /// Applies currency conversion to a batch of DishDtos.
        /// Fetches the rate once (cached) and applies to all items.
        /// </summary>
        private async Task ApplyCurrencyConversionBatchAsync(List<DishDto> dtos, string targetLang)
        {
            if (dtos.Count == 0) return;

            // Convert first item to warm the cache, then reuse for the rest
            foreach (var dto in dtos)
            {
                var result = await _currencyService.ConvertFromVndAsync(dto.BasePrice, targetLang);
                if (result != null)
                {
                    dto.ConvertedPrice = result.ConvertedPrice;
                    dto.TargetCurrencyCode = result.CurrencyCode;
                    dto.TargetCurrencySymbol = result.CurrencySymbol;
                }
            }
        }
    }
}
