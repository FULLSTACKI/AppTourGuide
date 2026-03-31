import { http } from './http';
import type { PlaceDto, DishDto, CreateOrderRequest, OrderDto } from '../types/tour';

export const placesService = {
  getAll: (lang: string = 'en') =>
    http.get<PlaceDto[]>('/api/places', { params: { lang } }).then(r => r.data),

  getById: (id: string, lang: string = 'en') =>
    http.get<PlaceDto>(`/api/places/${id}`, { params: { lang } }).then(r => r.data),
};

export const dishesService = {
  getByPlace: (placeId: string, lang: string = 'en') =>
    http.get<DishDto[]>(`/api/dishes/by-place/${placeId}`, { params: { lang } }).then(r => r.data),

  getById: (id: string, lang: string = 'en') =>
    http.get<DishDto>(`/api/dishes/${id}`, { params: { lang } }).then(r => r.data),
};

export const orderService = {
  create: (req: CreateOrderRequest) =>
    http.post<OrderDto>('/api/orders', req).then(r => r.data),

  getById: (id: string) =>
    http.get<OrderDto>(`/api/orders/${id}`).then(r => r.data),
};
