import { http } from './http';
import type {
  LoginRequest,
  LoginResponse,
  DishFormData,
  AdminPlaceRow,
  AdminDishRow,
  PlaceCreatePayload,
  MenuItemFormData,
  AdminMenuItemRow,
} from '../types/admin';

/** Auth */
export const authService = {
  login: (data: LoginRequest) =>
    http.post<LoginResponse>('/auth/login', data).then(r => r.data),

  me: () =>
    http.get<LoginResponse>('/auth/me').then(r => r.data),
};

/** Places (admin CRUD) */

/**
 * Build a FormData object from PlaceCreatePayload that matches the backend
 * [FromForm] CreatePlaceRequest + IFormFile? coverImage binding.
 *
 * ASP.NET Core model binding uses PascalCase keys and array-index syntax
 * for list properties: Translations[0].LanguageCode, Translations[0].Name, etc.
 */
function buildPlaceFormData(payload: PlaceCreatePayload): FormData {
  const fd = new FormData();

  fd.append('Latitude', payload.latitude.toString());
  fd.append('Longitude', payload.longitude.toString());
  fd.append('PriceRange', payload.priceRange);
  fd.append('SourceLanguageCode', payload.sourceLanguageCode);

  // Map the single translation into index 0 of the C# List<CreatePlaceTranslationRequest>.
  fd.append('Translations[0].LanguageCode', payload.sourceLanguageCode);
  fd.append('Translations[0].Name', payload.translation.name);
  fd.append('Translations[0].Description', payload.translation.description);

  // Attach the cover image file if one was selected.
  if (payload.coverImage) {
    fd.append('coverImage', payload.coverImage, payload.coverImage.name);
  }

  return fd;
}

export const adminPlacesService = {
  getAll: (lang = 'en') =>
    http.get<AdminPlaceRow[]>('/api/places', { params: { lang } }).then(r => r.data),

  getById: (id: string, lang = 'en') =>
    http.get<AdminPlaceRow>(`/api/places/${id}`, { params: { lang } }).then(r => r.data),

  /** Send as multipart/form-data to match [FromForm] + IFormFile on the backend. */
  create: (payload: PlaceCreatePayload) =>
    http.post<AdminPlaceRow>('/api/places', buildPlaceFormData(payload), {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data),

  /** Send as multipart/form-data to match [FromForm] + IFormFile on the backend. */
  update: (id: string, payload: PlaceCreatePayload) =>
    http.put<AdminPlaceRow>(`/api/places/${id}`, buildPlaceFormData(payload), {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data),

  delete: (id: string) =>
    http.delete(`/api/places/${id}`),
};

/** Dishes (admin CRUD) */
export const adminDishesService = {
  getByPlace: (placeId: string, lang = 'en') =>
    http.get<AdminDishRow[]>(`/api/dishes/by-place/${placeId}`, { params: { lang } }).then(r => r.data),

  getById: (id: string, lang = 'en') =>
    http.get<AdminDishRow>(`/api/dishes/${id}`, { params: { lang } }).then(r => r.data),

  create: (data: DishFormData) =>
    http.post<AdminDishRow>('/api/dishes', data).then(r => r.data),

  update: (id: string, data: Omit<DishFormData, 'placeId'>) =>
    http.put<AdminDishRow>(`/api/dishes/${id}`, data).then(r => r.data),

  delete: (id: string) =>
    http.delete(`/api/dishes/${id}`),
};

/** Menu Items (admin CRUD) */
export const adminMenuItemsService = {
  getByPlace: (placeId: string, lang = 'en') =>
    http.get<AdminMenuItemRow[]>(`/api/menu-items/by-place/${placeId}`, { params: { lang } }).then(r => r.data),

  getById: (id: string, lang = 'en') =>
    http.get<AdminMenuItemRow>(`/api/menu-items/${id}`, { params: { lang } }).then(r => r.data),

  create: (data: MenuItemFormData) =>
    http.post<AdminMenuItemRow>('/api/menu-items', data).then(r => r.data),

  update: (id: string, data: Omit<MenuItemFormData, 'placeId'>) =>
    http.put<AdminMenuItemRow>(`/api/menu-items/${id}`, data).then(r => r.data),

  delete: (id: string) =>
    http.delete(`/api/menu-items/${id}`),
};
