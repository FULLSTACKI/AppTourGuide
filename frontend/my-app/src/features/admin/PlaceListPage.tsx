import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { adminPlacesService } from '../../services/adminService';
import type { AdminPlaceRow } from '../../types/admin';

const PlaceListPage: React.FC = () => {
  const [places, setPlaces] = useState<AdminPlaceRow[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPlaces = useCallback(() => {
    setLoading(true);
    adminPlacesService
      .getAll('en')
      .then(setPlaces)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadPlaces(); }, [loadPlaces]);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await adminPlacesService.delete(id);
      setPlaces(prev => prev.filter(p => p.id !== id));
    } catch {
      alert('Failed to delete place.');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📍 Manage Places</h1>
          <p className="text-sm text-gray-500 mt-1">{places.length} place(s) registered</p>
        </div>
        <Link
          to="/admin/places/new"
          className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold
                     rounded-lg px-4 py-2.5 shadow-md transition-colors"
        >
          + Add Place
        </Link>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading…</div>
      ) : places.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          No places yet. Click "+ Add Place" to get started.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Price Range</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Dishes</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {places.map(place => (
                  <tr key={place.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800">
                      <div className="flex items-center gap-3">
                        {place.coverImageUrl ? (
                          <img
                            src={place.coverImageUrl}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                            🍜
                          </div>
                        )}
                        <span className="truncate max-w-[200px]">
                          {place.translation?.name ?? '(No name)'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{place.priceRange}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs font-mono">
                      {place.latitude.toFixed(4)}, {place.longitude.toFixed(4)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold
                          ${place.status
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                          }`}
                      >
                        {place.status ? 'Open' : 'Closed'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{place.dishes.length}</td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <Link
                        to={`/admin/places/${place.id}/edit`}
                        className="inline-block text-orange-600 hover:text-orange-700 font-medium"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(place.id, place.translation?.name ?? '')}
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
    </div>
  );
};

export default PlaceListPage;
