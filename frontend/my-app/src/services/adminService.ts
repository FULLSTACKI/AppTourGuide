import { http } from './http';
import type {
  LoginRequest,
  LoginResponse,
  PlaceFormData,
  DishFormData,
  AdminPlaceRow,
  AdminDishRow,
} from '../types/admin';

/** Auth */
export const authService = {
  login: (data: LoginRequest) =>
    http.post<LoginResponse>('/auth/login', data).then(r => r.data),

  me: () =>
    http.get<LoginResponse>('/auth/me').then(r => r.data),
};

/** Places (admin CRUD) */
export const adminPlacesService = {
  getAll: (lang = 'en') =>
    http.get<AdminPlaceRow[]>('/api/places', { params: { lang } }).then(r => r.data),

  getById: (id: string, lang = 'en') =>
    http.get<AdminPlaceRow>(`/api/places/${id}`, { params: { lang } }).then(r => r.data),

  create: (data: PlaceFormData) =>
    http.post<AdminPlaceRow>('/api/places', data).then(r => r.data),

  update: (id: string, data: PlaceFormData) =>
    http.put<AdminPlaceRow>(`/api/places/${id}`, data).then(r => r.data),

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
