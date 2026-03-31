import React, { useState, useEffect, useCallback } from 'react';
import type { PlaceDto } from '../../types/tour';
import { t } from './tourLabels';
import OrderModal from './OrderModal';

/** Maps short lang codes to BCP-47 speech synthesis locale tags */
const SPEECH_LANG_MAP: Record<string, string> = {
  en: 'en-US',
  vi: 'vi-VN',
  ja: 'ja-JP',
  ko: 'ko-KR',
  zh: 'zh-CN',
};

interface PlaceDetailSheetProps {
  place: PlaceDto;
  lang: string;
  onClose: () => void;
}

const PlaceDetailSheet: React.FC<PlaceDetailSheetProps> = ({ place, lang, onClose }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [showOrderModal, setShowOrderModal] = useState(false);

  const totalQty = Object.values(cart).reduce((s, q) => s + q, 0);

  const addToCart = (dishId: string) =>
    setCart(prev => ({ ...prev, [dishId]: (prev[dishId] ?? 0) + 1 }));

  const removeFromCart = (dishId: string) =>
    setCart(prev => {
      const next = { ...prev };
      if ((next[dishId] ?? 0) <= 1) delete next[dishId];
      else next[dishId]--;
      return next;
    });

  // Stop speech when sheet closes / place changes
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [place.id]);

  const toggleSpeak = useCallback(() => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const text = place.translation?.description;
    if (!text) return;

    window.speechSynthesis.cancel(); // prevent overlap

    const name = place.translation?.name ?? '';
    const utterance = new SpeechSynthesisUtterance(
      name ? `${name}. ${text}` : text
    );
    utterance.lang = SPEECH_LANG_MAP[lang] ?? 'en-US';
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  }, [isSpeaking, place.translation, lang]);

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 z-[1001] bg-black/30 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Bottom sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-[1002] bg-white rounded-t-3xl shadow-2xl
                   max-h-[85vh] overflow-hidden flex flex-col animate-slide-up"
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 overscroll-contain">
          {/* Hero Banner */}
          <div className="relative">
            {place.coverImageUrl ? (
              <img
                src={place.coverImageUrl}
                alt={place.translation?.name ?? ''}
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="w-full h-48 bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center">
                <span className="text-5xl">🍜</span>
              </div>
            )}

            {/* Close button on hero */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 bg-black/40 hover:bg-black/60
                         rounded-full flex items-center justify-center text-white text-lg
                         transition-colors backdrop-blur-sm"
              aria-label="Close details"
            >
              ×
            </button>

            {/* Price badge */}
            <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-semibold text-gray-800 shadow">
              💰 {place.priceRange}
            </div>

            {/* Status badge */}
            <div
              className={`absolute bottom-3 right-3 rounded-full px-3 py-1 text-xs font-semibold shadow
                ${place.status ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'}`}
            >
              {place.status ? t(lang, 'open') : t(lang, 'closed')}
            </div>
          </div>

          {/* Body */}
          <div className="px-4 pt-4 pb-6">
            {/* Title */}
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              {place.translation?.name ?? 'Unknown Place'}
            </h2>

            {/* Coordinates */}
            <p className="text-xs text-gray-400 mb-3">
              📍 {place.latitude.toFixed(5)}, {place.longitude.toFixed(5)}
            </p>

            {/* Description */}
            {place.translation?.description && (
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                {place.translation.description}
              </p>
            )}

            {/* ─── Voice Narration (Web Speech API) ─────── */}
            {place.translation?.description && (
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 rounded-2xl p-4 mb-5">
                <p className="text-xs font-semibold text-orange-700 uppercase tracking-wider mb-3">
                  {t(lang, 'voiceGuide')}
                </p>

                <button
                  onClick={toggleSpeak}
                  className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold
                             shadow-lg transition-all active:scale-95
                             ${isSpeaking
                               ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-200'
                               : 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-200'
                             }`}
                  aria-label={isSpeaking ? 'Stop narration' : 'Read aloud'}
                >
                  <span className="text-lg">{isSpeaking ? '⏹' : '▶'}</span>
                  {isSpeaking ? t(lang, 'stopNarration') : t(lang, 'readAloud')}
                </button>
              </div>
            )}

            {/* ─── Dishes / Menu ──────────────────────── */}
            {place.dishes.length > 0 && (
              <div className={totalQty > 0 ? 'pb-20' : ''}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">🍽</span>
                  <h3 className="text-base font-bold text-gray-800">{t(lang, 'menu')}</h3>
                  <span className="text-xs text-gray-400 ml-auto">
                    {place.dishes.length} {place.dishes.length === 1 ? t(lang, 'item') : t(lang, 'items')}
                  </span>
                </div>

                <div className="space-y-3">
                  {place.dishes.map(dish => {
                    const qty = cart[dish.id] ?? 0;
                    return (
                      <div
                        key={dish.id}
                        className="flex gap-3 bg-gray-50 rounded-xl p-3 hover:bg-gray-100 transition-colors"
                      >
                        {/* Dish thumbnail */}
                        {dish.imageUrl ? (
                          <img
                            src={dish.imageUrl}
                            alt={dish.translation?.name ?? ''}
                            className="w-20 h-20 rounded-xl object-cover flex-shrink-0 shadow-sm"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-xl bg-gray-200 flex items-center justify-center flex-shrink-0">
                            <span className="text-2xl">🍽</span>
                          </div>
                        )}

                        {/* Dish info + quantity */}
                        <div className="flex-1 min-w-0 py-0.5 flex flex-col justify-between">
                          <div>
                            <p className="text-sm font-semibold text-gray-800 truncate">
                              {dish.translation?.name ?? 'Unknown Dish'}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                              {dish.translation?.description}
                            </p>
                          </div>

                          {/* Quantity controls */}
                          <div className="flex items-center gap-2 mt-1.5">
                            {qty > 0 ? (
                              <>
                                <button
                                  onClick={() => removeFromCart(dish.id)}
                                  className="w-7 h-7 rounded-lg bg-orange-100 hover:bg-orange-200 flex items-center justify-center text-orange-600 font-bold text-sm transition-colors"
                                >
                                  −
                                </button>
                                <span className="text-sm font-semibold text-gray-800 w-5 text-center">{qty}</span>
                                <button
                                  onClick={() => addToCart(dish.id)}
                                  className="w-7 h-7 rounded-lg bg-orange-100 hover:bg-orange-200 flex items-center justify-center text-orange-600 font-bold text-sm transition-colors"
                                >
                                  +
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => addToCart(dish.id)}
                                className="px-3 py-1 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold transition-colors active:scale-95"
                              >
                                + {t(lang, 'preOrder')}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ─── Floating Pre-order Bar ──────────────── */}
        {totalQty > 0 && (
          <div className="flex-shrink-0 border-t border-gray-100 bg-white px-4 py-3">
            <button
              onClick={() => setShowOrderModal(true)}
              className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600
                         text-white font-semibold rounded-xl py-3 shadow-lg shadow-orange-200
                         transition-all active:scale-95"
            >
              <span className="text-lg">🛒</span>
              {t(lang, 'checkout')} · {totalQty} {t(lang, 'totalItems')}
            </button>
          </div>
        )}
      </div>

      {/* Order Modal */}
      {showOrderModal && (
        <OrderModal
          place={place}
          cart={cart}
          lang={lang}
          onClose={() => setShowOrderModal(false)}
          onSuccess={() => {
            setShowOrderModal(false);
            setCart({});
          }}
        />
      )}
    </>
  );
};

export default PlaceDetailSheet;
