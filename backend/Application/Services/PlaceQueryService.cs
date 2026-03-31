using TourGuideBackend.Application.DTOs.Places;
using TourGuideBackend.Domain.Entities;
using TourGuideBackend.Domain.Repositories;

namespace TourGuideBackend.Application.Services
{
    public class PlaceQueryService
    {
        private readonly IPlaceQueryRepository _repo;

        public PlaceQueryService(IPlaceQueryRepository repo)
        {
            _repo = repo;
        }

        public async Task<PlaceDto?> GetByIdAsync(Guid id, string languageCode)
        {
            var place = await _repo.GetByIdAsync(id, languageCode);
            return place == null ? null : MapToDto(place);
        }

        public async Task<List<PlaceDto>> GetAllAsync(string languageCode)
        {
            var places = await _repo.GetAllAsync(languageCode);
            return places.Select(MapToDto).ToList();
        }

        private static PlaceDto MapToDto(Place p)
        {
            var translation = p.Translations.FirstOrDefault();
            return new PlaceDto
            {
                Id = p.Id,
                Latitude = p.Latitude,
                Longitude = p.Longitude,
                CoverImageUrl = p.CoverImageUrl,
                PriceRange = p.PriceRange,
                Status = p.Status,
                Translation = translation == null ? null : new PlaceTranslationDto
                {
                    Id = translation.Id,
                    LanguageCode = translation.LanguageCode,
                    Name = translation.Name,
                    Description = translation.Description,
                    AudioUrl = translation.AudioUrl
                },
                Dishes = p.Dishes.Select(d =>
                {
                    var dt = d.Translations.FirstOrDefault();
                    return new DishDto
                    {
                        Id = d.Id,
                        PlaceId = d.PlaceId,
                        ImageUrl = d.ImageUrl,
                        Translation = dt == null ? null : new DishTranslationDto
                        {
                            Id = dt.Id,
                            LanguageCode = dt.LanguageCode,
                            Name = dt.Name,
                            Description = dt.Description
                        }
                    };
                }).ToList()
            };
        }
    }
}
