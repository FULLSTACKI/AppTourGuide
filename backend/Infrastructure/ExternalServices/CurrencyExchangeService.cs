using System.Text.Json;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using TourGuideBackend.Domain.Services;

namespace TourGuideBackend.Infrastructure.ExternalServices
{
    /// <summary>
    /// Fetches real-time exchange rates from the free Open Exchange Rate API (open.er-api.com)
    /// and caches them for 12 hours using IMemoryCache. Converts VND base prices to the
    /// currency mapped from the user's target language.
    /// </summary>
    public class CurrencyExchangeService : ICurrencyExchangeService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IMemoryCache _cache;
        private readonly ILogger<CurrencyExchangeService> _logger;

        private const string CacheKey = "ExchangeRates_VND";
        private static readonly TimeSpan CacheDuration = TimeSpan.FromHours(12);

        // Free API: https://open.er-api.com/v6/latest/VND
        private const string ApiUrl = "https://open.er-api.com/v6/latest/VND";

        /// <summary>
        /// Maps BCP-47 language codes to ISO 4217 currency codes.
        /// "vi" → VND means no conversion needed (returns null).
        /// </summary>
        private static readonly Dictionary<string, string> LangToCurrency = new(StringComparer.OrdinalIgnoreCase)
        {
            ["en"] = "USD",
            ["ko"] = "KRW",
            ["ja"] = "JPY",
            ["zh"] = "CNY",
            ["fr"] = "EUR",
            ["de"] = "EUR",
            ["es"] = "EUR",
            ["it"] = "EUR",
            ["pt"] = "BRL",
            ["th"] = "THB",
            ["vi"] = "VND",
        };

        /// <summary>
        /// Maps ISO 4217 currency codes to their display symbols.
        /// </summary>
        private static readonly Dictionary<string, string> CurrencySymbols = new(StringComparer.OrdinalIgnoreCase)
        {
            ["USD"] = "$",
            ["KRW"] = "₩",
            ["JPY"] = "¥",
            ["CNY"] = "¥",
            ["EUR"] = "€",
            ["BRL"] = "R$",
            ["THB"] = "฿",
            ["VND"] = "₫",
            ["GBP"] = "£",
            ["AUD"] = "A$",
            ["SGD"] = "S$",
        };

        public CurrencyExchangeService(
            IHttpClientFactory httpClientFactory,
            IMemoryCache cache,
            ILogger<CurrencyExchangeService> logger)
        {
            _httpClientFactory = httpClientFactory;
            _cache = cache;
            _logger = logger;
        }

        public async Task<CurrencyConversionResult?> ConvertFromVndAsync(decimal basePriceVnd, string targetLang)
        {
            // Determine target currency from language
            if (!LangToCurrency.TryGetValue(targetLang, out var currencyCode))
            {
                // Unsupported language → default to VND (no conversion)
                return null;
            }

            // VND → VND: no conversion needed
            if (currencyCode == "VND")
                return null;

            // Fetch (or retrieve from cache) the exchange rates
            var rates = await GetCachedRatesAsync();
            if (rates == null || !rates.TryGetValue(currencyCode, out var rate))
            {
                _logger.LogWarning("Exchange rate for {Currency} not available. Skipping conversion.", currencyCode);
                return null;
            }

            var convertedPrice = Math.Round(basePriceVnd * (decimal)rate, 2);

            return new CurrencyConversionResult
            {
                ConvertedPrice = convertedPrice,
                CurrencyCode = currencyCode,
                CurrencySymbol = CurrencySymbols.GetValueOrDefault(currencyCode, currencyCode),
            };
        }

        /// <summary>
        /// Retrieves exchange rates from cache or fetches fresh data from the external API.
        /// Cached for 12 hours to minimise external API calls.
        /// </summary>
        private async Task<Dictionary<string, double>?> GetCachedRatesAsync()
        {
            if (_cache.TryGetValue(CacheKey, out Dictionary<string, double>? cachedRates))
            {
                return cachedRates;
            }

            try
            {
                var client = _httpClientFactory.CreateClient("ExchangeRate");
                var response = await client.GetAsync(ApiUrl);
                response.EnsureSuccessStatusCode();

                var json = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(json);

                var root = doc.RootElement;
                if (root.GetProperty("result").GetString() != "success")
                {
                    _logger.LogWarning("Exchange rate API returned non-success result.");
                    return null;
                }

                var ratesElement = root.GetProperty("rates");
                var rates = new Dictionary<string, double>(StringComparer.OrdinalIgnoreCase);

                foreach (var prop in ratesElement.EnumerateObject())
                {
                    if (prop.Value.TryGetDouble(out var value))
                    {
                        rates[prop.Name] = value;
                    }
                }

                // Cache the rates for 12 hours
                var cacheOptions = new MemoryCacheEntryOptions()
                    .SetAbsoluteExpiration(CacheDuration)
                    .SetSize(1);

                _cache.Set(CacheKey, rates, cacheOptions);

                _logger.LogInformation("Exchange rates cached successfully. {Count} currencies available.", rates.Count);
                return rates;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to fetch exchange rates from external API.");
                return null;
            }
        }
    }
}
