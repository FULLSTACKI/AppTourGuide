import React from 'react';
import {
  useCommunicationBillStore,
  selectItemCount,
  selectTotalBasePrice,
  selectTotalConvertedPrice,
  selectCurrencySymbol,
  selectCurrencyCode,
} from '../../stores/useCommunicationBillStore';
import { useShallow } from 'zustand/react/shallow';
import { t } from './tourLabels';

interface VisualBillModalProps {
  lang: string;
  onClose: () => void;
}

/**
 * Full-screen "Visual Communication Bill".
 *
 * Design rationale:
 * - The tourist physically hands their phone to the waiter.
 * - The waiter ONLY reads Vietnamese → OriginalName is HUGE.
 * - The total in VND is the only price the waiter cares about → MASSIVE.
 * - Translated names are tiny/muted — they're for the tourist's reference only.
 * - High contrast: white bg, bold black text, no distractions.
 */
const VisualBillModal: React.FC<VisualBillModalProps> = ({ lang, onClose }) => {
  // useShallow ensures the items array is shallow-compared (avoids re-render if contents haven't changed)
  const items = useCommunicationBillStore(useShallow((s) => s.items));
  const clearBill = useCommunicationBillStore((s) => s.clearBill);
  const removeItem = useCommunicationBillStore((s) => s.removeItem);
  const increaseQty = useCommunicationBillStore((s) => s.increaseQty);
  const decreaseQty = useCommunicationBillStore((s) => s.decreaseQty);
  const itemCount = useCommunicationBillStore(selectItemCount);
  const totalVnd = useCommunicationBillStore(selectTotalBasePrice);
  const totalConverted = useCommunicationBillStore(selectTotalConvertedPrice);
  // Primitive selectors — stable by default, no object wrapper needed
  const symbol = useCommunicationBillStore(selectCurrencySymbol);
  const code = useCommunicationBillStore(selectCurrencyCode);

  const isEmpty = items.length === 0;

  const handleClear = () => {
    clearBill();
  };

  return (
    <div className="fixed inset-0 z-[2000] flex flex-col bg-white">
      {/* ─── Header ──────────────────────────────── */}
      <div className="flex-shrink-0 bg-gray-900 text-white px-4 py-4 safe-top">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">
              🧾 {t(lang, 'communicationBill')}
            </h1>
            <p className="text-xs text-gray-300 mt-0.5">
              {t(lang, 'billSubtitle')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center
                       justify-center text-white text-lg transition-colors"
            aria-label="Close bill"
          >
            ✕
          </button>
        </div>
      </div>

      {/* ─── Item list ───────────────────────────── */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <span className="text-6xl mb-4">📋</span>
            <p className="text-lg font-bold text-gray-400">{t(lang, 'emptyBill')}</p>
            <p className="text-sm text-gray-300 mt-1">{t(lang, 'emptyBillHint')}</p>
          </div>
        ) : (
          <div className="space-y-0 divide-y divide-gray-100">
            {items.map((item, idx) => (
              <div key={item.id} className="py-4 first:pt-0">
                {/* Row number */}
                <div className="flex items-start gap-3">
                  <span className="text-2xl font-extrabold text-gray-300 w-8 text-right flex-shrink-0 pt-1">
                    {idx + 1}
                  </span>

                  <div className="flex-1 min-w-0">
                    {/* OriginalName (Vietnamese) — HUGE for the waiter */}
                    <p className="text-2xl font-extrabold text-gray-900 leading-tight">
                      {item.originalName}
                    </p>

                    {/* TranslatedName — small, muted, for tourist reference */}
                    {lang !== 'vi' && item.translatedName !== item.originalName && (
                      <p className="text-xs text-gray-400 mt-0.5 italic">
                        {item.translatedName}
                      </p>
                    )}

                    {/* Combo badge */}
                    {item.type === 'combo' && (
                      <span className="inline-block mt-1 text-[10px] bg-purple-100 text-purple-700 font-semibold px-2 py-0.5 rounded-full">
                        COMBO
                      </span>
                    )}

                    {/* Quantity controls + line price */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => decreaseQty(item.id)}
                          className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center
                                     text-lg font-bold text-gray-600 transition-colors active:scale-95"
                        >
                          −
                        </button>
                        <span className="w-10 text-center text-lg font-extrabold text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => increaseQty(item.id)}
                          className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center
                                     text-lg font-bold text-gray-600 transition-colors active:scale-95"
                        >
                          +
                        </button>
                        <span className="text-[10px] text-gray-400 ml-1 uppercase">{t(lang, 'qty')}</span>
                      </div>

                      {/* Line total in VND (waiter reads this) */}
                      <div className="text-right">
                        <p className="text-xl font-extrabold text-gray-900">
                          {(item.basePrice * item.quantity).toLocaleString()}₫
                        </p>
                        {item.convertedPrice != null && item.currencySymbol && (
                          <p className="text-xs text-gray-400">
                            ≈ {item.currencySymbol}
                            {(item.convertedPrice * item.quantity).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="w-8 h-8 rounded-full bg-red-50 hover:bg-red-100 flex items-center
                               justify-center text-red-400 text-sm flex-shrink-0 transition-colors mt-1"
                    aria-label="Remove item"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Footer: Totals + Clear ──────────────── */}
      {!isEmpty && (
        <div className="flex-shrink-0 border-t-2 border-gray-900 bg-gray-50 px-4 py-4 safe-bottom">
          {/* Item count */}
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>{itemCount} {itemCount === 1 ? t(lang, 'item') : t(lang, 'items')}</span>
          </div>

          {/* Converted total (tourist reference) */}
          {totalConverted != null && symbol && (
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-sm text-gray-500">{t(lang, 'totalConverted')}</span>
              <span className="text-lg font-bold text-gray-600">
                {symbol}
                {totalConverted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                <span className="text-xs text-gray-400 ml-1">{code}</span>
              </span>
            </div>
          )}

          {/* VND total — THE number the waiter uses */}
          <div className="flex justify-between items-baseline bg-gray-900 text-white rounded-xl px-4 py-3 mb-3">
            <span className="text-sm font-semibold uppercase tracking-wider">
              {t(lang, 'totalVnd')}
            </span>
            <span className="text-3xl font-black tracking-tight">
              {totalVnd.toLocaleString()}₫
            </span>
          </div>

          {/* Clear bill */}
          <button
            onClick={handleClear}
            className="w-full py-3 rounded-xl border-2 border-red-200 text-red-500 font-bold
                       text-sm hover:bg-red-50 transition-colors active:scale-[0.98]"
          >
            🗑 {t(lang, 'clearBill')}
          </button>
        </div>
      )}
    </div>
  );
};

export default VisualBillModal;
