using TourGuideBackend.Application.DTOs.Places;
using TourGuideBackend.Domain.Entities;
using TourGuideBackend.Domain.Repositories;

namespace TourGuideBackend.Application.Services
{
    public class DishCommandService
    {
        private readonly IDishCommandRepository _repo;

        public DishCommandService(IDishCommandRepository repo)
        {
            _repo = repo;
        }

        public async Task<DishDto> CreateAsync(CreateDishRequest req)
        {
            var dish = new Dish
            {
                PlaceId = req.PlaceId,
                ImageUrl = req.ImageUrl,
                Translations = req.Translations.Select(t => new DishTranslation
                {
                    LanguageCode = t.LanguageCode,
                    Name = t.Name,
                    Description = t.Description
                }).ToList()
            };

            var created = await _repo.CreateAsync(dish);
            return MapToDto(created);
        }

        public async Task<DishDto> UpdateAsync(Guid id, UpdateDishRequest req)
        {
            var dish = new Dish
            {
                Id = id,
                ImageUrl = req.ImageUrl,
                Translations = req.Translations.Select(t => new DishTranslation
                {
                    LanguageCode = t.LanguageCode,
                    Name = t.Name,
                    Description = t.Description
                }).ToList()
            };

            var updated = await _repo.UpdateAsync(dish);
            return MapToDto(updated);
        }

        public async Task DeleteAsync(Guid id)
        {
            await _repo.DeleteAsync(id);
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
