import { create } from 'zustand';

/** A single line item on the "Visual Communication Bill". */
export interface BillItem {
  /** Dish or Combo ID */
  id: string;
  /** 'dish' | 'combo' — helps differentiate in the UI */
  type: 'dish' | 'combo';
  /** Vietnamese name — the waiter reads this */
  originalName: string;
  /** Translated name — the tourist reads this */
  translatedName: string;
  /** Price in VND (source of truth for the waiter) */
  basePrice: number;
  /** Price in tourist's currency (null when lang=vi) */
  convertedPrice: number | null;
  /** e.g. "$", "₩" */
  currencySymbol: string | null;
  /** e.g. "USD", "KRW" */
  currencyCode: string | null;
  /** How many of this item */
  quantity: number;
}

interface CommunicationBillState {
  items: BillItem[];

  // ─── Actions ───────────────────────────────────────────────
  addItem: (item: Omit<BillItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  increaseQty: (id: string) => void;
  decreaseQty: (id: string) => void;
  clearBill: () => void;

  // ─── Derived (computed in selectors below) ─────────────────
}

export const useCommunicationBillStore = create<CommunicationBillState>((set) => ({
  items: [],

  addItem: (item) =>
    set((state) => {
      const existing = state.items.find((i) => i.id === item.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
          ),
        };
      }
      return { items: [...state.items, { ...item, quantity: 1 }] };
    }),

  removeItem: (id) =>
    set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

  increaseQty: (id) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.id === id ? { ...i, quantity: i.quantity + 1 } : i,
      ),
    })),

  decreaseQty: (id) =>
    set((state) => ({
      items: state.items
        .map((i) => (i.id === id ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0),
    })),

  clearBill: () => set({ items: [] }),
}));

// ─── Selector helpers (use outside of store to avoid re-renders) ─────

/** Total count of all items */
export const selectItemCount = (state: CommunicationBillState) =>
  state.items.reduce((sum, i) => sum + i.quantity, 0);

/** Total price in VND */
export const selectTotalBasePrice = (state: CommunicationBillState) =>
  state.items.reduce((sum, i) => sum + i.basePrice * i.quantity, 0);

/** Total converted price (null if any item lacks conversion) */
export const selectTotalConvertedPrice = (state: CommunicationBillState) => {
  if (state.items.length === 0) return null;
  if (state.items.some((i) => i.convertedPrice == null)) return null;
  return state.items.reduce((sum, i) => sum + i.convertedPrice! * i.quantity, 0);
};

/** Currency symbol from the first item (all items share the same target) */
export const selectCurrencySymbol = (state: CommunicationBillState) =>
  state.items[0]?.currencySymbol ?? null;

/** Currency code from the first item (all items share the same target) */
export const selectCurrencyCode = (state: CommunicationBillState) =>
  state.items[0]?.currencyCode ?? null;
