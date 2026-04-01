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

    /// <summary>
    /// Public-facing DTO for a dish.
    /// Contains the original Vietnamese name for the "Visual Ordering" feature
    /// (tourist shows the screen to local staff) alongside the translated name
    /// in the user's requested target language.
    /// </summary>
    public class DishDto
    {
        public Guid Id { get; set; }
        public Guid PlaceId { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public decimal BasePrice { get; set; }
        public bool IsRecommended { get; set; }
        public List<string> DietaryTags { get; set; } = new();

        /// <summary>
        /// The dish name in the original/source language (Vietnamese) so the
        /// tourist can show the screen to local staff without switching languages.
        /// </summary>
        public string OriginalName { get; set; } = string.Empty;

        /// <summary>
        /// Translated dish name in the user's requested target language.
        /// Falls back to OriginalName if no translation exists.
        /// </summary>
        public string TranslatedName { get; set; } = string.Empty;

        /// <summary>
        /// Translated description in the user's requested target language.
        /// Falls back to original description if no translation exists.
        /// </summary>
        public string TranslatedDescription { get; set; } = string.Empty;

        /// <summary>
        /// Full translation object (kept for backward compatibility with the
        /// existing PlaceDto.Dishes mapping in PlaceQueryService).
        /// </summary>
        public DishTranslationDto? Translation { get; set; }

        // ─── Currency Conversion (populated at query time) ───────────
        /// <summary>
        /// The base price converted to the user's target currency.
        /// Null if the target language maps to VND or rates are unavailable.
        /// </summary>
        public decimal? ConvertedPrice { get; set; }

        /// <summary>ISO 4217 currency code, e.g. "USD", "KRW". Null when no conversion.</summary>
        public string? TargetCurrencyCode { get; set; }

        /// <summary>Display symbol, e.g. "$", "₩". Null when no conversion.</summary>
        public string? TargetCurrencySymbol { get; set; }
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

    // ─── Combo / Set Menu DTOs ───────────────────────────────────

    public class ComboTranslationDto
    {
        public Guid Id { get; set; }
        public string LanguageCode { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    /// <summary>
    /// Public-facing DTO for a combo / set menu.
    /// Contains the included dishes (with currency conversion already applied),
    /// the combo's own base price, and its translation.
    /// </summary>
    public class ComboDto
    {
        public Guid Id { get; set; }
        public Guid PlaceId { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public decimal BasePrice { get; set; }

        /// <summary>
        /// Combo name in the original/source language (Vietnamese).
        /// </summary>
        public string OriginalName { get; set; } = string.Empty;

        /// <summary>
        /// Translated combo name in the user's target language.
        /// </summary>
        public string TranslatedName { get; set; } = string.Empty;

        /// <summary>
        /// Translated description in the user's target language.
        /// </summary>
        public string TranslatedDescription { get; set; } = string.Empty;

        public ComboTranslationDto? Translation { get; set; }

        /// <summary>Dishes included in this combo (with currency conversion applied).</summary>
        public List<DishDto> Dishes { get; set; } = new();

        // ─── Currency Conversion ─────────────────────────────────
        public decimal? ConvertedPrice { get; set; }
        public string? TargetCurrencyCode { get; set; }
        public string? TargetCurrencySymbol { get; set; }
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

        // --- File-upload fields (populated by the Controller from IFormFile) ---
        // These use plain CLR types to avoid coupling to ASP.NET HTTP abstractions.
        public Stream? CoverImageStream { get; set; }
        public string? CoverImageFileName { get; set; }
        public string? CoverImageContentType { get; set; }

        // --- Auto-translation control ---
        // When set, the service will translate the primary translation's Name and
        // Description into every other language code listed in Translations.
        public string? SourceLanguageCode { get; set; }
    }

    public class UpdatePlaceRequest
    {
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string CoverImageUrl { get; set; } = string.Empty;
        public string PriceRange { get; set; } = string.Empty;
        public bool Status { get; set; }
        public List<CreatePlaceTranslationRequest> Translations { get; set; } = new();

        // --- File-upload fields (populated by the Controller from IFormFile) ---
        public Stream? CoverImageStream { get; set; }
        public string? CoverImageFileName { get; set; }
        public string? CoverImageContentType { get; set; }

        // --- Auto-translation control ---
        public string? SourceLanguageCode { get; set; }
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
        public decimal BasePrice { get; set; }
        public bool IsRecommended { get; set; }

        /// <summary>
        /// Comma-separated dietary tags. Example: "seafood,spicy,peanut-free"
        /// </summary>
        public string DietaryTags { get; set; } = string.Empty;

        public List<CreateDishTranslationRequest> Translations { get; set; } = new();
    }

    public class UpdateDishRequest
    {
        public string ImageUrl { get; set; } = string.Empty;
        public decimal BasePrice { get; set; }
        public bool IsRecommended { get; set; }
        public string DietaryTags { get; set; } = string.Empty;
        public List<CreateDishTranslationRequest> Translations { get; set; } = new();
    }
}
