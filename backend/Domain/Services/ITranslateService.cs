namespace TourGuideBackend.Domain.Repositories
{
    /// <summary>
    /// Abstraction for text translation operations.
    /// Infrastructure implementations may target Google Cloud Translation, Azure Translator, etc.
    /// </summary>
    public interface ITranslateService
    {
        /// <summary>
        /// Translates the given text from the source language to the target language.
        /// </summary>
        /// <param name="text">The text to translate.</param>
        /// <param name="targetLang">BCP-47 language code of the target language (e.g. "vi", "en").</param>
        /// <param name="sourceLang">BCP-47 language code of the source language (e.g. "en", "vi").</param>
        /// <returns>The translated text.</returns>
        Task<string> TranslateTextAsync(string text, string targetLang, string sourceLang);

        /// <summary>
        /// Translates the given text into multiple target languages concurrently.
        /// Implementations must use parallel execution (e.g. Task.WhenAll) so that
        /// wall-clock time is O(1) relative to the number of target languages, not O(N).
        /// A failure for one language must not prevent the others from succeeding;
        /// failed entries should map to the original (untranslated) text.
        /// </summary>
        /// <param name="text">The source text to translate.</param>
        /// <param name="targetLangs">Collection of BCP-47 target language codes.</param>
        /// <param name="sourceLang">BCP-47 code of the source language.</param>
        /// <returns>
        /// Dictionary mapping each target language code to its translated text.
        /// On per-language failure the value falls back to <paramref name="text"/>.
        /// </returns>
        Task<Dictionary<string, string>> TranslateMultipleAsync(
            string text,
            IEnumerable<string> targetLangs,
            string sourceLang);
    }
}
