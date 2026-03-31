using TourGuideBackend.Application.DTOs.Places;
using TourGuideBackend.Domain.Entities;
using TourGuideBackend.Domain.Repositories;

namespace TourGuideBackend.Application.Services
{
    public class DishQueryService
    {
        private readonly IDishQueryRepository _repo;

        public DishQueryService(IDishQueryRepository repo)
        {
            _repo = repo;
        }

        public async Task<DishDto?> GetByIdAsync(Guid id, string languageCode)
        {
            var dish = await _repo.GetByIdAsync(id, languageCode);
            return dish == null ? null : MapToDto(dish);
        }

        public async Task<List<DishDto>> GetByPlaceIdAsync(Guid placeId, string languageCode)
        {
            var dishes = await _repo.GetByPlaceIdAsync(placeId, languageCode);
            return dishes.Select(MapToDto).ToList();
        }

        private static DishDto MapToDto(Dish d)
        {
            var translation = d.Translations.FirstOrDefault();
            return new DishDto
            {
                Id = d.Id,
                PlaceId = d.PlaceId,
                ImageUrl = d.ImageUrl,
                Translation = translation == null ? null : new DishTranslationDto
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
