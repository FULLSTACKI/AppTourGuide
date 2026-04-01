import React, { useState, useEffect, useCallback } from 'react';
import type { PlaceDto } from '../../types/tour';
import { t } from './tourLabels';
import MenuSection from './MenuSection';
import ComboSection from './ComboSection';
import VisualBillModal from './VisualBillModal';
import { useCommunicationBillStore, selectItemCount } from '../../stores/useCommunicationBillStore';

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
  const [showBill, setShowBill] = useState(false);
  const billCount = useCommunicationBillStore(selectItemCount);

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

    window.speechSynthesis.cancel();

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
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              {place.translation?.name ?? 'Unknown Place'}
            </h2>

            <p className="text-xs text-gray-400 mb-3">
              📍 {place.latitude.toFixed(5)}, {place.longitude.toFixed(5)}
            </p>

            {place.translation?.description && (
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                {place.translation.description}
              </p>
            )}

            {/* Voice Narration */}
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

            {/* Smart Menu (view-only) */}
            <div>
              <MenuSection
                placeId={place.id}
                lang={lang}
              />
            </div>

            {/* Combo / Set Menus */}
            <div>
              <ComboSection
                placeId={place.id}
                lang={lang}
              />
            </div>
          </div>
        </div>

        {/* ─── Floating "View Bill" FAB ─────────────────── */}
        {billCount > 0 && !showBill && (
          <button
            onClick={() => setShowBill(true)}
            className="fixed bottom-6 right-6 z-[1003] bg-orange-500 hover:bg-orange-600
                       text-white rounded-full px-5 py-3.5 shadow-2xl shadow-orange-300
                       flex items-center gap-2 text-sm font-bold transition-all active:scale-95
                       animate-bounce-subtle"
          >
            <span className="text-lg">🧾</span>
            {t(lang, 'viewBill')}
            <span className="bg-white text-orange-600 text-xs font-extrabold rounded-full w-6 h-6
                             flex items-center justify-center -mr-1">
              {billCount}
            </span>
          </button>
        )}

        {/* ─── Visual Communication Bill (full-screen overlay) ── */}
        {showBill && (
          <VisualBillModal
            lang={lang}
            onClose={() => setShowBill(false)}
          />
        )}
      </div>
    </>
  );
};

export default PlaceDetailSheet;