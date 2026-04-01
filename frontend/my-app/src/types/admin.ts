/** Auth-related types for the Admin dashboard */

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  accessToken?: string;
  role?: string;
  displayName?: string;
}

export interface AuthUser {
  displayName: string;
  role: string;
}

/** Admin-facing place types (multilingual — all translations at once) */

export interface PlaceTranslationInput {
  languageCode: string;
  name: string;
  description: string;
  audioUrl: string;
}

export interface PlaceFormData {
  latitude: number;
  longitude: number;
  coverImageUrl: string;
  priceRange: string;
  status: boolean;
  translations: PlaceTranslationInput[];
}

/**
 * Logical frontend state for creating/updating a Place.
 * Sent as multipart/form-data to match [FromForm] + IFormFile on the backend.
 */
export interface PlaceCreatePayload {
  latitude: number;
  longitude: number;
  priceRange: string;
  sourceLanguageCode: string;
  coverImage: File | null;
  translation: {
    name: string;
    description: string;
  };
}

export interface DishTranslationInput {
  languageCode: string;
  name: string;
  description: string;
}

export interface DishFormData {
  placeId: string;
  imageUrl: string;
  translations: DishTranslationInput[];
}

/** The full admin Place row returned by GET with all translations */
export interface AdminPlaceRow {
  id: string;
  latitude: number;
  longitude: number;
  coverImageUrl: string;
  priceRange: string;
  status: boolean;
  translation: {
    name: string;
    description: string;
    audioUrl: string;
    languageCode: string;
  } | null;
  dishes: AdminDishRow[];
}

export interface AdminDishRow {
  id: string;
  placeId: string;
  imageUrl: string;
  translation: {
    name: string;
    description: string;
    languageCode: string;
  } | null;
}

// ─── MenuItem admin types ────────────────────────────────
export interface MenuItemTranslationInput {
  languageCode: string;
  name: string;
  description: string;
}

export interface MenuItemFormData {
  placeId: string;
  imageUrl: string;
  basePrice: number;
  isRecommended: boolean;
  dietaryTags: string;
  translations: MenuItemTranslationInput[];
}

export interface AdminMenuItemRow {
  id: string;
  placeId: string;
  imageUrl: string;
  basePrice: number;
  isRecommended: boolean;
  dietaryTags: string[];
  originalName: string;
  translation: {
    id: string;
    languageCode: string;
    name: string;
    description: string;
  } | null;
}
