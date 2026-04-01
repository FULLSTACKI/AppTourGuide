export interface PlaceTranslationDto {
  id: string;
  languageCode: string;
  name: string;
  description: string;
  audioUrl: string;
}

export interface DishTranslationDto {
  id: string;
  languageCode: string;
  name: string;
  description: string;
}

export interface DishDto {
  id: string;
  placeId: string;
  imageUrl: string;
  basePrice: number;
  isRecommended: boolean;
  dietaryTags: string[];
  /** Vietnamese name (original) */
  originalName: string;
  /** Translated name in user's target language */
  translatedName: string;
  /** Translated description in user's target language */
  translatedDescription: string;
  translation: DishTranslationDto | null;

  // ─── Currency conversion (populated by backend, null when lang=vi) ───
  /** BasePrice converted to the user's local currency */
  convertedPrice: number | null;
  /** ISO 4217 code, e.g. "USD", "KRW" */
  targetCurrencyCode: string | null;
  /** Display symbol, e.g. "$", "₩" */
  targetCurrencySymbol: string | null;
}

export interface PlaceDto {
  id: string;
  latitude: number;
  longitude: number;
  coverImageUrl: string;
  priceRange: string;
  status: boolean;
  translation: PlaceTranslationDto | null;
  dishes: DishDto[];
}

// ─── Combo / Set Menu ────────────────────────────────────────

export interface ComboTranslationDto {
  id: string;
  languageCode: string;
  name: string;
  description: string;
}

export interface ComboDto {
  id: string;
  placeId: string;
  imageUrl: string;
  basePrice: number;
  /** Vietnamese name (original) */
  originalName: string;
  /** Translated name in user's target language */
  translatedName: string;
  /** Translated description in user's target language */
  translatedDescription: string;
  translation: ComboTranslationDto | null;
  /** Dishes included in this combo (with currency conversion applied) */
  dishes: DishDto[];

  // ─── Currency conversion ───
  convertedPrice: number | null;
  targetCurrencyCode: string | null;
  targetCurrencySymbol: string | null;
}
