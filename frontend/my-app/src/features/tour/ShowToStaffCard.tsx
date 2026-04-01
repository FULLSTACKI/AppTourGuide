import React from 'react';
import type { DishDto } from '../../types/tour';
import { t } from './tourLabels';

interface ShowToStaffCardProps {
  dishes: DishDto[];
  cart: Record<string, number>;
  lang: string;
  onClose: () => void;
}

/**
 * Full-screen overlay that the tourist shows to the local staff.
 * Displays each ordered dish with its ORIGINAL Vietnamese name prominently,
 * the image, and the quantity — no translation needed for the staff.
 */
const ShowToStaffCard: React.FC<ShowToStaffCardProps> = ({ dishes, cart, lang, onClose }) => {
  const cartEntries = Object.entries(cart).filter(([, qty]) => qty > 0);
  const dishMap = new Map(dishes.map(d => [d.id, d]));

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[1020] bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Card */}
      <div className="fixed inset-0 z-[1021] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full max-h-[85vh] flex flex-col animate-slide-up">
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100 flex-shrink-0">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {t(lang, 'showToStaff')}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {t(lang, 'showToStaffHint')}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 text-lg transition-colors"
            >
              ×
            </button>
          </div>

          {/* Dish list — optimized for readability by staff */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {cartEntries.map(([dishId, qty]) => {
              const dish = dishMap.get(dishId);
              if (!dish) return null;

              return (
                <div key={dishId} className="flex gap-4 items-center">
                  {/* Image */}
                  {dish.imageUrl ? (
                    <img
                      src={dish.imageUrl}
                      alt={dish.originalName}
                      className="w-16 h-16 rounded-xl object-cover flex-shrink-0 shadow-sm"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">🍽</span>
                    </div>
                  )}

                  {/* Name (Vietnamese = large, translated = small) */}
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-bold text-gray-900 truncate">
                      {dish.originalName}
                    </p>
                    {lang !== 'vi' && dish.translation?.name && (
                      <p className="text-xs text-gray-400 truncate">
                        ({dish.translation.name})
                      </p>
                    )}
                  </div>

                  {/* Quantity badge */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center text-lg font-bold shadow-md">
                    {qty}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 px-5 py-4 border-t border-gray-100">
            <button
              onClick={onClose}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl py-3
                         transition-colors active:scale-95 shadow-lg"
            >
              {t(lang, 'close')}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ShowToStaffCard;
