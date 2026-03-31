using TourGuideBackend.Application.DTOs.Places;
using TourGuideBackend.Domain.Entities;
using TourGuideBackend.Domain.Repositories;

namespace TourGuideBackend.Application.Services
{
    public class PlaceCommandService
    {
        private readonly IPlaceCommandRepository _repo;

        public PlaceCommandService(IPlaceCommandRepository repo)
        {
            _repo = repo;
        }

        public async Task<PlaceDto> CreateAsync(CreatePlaceRequest req)
        {
            var place = new Place
            {
                Latitude = req.Latitude,
                Longitude = req.Longitude,
                CoverImageUrl = req.CoverImageUrl,
                PriceRange = req.PriceRange,
                Status = true,
                Translations = req.Translations.Select(t => new PlaceTranslation
                {
                    LanguageCode = t.LanguageCode,
                    Name = t.Name,
                    Description = t.Description,
                    AudioUrl = t.AudioUrl
                }).ToList()
            };

            var created = await _repo.CreateAsync(place);
            return MapToDto(created);
        }

        public async Task<PlaceDto> UpdateAsync(Guid id, UpdatePlaceRequest req)
        {
            var place = new Place
            {
                Id = id,
                Latitude = req.Latitude,
                Longitude = req.Longitude,
                CoverImageUrl = req.CoverImageUrl,
                PriceRange = req.PriceRange,
                Status = req.Status,
                Translations = req.Translations.Select(t => new PlaceTranslation
                {
                    LanguageCode = t.LanguageCode,
                    Name = t.Name,
                    Description = t.Description,
                    AudioUrl = t.AudioUrl
                }).ToList()
            };

            var updated = await _repo.UpdateAsync(place);
            return MapToDto(updated);
        }

        public async Task DeleteAsync(Guid id)
        {
            await _repo.DeleteAsync(id);
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
                }
            };
        }
    }
}
