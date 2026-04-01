import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { adminPlacesService, adminMenuItemsService } from '../../services/adminService';
import type { AdminPlaceRow, AdminMenuItemRow } from '../../types/admin';

const MenuItemListPage: React.FC = () => {
  const [places, setPlaces] = useState<AdminPlaceRow[]>([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string>('');
  const [menuItems, setMenuItems] = useState<AdminMenuItemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingItems, setLoadingItems] = useState(false);

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

  // Load menu items when selected place changes
  const loadItems = useCallback(() => {
    if (!selectedPlaceId) return;
    setLoadingItems(true);
    adminMenuItemsService
      .getByPlace(selectedPlaceId, 'en')
      .then(setMenuItems)
      .catch(() => {})
      .finally(() => setLoadingItems(false));
  }, [selectedPlaceId]);

  useEffect(() => { loadItems(); }, [loadItems]);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete menu item "${name}"?`)) return;
    try {
      await adminMenuItemsService.delete(id);
      setMenuItems(prev => prev.filter(m => m.id !== id));
    } catch {
      alert('Failed to delete menu item.');
    }
  };

  const selectedPlace = places.find(p => p.id === selectedPlaceId);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📋 Manage Menu Items</h1>
          <p className="text-sm text-gray-500 mt-1">
            Smart menu with dietary tags, pricing &amp; recommendations
          </p>
        </div>
        {selectedPlaceId && (
          <Link
            to={`/admin/menu-items/new?placeId=${selectedPlaceId}`}
            className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold
                       rounded-lg px-4 py-2.5 shadow-md transition-colors text-center"
          >
            + Add Menu Item
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

          {/* Menu Items table */}
          {loadingItems ? (
            <div className="text-center py-12 text-gray-400">Loading menu items…</div>
          ) : menuItems.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-400">
              No menu items for "{selectedPlace?.translation?.name}". Add one!
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                    <tr>
                      <th className="px-4 py-3">Image</th>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Price</th>
                      <th className="px-4 py-3">Tags</th>
                      <th className="px-4 py-3">Rec.</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {menuItems.map(item => (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">📋</div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-800">
                            {item.translation?.name ?? '(No name)'}
                          </p>
                          {item.originalName && (
                            <p className="text-xs text-gray-400 italic">🇻🇳 {item.originalName}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-700 font-medium">
                          {item.basePrice.toLocaleString()}₫
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {item.dietaryTags.map(tag => (
                              <span
                                key={tag}
                                className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {item.isRecommended ? (
                            <span className="text-orange-500 text-sm">⭐</span>
                          ) : (
                            <span className="text-gray-300 text-sm">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <Link
                            to={`/admin/menu-items/${item.id}/edit?placeId=${selectedPlaceId}`}
                            className="text-orange-600 hover:text-orange-700 font-medium"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(item.id, item.translation?.name ?? '')}
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

export default MenuItemListPage;
