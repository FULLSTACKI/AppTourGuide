import React, { useEffect, useState, useMemo } from 'react';
import type { DishDto } from '../../types/tour';
import { dishesService } from '../../services/tourService';
import { useCommunicationBillStore } from '../../stores/useCommunicationBillStore';
import { useShallow } from 'zustand/react/shallow';
import { t } from './tourLabels';

/** Renders converted price prominently with original VND below for transparency. */
const DishPrice: React.FC<{ dish: DishDto; size?: 'sm' | 'base' }> = ({ dish, size = 'sm' }) => {
  const hasConversion = dish.convertedPrice != null && dish.targetCurrencySymbol;
  const mainClass = size === 'base' ? 'text-sm font-bold text-orange-600' : 'text-xs font-bold text-orange-600';

  if (!hasConversion) {
    // Vietnamese user or rate unavailable — show VND only
    return <span className={mainClass}>{dish.basePrice.toLocaleString()}₫</span>;
  }

  return (
    <div className="flex flex-col leading-tight">
      <span className={mainClass}>
        {dish.targetCurrencySymbol}{dish.convertedPrice!.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        <span className="text-[10px] font-normal text-gray-400 ml-1">{dish.targetCurrencyCode}</span>
      </span>
      <span className="text-[10px] text-gray-400">
        {dish.basePrice.toLocaleString()}₫
      </span>
    </div>
  );
};

/** All dietary filter tags available in the UI */
const DIETARY_OPTIONS = [
  'vegetarian', 'vegan', 'glutenFree', 'peanutFree', 'seafood', 'spicy', 'dairyFree',
] as const;

/** Map UI filter keys to backend tag values */
const TAG_MAP: Record<string, string> = {
  vegetarian: 'vegetarian',
  vegan: 'vegan',
  glutenFree: 'gluten-free',
  peanutFree: 'peanut-free',
  seafood: 'seafood',
  spicy: 'spicy',
  dairyFree: 'dairy-free',
};

interface MenuSectionProps {
  placeId: string;
  lang: string;
}

const MenuSection: React.FC<MenuSectionProps> = ({
  placeId,
  lang,
}) => {
  const [items, setItems] = useState<DishDto[]>([]);
  const [recommended, setRecommended] = useState<DishDto[]>([]);
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const addItem = useCommunicationBillStore((s) => s.addItem);
  // Extract a stable array of IDs via useShallow (shallow-compares array elements)
  const billIds = useCommunicationBillStore(useShallow((s) => s.items.map((i) => i.id)));
  // Derive the Set in a useMemo so it only recomputes when billIds actually changes
  const billItemIds = useMemo(() => new Set(billIds), [billIds]);

  const handleAddDish = (dish: DishDto) => {
    addItem({
      id: dish.id,
      type: 'dish',
      originalName: dish.originalName,
      translatedName: dish.translatedName || dish.translation?.name || dish.originalName,
      basePrice: dish.basePrice,
      convertedPrice: dish.convertedPrice,
      currencySymbol: dish.targetCurrencySymbol,
      currencyCode: dish.targetCurrencyCode,
    });
  };

  // Fetch all dishes + recommended using the Dish endpoints
  useEffect(() => {
    setLoading(true);
    Promise.all([
      dishesService.getByPlace(placeId, lang),
      dishesService.getRecommended(placeId, lang),
    ])
      .then(([all, rec]) => {
        setItems(all);
        setRecommended(rec);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [placeId, lang]);

  const toggleFilter = (key: string) => {
    setActiveFilters(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Client-side dietary filtering (exclude items matching selected allergens)
  const filteredItems = useMemo(() => {
    if (activeFilters.size === 0) return items;
    return items.filter(item =>
      Array.from(activeFilters).every(f => !item.dietaryTags.includes(TAG_MAP[f]))
    );
  }, [items, activeFilters]);

  const recommendedIds = useMemo(() => new Set(recommended.map(r => r.id)), [recommended]);

  if (loading) {
    return (
      <div className="mt-4 text-center text-gray-400 text-sm py-6">
        Loading menu…
      </div>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      {/* Section header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">📋</span>
        <h3 className="text-base font-bold text-gray-800">{t(lang, 'smartMenu')}</h3>
        <span className="text-xs text-gray-400 ml-auto">
          {items.length} {items.length === 1 ? t(lang, 'item') : t(lang, 'items')}
        </span>
      </div>

      {/* ─── Dietary filter chips ─────────────────────── */}
      <div className="flex flex-wrap gap-2 mb-4">
        {DIETARY_OPTIONS.map(key => {
          const active = activeFilters.has(key);
          return (
            <button
              key={key}
              type="button"
              onClick={() => toggleFilter(key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors
                ${active
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              {t(lang, key)}
            </button>
          );
        })}
      </div>

      {/* ─── Recommended cross-sell strip ─────────────── */}
      {recommended.length > 0 && activeFilters.size === 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider mb-2">
            {t(lang, 'recommended')}
          </p>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
            {recommended.map(dish => (
              <div
                key={dish.id}
                className="flex-shrink-0 w-36 bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 rounded-xl p-2.5"
              >
                {dish.imageUrl ? (
                  <img
                    src={dish.imageUrl}
                    alt={dish.translation?.name ?? ''}
                    className="w-full h-20 object-cover rounded-lg mb-2"
                  />
                ) : (
                  <div className="w-full h-20 bg-orange-100 rounded-lg mb-2 flex items-center justify-center text-2xl">
                    🍽
                  </div>
                )}
                <p className="text-xs font-semibold text-gray-800 truncate">
                  {dish.translation?.name ?? dish.originalName}
                </p>
                <p className="text-[10px] text-gray-400 truncate italic">
                  {dish.originalName}
                </p>
                <div className="mt-1.5">
                  <DishPrice dish={dish} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Dish items grid ──────────────────────────── */}
      {filteredItems.length === 0 ? (
        <div className="text-center text-gray-400 text-sm py-6">
          {t(lang, 'noMatchFilters')}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map(dish => {
            const isRec = recommendedIds.has(dish.id);
            return (
              <div
                key={dish.id}
                className={`flex gap-3 rounded-xl p-3 transition-colors
                  ${isRec ? 'bg-orange-50 border border-orange-100' : 'bg-gray-50 hover:bg-gray-100'}`}
              >
                {/* Thumbnail */}
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

                {/* Info */}
                <div className="flex-1 min-w-0 py-0.5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {dish.translation?.name ?? dish.originalName}
                      </p>
                      {isRec && (
                        <span className="text-[10px] bg-orange-500 text-white px-1.5 py-0.5 rounded-full flex-shrink-0">
                          ⭐
                        </span>
                      )}
                    </div>
                    {lang !== 'vi' && dish.originalName && (
                      <p className="text-[11px] text-gray-400 italic truncate">
                        🇻🇳 {dish.originalName}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                      {dish.translation?.description}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="mt-1.5">
                    <DishPrice dish={dish} size="base" />
                  </div>

                  {/* Dietary tags */}
                  {dish.dietaryTags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {dish.dietaryTags.map(tag => (
                        <span
                          key={tag}
                          className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add to Bill button */}
                <button
                  onClick={() => handleAddDish(dish)}
                  className={`self-end flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold
                             shadow-sm transition-all active:scale-95
                    ${billItemIds.has(dish.id)
                      ? 'bg-green-500 text-white shadow-green-200'
                      : 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-200'
                    }`}
                >
                  {billItemIds.has(dish.id) ? t(lang, 'added') : t(lang, 'addToBill')}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MenuSection;
