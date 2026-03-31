import React, { useState } from 'react';
import type { PlaceDto, DishDto, CreateOrderRequest } from '../../types/tour';
import { orderService } from '../../services/tourService';
import { t } from './tourLabels';

interface OrderModalProps {
  place: PlaceDto;
  cart: Record<string, number>;
  lang: string;
  onClose: () => void;
  onSuccess: () => void;
}

const OrderModal: React.FC<OrderModalProps> = ({ place, cart, lang, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');
  const [people, setPeople] = useState(2);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const dishMap = new Map<string, DishDto>();
  place.dishes.forEach(d => dishMap.set(d.id, d));

  const cartEntries = Object.entries(cart).filter(([, qty]) => qty > 0);
  const totalQty = cartEntries.reduce((sum, [, qty]) => sum + qty, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !arrivalTime || cartEntries.length === 0) return;

    setSubmitting(true);
    try {
      const req: CreateOrderRequest = {
        placeId: place.id,
        customerName: name.trim(),
        arrivalTime,
        numberOfPeople: people,
        note: note.trim(),
        items: cartEntries.map(([dishId, qty]) => ({
          dishId,
          quantity: qty,
          dishNameSnapshot: dishMap.get(dishId)?.translation?.name ?? 'Unknown',
        })),
      };
      await orderService.create(req);
      setSuccess(true);
    } catch (err) {
      console.error('Order failed', err);
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Success Screen ───────────────────────────────────
  if (success) {
    return (
      <>
        <div className="fixed inset-0 z-[1010] bg-black/40 backdrop-blur-[2px]" onClick={onSuccess} />
        <div className="fixed inset-0 z-[1011] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 text-center animate-slide-up">
            {/* Animated check */}
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center animate-bounce">
              <span className="text-4xl">✅</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">{t(lang, 'successTitle')}</h2>
            <p className="text-sm text-gray-500 mb-6">{t(lang, 'successMessage')}</p>
            <button
              onClick={onSuccess}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold
                         rounded-xl py-3 transition-colors active:scale-95 shadow-lg shadow-orange-200"
            >
              {t(lang, 'close')}
            </button>
          </div>
        </div>
      </>
    );
  }

  // ─── Booking Form ─────────────────────────────────────
  return (
    <>
      <div className="fixed inset-0 z-[1010] bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="fixed inset-0 z-[1011] flex items-end sm:items-center justify-center">
        <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-slide-up">
          {/* Header */}
          <div className="sticky top-0 bg-white rounded-t-3xl px-5 pt-5 pb-3 border-b border-gray-100 z-10">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">{t(lang, 'booking')}</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 text-lg transition-colors"
              >
                ×
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {place.translation?.name} · {totalQty} {t(lang, 'totalItems')}
            </p>
          </div>

          {/* Order summary */}
          <div className="px-5 pt-4 pb-2">
            <div className="space-y-2">
              {cartEntries.map(([dishId, qty]) => {
                const dish = dishMap.get(dishId);
                return (
                  <div key={dishId} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 truncate flex-1">
                      {dish?.translation?.name ?? 'Unknown'}
                    </span>
                    <span className="text-gray-500 ml-2 flex-shrink-0">×{qty}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-5 pt-3 pb-6 space-y-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t(lang, 'fullName')} *</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={t(lang, 'fullNamePlaceholder')}
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                           focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
              />
            </div>

            {/* Arrival Time */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t(lang, 'arrivalTime')} *</label>
              <input
                type="time"
                value={arrivalTime}
                onChange={e => setArrivalTime(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                           focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
              />
            </div>

            {/* People */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t(lang, 'people')}</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPeople(p => Math.max(1, p - 1))}
                  className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-600 transition-colors"
                >
                  −
                </button>
                <span className="text-lg font-semibold text-gray-800 w-8 text-center">{people}</span>
                <button
                  type="button"
                  onClick={() => setPeople(p => p + 1)}
                  className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-600 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t(lang, 'note')}</label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder={t(lang, 'notePlaceholder')}
                rows={2}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm resize-none
                           focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting || !name.trim() || !arrivalTime}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300
                         text-white font-semibold rounded-xl py-3 transition-all active:scale-95
                         shadow-lg shadow-orange-200 disabled:shadow-none"
            >
              {submitting ? t(lang, 'submitting') : t(lang, 'submit')}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default OrderModal;
