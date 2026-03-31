namespace TourGuideBackend.Application.DTOs.Places
{
    public class PlaceTranslationDto
    {
        public Guid Id { get; set; }
        public string LanguageCode { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string AudioUrl { get; set; } = string.Empty;
    }

    public class DishTranslationDto
    {
        public Guid Id { get; set; }
        public string LanguageCode { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class DishDto
    {
        public Guid Id { get; set; }
        public Guid PlaceId { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public DishTranslationDto? Translation { get; set; }
    }

    public class PlaceDto
    {
        public Guid Id { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string CoverImageUrl { get; set; } = string.Empty;
        public string PriceRange { get; set; } = string.Empty;
        public bool Status { get; set; }
        public PlaceTranslationDto? Translation { get; set; }
        public List<DishDto> Dishes { get; set; } = new();
    }

    // --- Command DTOs ---

    public class CreatePlaceTranslationRequest
    {
        public string LanguageCode { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string AudioUrl { get; set; } = string.Empty;
    }

    public class CreatePlaceRequest
    {
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string CoverImageUrl { get; set; } = string.Empty;
        public string PriceRange { get; set; } = string.Empty;
        public List<CreatePlaceTranslationRequest> Translations { get; set; } = new();
    }

    public class UpdatePlaceRequest
    {
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string CoverImageUrl { get; set; } = string.Empty;
        public string PriceRange { get; set; } = string.Empty;
        public bool Status { get; set; }
        public List<CreatePlaceTranslationRequest> Translations { get; set; } = new();
    }

    public class CreateDishTranslationRequest
    {
        public string LanguageCode { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class CreateDishRequest
    {
        public Guid PlaceId { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public List<CreateDishTranslationRequest> Translations { get; set; } = new();
    }

    public class UpdateDishRequest
    {
        public string ImageUrl { get; set; } = string.Empty;
        public List<CreateDishTranslationRequest> Translations { get; set; } = new();
    }
}
