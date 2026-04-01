import { http } from './http';
import type { PlaceDto, DishDto, ComboDto } from '../types/tour';

export const placesService = {
  getAll: (lang: string = 'en') =>
    http.get<PlaceDto[]>('/api/places', { params: { lang } }).then(r => r.data),

  getById: (id: string, lang: string = 'en') =>
    http.get<PlaceDto>(`/api/places/${id}`, { params: { lang } }).then(r => r.data),
};

export const dishesService = {
  /** Get dishes for a place with dietary filtering and dual-language translations. */
  getByPlace: (placeId: string, lang = 'en', dietary?: string) =>
    http.get<DishDto[]>(`/api/places/${placeId}/dishes`, {
      params: { lang, ...(dietary ? { dietary } : {}) },
    }).then(r => r.data),

  /** Get recommended dishes for cross-sell. */
  getRecommended: (placeId: string, lang = 'en') =>
    http.get<DishDto[]>(`/api/places/${placeId}/dishes/recommended`, { params: { lang } }).then(r => r.data),

  getById: (id: string, lang = 'en') =>
    http.get<DishDto>(`/api/dishes/${id}`, { params: { lang } }).then(r => r.data),

  /** "Perfect Match" — related dishes (bidirectional). */
  getRelated: (dishId: string, lang = 'en') =>
    http.get<DishDto[]>(`/api/dishes/${dishId}/related`, { params: { lang } }).then(r => r.data),
};

export const combosService = {
  /** Fetch all combos / set menus for a place with dual-language translations. */
  getByPlace: (placeId: string, lang = 'en') =>
    http.get<ComboDto[]>(`/api/places/${placeId}/combos`, { params: { lang } }).then(r => r.data),
};
