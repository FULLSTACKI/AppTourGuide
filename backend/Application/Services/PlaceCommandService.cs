using TourGuideBackend.Application.DTOs.Places;
using TourGuideBackend.Domain.Entities;
using TourGuideBackend.Domain.Repositories;

namespace TourGuideBackend.Application.Services
{
    public class PlaceCommandService
    {
        private readonly List<string> _supportLanguages = new List<string> {"en", "ja", "ko", "zh" }; // Example supported languages
        private readonly IPlaceCommandRepository _repo;
        private readonly IStorageService _storage;
        private readonly ITranslateService _translate;

        public PlaceCommandService(
            IPlaceCommandRepository repo,
            IStorageService storage,
            ITranslateService translate)
        {
            _repo = repo;
            _storage = storage;
            _translate = translate;
        }

        public async Task<PlaceDto> CreateAsync(CreatePlaceRequest req)
        {
            // ----------------------------------------------------------------
            // Step 1: Upload cover image to cloud storage (if provided).
            // ----------------------------------------------------------------
            string coverImageUrl = req.CoverImageUrl;

            if (req.CoverImageStream != null
                && !string.IsNullOrWhiteSpace(req.CoverImageFileName))
            {
                coverImageUrl = await _storage.SaveCloudAsync(
                    req.CoverImageStream,
                    req.CoverImageFileName,
                    req.CoverImageContentType ?? "application/octet-stream");
            }

            // ----------------------------------------------------------------
            // Step 2: Auto-translate translations that have empty Name/Description.
            // The admin supplies the primary language content; the service fills
            // in every other language via ITranslateService.
            // ----------------------------------------------------------------
            var translations = await BuildTranslationsAsync(
                req.Translations,
                req.SourceLanguageCode);

            // ----------------------------------------------------------------
            // Step 3: Map into the Domain entity and persist.
            // ----------------------------------------------------------------

            var place = new Place
            {
                Latitude = req.Latitude,
                Longitude = req.Longitude,
                CoverImageUrl = coverImageUrl,
                PriceRange = req.PriceRange,
                Status = true,
                Translations = translations
            };

            var created = await _repo.CreateAsync(place);
            return MapToDto(created);
        }

        public async Task<PlaceDto> UpdateAsync(Guid id, UpdatePlaceRequest req)
        {
            // Step 1: Upload new cover image if a file stream was provided.
            string coverImageUrl = req.CoverImageUrl;

            if (req.CoverImageStream != null
                && !string.IsNullOrWhiteSpace(req.CoverImageFileName))
            {
                coverImageUrl = await _storage.SaveCloudAsync(
                    req.CoverImageStream,
                    req.CoverImageFileName,
                    req.CoverImageContentType ?? "application/octet-stream");
            }

            // Step 2: Auto-translate where needed.
            var translations = await BuildTranslationsAsync(
                req.Translations,
                req.SourceLanguageCode);

            // Step 3: Map and persist.
            var place = new Place
            {
                Id = id,
                Latitude = req.Latitude,
                Longitude = req.Longitude,
                CoverImageUrl = coverImageUrl,
                PriceRange = req.PriceRange,
                Status = req.Status,
                Translations = translations
            };

            var updated = await _repo.UpdateAsync(place);
            return MapToDto(updated);
        }

        public async Task DeleteAsync(Guid id)
        {
            await _repo.DeleteAsync(id);
        }

        // -----------------------------------------------------------------
        // Builds the list of PlaceTranslation entities with concurrent
        // multi-language translation via TranslateMultipleAsync.
        //
        // Performance model:
        //   Previous: O(N) sequential HTTP calls (2 per language: Name + Description).
        //   Current:  O(1) wall-clock -- two concurrent batches (Name batch, Description
        //             batch), each internally parallelized across all target languages.
        //
        // Flow:
        //   1. Identify the source translation entry.
        //   2. Collect all target language codes that need translation.
        //   3. Fire two concurrent TranslateMultipleAsync calls (Name, Description).
        //   4. Merge results into PlaceTranslation entities.
        // -----------------------------------------------------------------
        private async Task<List<PlaceTranslation>> BuildTranslationsAsync(
            List<CreatePlaceTranslationRequest> dtoTranslations,
            string? sourceLanguageCode)
        {
            if (dtoTranslations == null || dtoTranslations.Count == 0)
            {
                return new List<PlaceTranslation>();
            }

            // --- Step 1: Determine the source translation entry. ---
            var sourceLang = sourceLanguageCode ?? dtoTranslations[0].LanguageCode;
            var sourceEntry = dtoTranslations.FirstOrDefault(
                t => t.LanguageCode.Equals(sourceLang, StringComparison.OrdinalIgnoreCase))
                ?? dtoTranslations[0];

            // --- Step 2: Identify target languages that need auto-translation. ---
            // A target language qualifies when its Name OR Description is blank.
            var targetLangsForName = _supportLanguages
                .Where(lang => !lang.Equals(sourceLang, StringComparison.OrdinalIgnoreCase))
                .ToList();

            var targetLangsForDesc = _supportLanguages
                .Where(lang => !lang.Equals(sourceLang, StringComparison.OrdinalIgnoreCase))
                .ToList();

            // --- Step 3: Fire concurrent batch translations. ---
            // Both batches run in parallel relative to each other, and each batch
            // internally uses Task.WhenAll across its target languages.
            var nameTranslationsTask = !string.IsNullOrWhiteSpace(sourceEntry.Name)
                                       && targetLangsForName.Count > 0
                ? _translate.TranslateMultipleAsync(sourceEntry.Name, targetLangsForName, sourceLang)
                : Task.FromResult(new Dictionary<string, string>());

            var descTranslationsTask = !string.IsNullOrWhiteSpace(sourceEntry.Description)
                                       && targetLangsForDesc.Count > 0
                ? _translate.TranslateMultipleAsync(sourceEntry.Description, targetLangsForDesc, sourceLang)
                : Task.FromResult(new Dictionary<string, string>());

            await Task.WhenAll(nameTranslationsTask, descTranslationsTask);

            var translatedNames = nameTranslationsTask.Result;
            var translatedDescriptions = descTranslationsTask.Result;

            // --- Step 4: Assemble PlaceTranslation entities. ---
            var result = new List<PlaceTranslation>(_supportLanguages.Count);

            // Add the source language entry as-is (no translation needed).
            result.Add(new PlaceTranslation
            {
                LanguageCode = sourceEntry.LanguageCode,
                Name = sourceEntry.Name ?? string.Empty,
                Description = sourceEntry.Description ?? string.Empty,
                AudioUrl = string.Empty // Audio will be generated in another service later
            });

            foreach (var lang in _supportLanguages)
            {
                translatedNames.TryGetValue(lang, out var translatedName);
                translatedDescriptions.TryGetValue(lang, out var translatedDesc);

                result.Add(new PlaceTranslation
                {
                    LanguageCode = lang,
                    Name = translatedName ?? string.Empty,
                    Description = translatedDesc ?? string.Empty,
                    AudioUrl = string.Empty // Audio sẽ được gen ở Service khác sau
                });
            }

            return result;
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
