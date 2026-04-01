import React, { useEffect, useState } from 'react';
import type { ComboDto, DishDto } from '../../types/tour';
import { combosService } from '../../services/tourService';
import { useCommunicationBillStore } from '../../stores/useCommunicationBillStore';
import { t } from './tourLabels';

// ─── Shared price renderer (reused by ComboCard & included dishes) ───

const PriceDisplay: React.FC<{
  basePrice: number;
  convertedPrice: number | null;
  symbol: string | null;
  code: string | null;
  size?: 'lg' | 'sm';
}> = ({ basePrice, convertedPrice, symbol, code, size = 'sm' }) => {
  const hasConversion = convertedPrice != null && symbol;

  if (!hasConversion) {
    return (
      <span className={size === 'lg' ? 'text-lg font-bold text-orange-600' : 'text-xs font-bold text-orange-600'}>
        {basePrice.toLocaleString()}₫
      </span>
    );
  }

  return (
    <div className="flex flex-col leading-tight">
      <span className={size === 'lg' ? 'text-lg font-extrabold text-orange-600' : 'text-sm font-bold text-orange-600'}>
        {symbol}
        {convertedPrice!.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        <span className="text-[10px] font-normal text-gray-400 ml-1">{code}</span>
      </span>
      <span className={size === 'lg' ? 'text-xs text-gray-400 line-through' : 'text-[10px] text-gray-400'}>
        {basePrice.toLocaleString()}₫
      </span>
    </div>
  );
};

// ─── ComboCard ───────────────────────────────────────────────

const ComboCard: React.FC<{ combo: ComboDto; lang: string }> = ({ combo, lang }) => {
  const addItem = useCommunicationBillStore((s) => s.addItem);
  const isInBill = useCommunicationBillStore((s) => s.items.some((i) => i.id === combo.id));

  const translatedName = combo.translatedName || combo.translation?.name || combo.originalName;
  const translatedDesc = combo.translatedDescription || combo.translation?.description || '';

  const handleAdd = () => {
    addItem({
      id: combo.id,
      type: 'combo',
      originalName: combo.originalName,
      translatedName,
      basePrice: combo.basePrice,
      convertedPrice: combo.convertedPrice,
      currencySymbol: combo.targetCurrencySymbol,
      currencyCode: combo.targetCurrencyCode,
    });
  };

  // Calculate total individual prices for "savings" badge
  const individualTotal = combo.dishes.reduce((sum, d) => sum + d.basePrice, 0);
  const savings = individualTotal > combo.basePrice ? individualTotal - combo.basePrice : 0;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Hero image + badge */}
      <div className="relative">
        {combo.imageUrl ? (
          <img
            src={combo.imageUrl}
            alt={translatedName}
            className="w-full h-40 object-cover"
          />
        ) : (
          <div className="w-full h-40 bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <span className="text-5xl">🍱</span>
          </div>
        )}

        {/* Value Deal badge */}
        <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-md">
          {t(lang, 'valueDeal')}
        </div>

        {/* Savings badge */}
        {savings > 0 && (
          <div className="absolute top-3 right-3 bg-green-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md">
            Save {savings.toLocaleString()}₫
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        {/* Combo name */}
        <h4 className="text-base font-bold text-gray-900 leading-snug">
          {translatedName}
        </h4>
        {lang !== 'vi' && combo.originalName && (
          <p className="text-xs text-gray-400 italic mt-0.5">🇻🇳 {combo.originalName}</p>
        )}
        {translatedDesc && (
          <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">{translatedDesc}</p>
        )}

        {/* Included dishes */}
        {combo.dishes.length > 0 && (
          <div className="mt-3 bg-gray-50 rounded-xl p-3">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {t(lang, 'includes')} ({combo.dishes.length})
            </p>
            <div className="space-y-1.5">
              {combo.dishes.map((dish: DishDto) => (
                <div key={dish.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    {dish.imageUrl ? (
                      <img src={dish.imageUrl} alt="" className="w-7 h-7 rounded-md object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-7 h-7 rounded-md bg-gray-200 flex items-center justify-center flex-shrink-0 text-xs">🍽</div>
                    )}
                    <span className="text-xs text-gray-700 truncate">
                      {dish.translatedName || dish.translation?.name || dish.originalName}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400 flex-shrink-0 ml-2">
                    {dish.basePrice.toLocaleString()}₫
                  </span>
                </div>
              ))}
            </div>
            {savings > 0 && (
              <div className="mt-2 pt-2 border-t border-dashed border-gray-200 flex justify-between">
                <span className="text-[10px] text-gray-400">If ordered separately</span>
                <span className="text-[10px] text-gray-400 line-through">{individualTotal.toLocaleString()}₫</span>
              </div>
            )}
          </div>
        )}

        {/* Price + Add button */}
        <div className="flex items-center justify-between mt-4">
          <PriceDisplay
            basePrice={combo.basePrice}
            convertedPrice={combo.convertedPrice}
            symbol={combo.targetCurrencySymbol}
            code={combo.targetCurrencyCode}
            size="lg"
          />

          <button
            onClick={handleAdd}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all active:scale-95
              ${isInBill
                ? 'bg-green-500 text-white shadow-green-200'
                : 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-200'
              }`}
          >
            {isInBill ? t(lang, 'added') : t(lang, 'addToBill')}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── ComboSection (fetches + renders grid) ───────────────────

interface ComboSectionProps {
  placeId: string;
  lang: string;
}

const ComboSection: React.FC<ComboSectionProps> = ({ placeId, lang }) => {
  const [combos, setCombos] = useState<ComboDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    combosService
      .getByPlace(placeId, lang)
      .then(setCombos)
      .catch(() => setCombos([]))
      .finally(() => setLoading(false));
  }, [placeId, lang]);

  if (loading) {
    return (
      <div className="mt-6 text-center text-gray-400 text-sm py-4">
        Loading combos…
      </div>
    );
  }

  if (combos.length === 0) return null;

  return (
    <div className="mt-6">
      {/* Section header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🍱</span>
        <h3 className="text-base font-bold text-gray-800">{t(lang, 'comboSection')}</h3>
        <span className="text-xs text-gray-400 ml-auto">
          {combos.length} {combos.length === 1 ? t(lang, 'item') : t(lang, 'items')}
        </span>
      </div>

      {/* Combo cards */}
      <div className="space-y-4">
        {combos.map((combo) => (
          <ComboCard key={combo.id} combo={combo} lang={lang} />
        ))}
      </div>
    </div>
  );
};

export default ComboSection;
