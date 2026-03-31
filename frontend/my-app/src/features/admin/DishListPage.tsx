import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { adminPlacesService, adminDishesService } from '../../services/adminService';
import type { AdminPlaceRow, AdminDishRow } from '../../types/admin';

const DishListPage: React.FC = () => {
  const [places, setPlaces] = useState<AdminPlaceRow[]>([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string>('');
  const [dishes, setDishes] = useState<AdminDishRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDishes, setLoadingDishes] = useState(false);

  // Load places for the dropdown
  useEffect(() => {
    adminPlacesService
      .getAll('en')
      .then(data => {
        setPlaces(data);
        if (data.length > 0) setSelectedPlaceId(data[0].id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Load dishes when selected place changes
  const loadDishes = useCallback(() => {
    if (!selectedPlaceId) return;
    setLoadingDishes(true);
    adminDishesService
      .getByPlace(selectedPlaceId, 'en')
      .then(setDishes)
      .catch(() => {})
      .finally(() => setLoadingDishes(false));
  }, [selectedPlaceId]);

  useEffect(() => { loadDishes(); }, [loadDishes]);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete dish "${name}"?`)) return;
    try {
      await adminDishesService.delete(id);
      setDishes(prev => prev.filter(d => d.id !== id));
    } catch {
      alert('Failed to delete dish.');
    }
  };

  const selectedPlace = places.find(p => p.id === selectedPlaceId);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🍽 Manage Dishes</h1>
          <p className="text-sm text-gray-500 mt-1">
            Select a place, then manage its dishes
          </p>
        </div>
        {selectedPlaceId && (
          <Link
            to={`/admin/dishes/new?placeId=${selectedPlaceId}`}
            className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold
                       rounded-lg px-4 py-2.5 shadow-md transition-colors text-center"
          >
            + Add Dish
          </Link>
        )}
      </div>

      {/* Place selector */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading places…</div>
      ) : places.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          No places found. Create a place first.
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <label className="block text-xs text-gray-500 mb-1">Filter by Place</label>
            <select
              value={selectedPlaceId}
              onChange={e => setSelectedPlaceId(e.target.value)}
              title="Select a place"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              {places.map(p => (
                <option key={p.id} value={p.id}>
                  {p.translation?.name ?? p.id}
                </option>
              ))}
            </select>
          </div>

          {/* Dish table */}
          {loadingDishes ? (
            <div className="text-center py-12 text-gray-400">Loading dishes…</div>
          ) : dishes.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-400">
              No dishes for "{selectedPlace?.translation?.name}". Add one!
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                    <tr>
                      <th className="px-4 py-3">Image</th>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {dishes.map(dish => (
                      <tr key={dish.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          {dish.imageUrl ? (
                            <img src={dish.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">🍽</div>
                          )}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-800">
                          {dish.translation?.name ?? '(No name)'}
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <Link
                            to={`/admin/dishes/${dish.id}/edit?placeId=${selectedPlaceId}`}
                            className="text-orange-600 hover:text-orange-700 font-medium"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(dish.id, dish.translation?.name ?? '')}
                            className="text-red-500 hover:text-red-600 font-medium"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DishListPage;
