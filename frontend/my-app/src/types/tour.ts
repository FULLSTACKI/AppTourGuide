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
  translation: DishTranslationDto | null;
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

// ─── Order types ──────────────────────────────────────────
export interface OrderItemRequest {
  dishId: string;
  quantity: number;
  dishNameSnapshot: string;
}

export interface CreateOrderRequest {
  placeId: string;
  customerName: string;
  arrivalTime: string;
  numberOfPeople: number;
  note: string;
  items: OrderItemRequest[];
}

export interface OrderItemDto {
  id: string;
  dishId: string;
  quantity: number;
  dishNameSnapshot: string;
}

export interface OrderDto {
  id: string;
  placeId: string;
  customerName: string;
  arrivalTime: string;
  numberOfPeople: number;
  note: string;
  status: string;
  createdAt: string;
  items: OrderItemDto[];
}
