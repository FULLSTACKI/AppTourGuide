using GTranslate.Translators;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TourGuideBackend.Domain.Repositories; // Thay bằng namespace chứa ITranslateService của bạn

namespace TourGuideBackend.Infrastructure.Persistence.Repositories
{
    public class TranslateService : ITranslateService
    {
        private readonly GoogleTranslator _translator;
        private readonly ILogger<TranslateService> _logger;

        public TranslateService(ILogger<TranslateService> logger)
        {
            // Khởi tạo GoogleTranslator từ thư viện GTranslate (Không cần API Key)
            _translator = new GoogleTranslator();
            _logger = logger;
        }

        public async Task<string> TranslateTextAsync(string text, string targetLang, string sourceLang)
        {
            if (string.IsNullOrWhiteSpace(text))
            {
                return string.Empty;
            }

            try
            {
                var response = await _translator.TranslateAsync(text, targetLang, sourceLang);
                return response.Translation;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Translation failed for target language: {TargetLang}", targetLang);
                return text; // Fallback về text gốc nếu lỗi
            }
        }

        /// <summary>
        /// Translates a single text into multiple target languages concurrently using Task.WhenAll.
        /// Each language translation runs as an independent task. If one language fails, it falls
        /// back to the original text and the remaining translations are unaffected.
        /// </summary>
        public async Task<Dictionary<string, string>> TranslateMultipleAsync(
            string text,
            IEnumerable<string> targetLangs,
            string sourceLang)
        {
            if (string.IsNullOrWhiteSpace(text))
            {
                return targetLangs.ToDictionary(lang => lang, _ => string.Empty);
            }

            var langList = targetLangs.ToList();
            var results = new Dictionary<string, string>(langList.Count);

            // Build one task per target language.
            var tasks = langList.Select(async targetLang =>
            {
                try
                {
                    // Sử dụng GTranslate để dịch
                    var response = await _translator.TranslateAsync(text, targetLang, sourceLang);

                    return new { Lang = targetLang, Text = response.Translation };
                }
                catch (Exception ex)
                {
                    // Log the failure and fall back to the original untranslated text.
                    // This prevents a single language error from aborting the entire batch.
                    _logger.LogWarning(
                        ex,
                        "Translation to '{TargetLang}' failed. Falling back to source text.",
                        targetLang);

                    return new { Lang = targetLang, Text = text };
                }
            }).ToList();

            // Execute all translation requests concurrently.
            var completed = await Task.WhenAll(tasks);

            foreach (var entry in completed)
            {
                results[entry.Lang] = entry.Text;
            }

            return results;
        }
    }
}