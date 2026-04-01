namespace TourGuideBackend.Domain.Services
{
    /// <summary>
    /// Provides currency conversion capabilities using real-time exchange rates
    /// with in-memory caching to minimize external API calls.
    /// </summary>
    public interface ICurrencyExchangeService
    {
        /// <summary>
        /// Converts a price from VND to the target currency derived from the requested language.
        /// Returns null if the target language maps to VND (no conversion needed) or if
        /// exchange rates are unavailable.
        /// </summary>
        Task<CurrencyConversionResult?> ConvertFromVndAsync(decimal basePriceVnd, string targetLang);
    }

    /// <summary>
    /// Immutable result of a currency conversion operation.
    /// </summary>
    public class CurrencyConversionResult
    {
        public decimal ConvertedPrice { get; init; }
        public string CurrencyCode { get; init; } = string.Empty;
        public string CurrencySymbol { get; init; } = string.Empty;
    }
}
