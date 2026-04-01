namespace TourGuideBackend.Application.DTOs.MenuItems
{
    // ─── Response DTOs ──────────────────────────────────────────

    public class MenuItemTranslationDto
    {
        public Guid Id { get; set; }
        public string LanguageCode { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    /// <summary>
    /// Public-facing DTO for a menu item.
    /// Contains the translation in the requested target language AND the
    /// original Vietnamese name, enabling the frontend "Visual Ordering"
    /// feature without additional API calls.
    /// </summary>
    public class MenuItemDto
    {
        public Guid Id { get; set; }
        public Guid PlaceId { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public decimal BasePrice { get; set; }
        public bool IsRecommended { get; set; }
        public List<string> DietaryTags { get; set; } = new();

        /// <summary>
        /// The item name in the original language (Vietnamese) so the tourist
        /// can show the screen to local staff without switching languages.
        /// </summary>
        public string OriginalName { get; set; } = string.Empty;

        /// <summary>
        /// Translation in the user's requested language (e.g. English).
        /// Falls back to null if no translation exists for that language.
        /// </summary>
        public MenuItemTranslationDto? Translation { get; set; }
    }

    // ─── Command DTOs ───────────────────────────────────────────

    public class CreateMenuItemTranslationRequest
    {
        public string LanguageCode { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class CreateMenuItemRequest
    {
        public Guid PlaceId { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public decimal BasePrice { get; set; }
        public bool IsRecommended { get; set; }

        /// <summary>
        /// Comma-separated dietary tags. Example: "seafood,spicy,peanut-free"
        /// </summary>
        public string DietaryTags { get; set; } = string.Empty;

        public List<CreateMenuItemTranslationRequest> Translations { get; set; } = new();
    }

    public class UpdateMenuItemRequest
    {
        public string ImageUrl { get; set; } = string.Empty;
        public decimal BasePrice { get; set; }
        public bool IsRecommended { get; set; }
        public string DietaryTags { get; set; } = string.Empty;
        public List<CreateMenuItemTranslationRequest> Translations { get; set; } = new();
    }
}
