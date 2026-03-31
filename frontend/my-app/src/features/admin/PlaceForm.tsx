import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { adminPlacesService } from '../../services/adminService';
import type { PlaceTranslationInput } from '../../types/admin';

const LANGS = [
  { code: 'vi', label: '🇻🇳 Vietnamese' },
  { code: 'en', label: '🇬🇧 English' },
];

const DEFAULT_CENTER: [number, number] = [10.7615, 106.7043]; // Vinh Khanh, D4

function emptyTranslations(): PlaceTranslationInput[] {
  return LANGS.map(l => ({
    languageCode: l.code,
    name: '',
    description: '',
    audioUrl: '',
  }));
}

const PlaceForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  // Form state
  const [latitude, setLatitude] = useState(DEFAULT_CENTER[0]);
  const [longitude, setLongitude] = useState(DEFAULT_CENTER[1]);
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [status, setStatus] = useState(true);
  const [translations, setTranslations] = useState<PlaceTranslationInput[]>(emptyTranslations());
  const [activeLang, setActiveLang] = useState('vi');
  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);
  const [error, setError] = useState('');

  // Map refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // ─── Load existing place data (edit mode) ──────────────────
  useEffect(() => {
    if (!isEdit || !id) return;

    const load = async () => {
      try {
        // Load both language translations
        const [vi, en] = await Promise.all([
          adminPlacesService.getById(id, 'vi'),
          adminPlacesService.getById(id, 'en'),
        ]);

        setLatitude(vi.latitude);
        setLongitude(vi.longitude);
        setCoverImageUrl(vi.coverImageUrl ?? '');
        setPriceRange(vi.priceRange ?? '');
        setStatus(vi.status);

        setTranslations([
          {
            languageCode: 'vi',
            name: vi.translation?.name ?? '',
            description: vi.translation?.description ?? '',
            audioUrl: vi.translation?.audioUrl ?? '',
          },
          {
            languageCode: 'en',
            name: en.translation?.name ?? '',
            description: en.translation?.description ?? '',
            audioUrl: en.translation?.audioUrl ?? '',
          },
        ]);
      } catch {
        setError('Failed to load place data.');
      } finally {
        setLoadingData(false);
      }
    };

    load();
  }, [id, isEdit]);

  // ─── Leaflet map with click-to-pick ────────────────────────
  const updateMarker = useCallback(
    (lat: number, lng: number, map: L.Map) => {
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(map);

        markerRef.current.on('dragend', () => {
          const pos = markerRef.current!.getLatLng();
          setLatitude(parseFloat(pos.lat.toFixed(6)));
          setLongitude(parseFloat(pos.lng.toFixed(6)));
        });
      }
    },
    []
  );

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current).setView([latitude, longitude], 17);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OSM',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;
    updateMarker(latitude, longitude, map);

    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      const newLat = parseFloat(lat.toFixed(6));
      const newLng = parseFloat(lng.toFixed(6));
      setLatitude(newLat);
      setLongitude(newLng);
      updateMarker(newLat, newLng, map);
    });

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingData]); // reinit once data has loaded

  // Sync marker when lat/lng fields are typed manually
  useEffect(() => {
    if (mapRef.current) {
      updateMarker(latitude, longitude, mapRef.current);
      mapRef.current.setView([latitude, longitude]);
    }
  }, [latitude, longitude, updateMarker]);

  // ─── Translation helpers ───────────────────────────────────
  const currentTrans = translations.find(t => t.languageCode === activeLang)!;

  const setTransField = (field: keyof PlaceTranslationInput, value: string) => {
    setTranslations(prev =>
      prev.map(t => (t.languageCode === activeLang ? { ...t, [field]: value } : t))
    );
  };

  // ─── Submit ────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const payload = { latitude, longitude, coverImageUrl, priceRange, status, translations };

      if (isEdit && id) {
        await adminPlacesService.update(id, payload);
      } else {
        await adminPlacesService.create(payload);
      }

      navigate('/admin/places');
    } catch {
      setError('Failed to save. Please check your inputs.');
    } finally {
      setSaving(false);
    }
  };

  if (loadingData) {
    return <div className="text-center py-16 text-gray-400">Loading place data…</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isEdit ? '✏️ Edit Place' : '➕ New Place'}
      </h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ─── Map Picker ─────────────────────────────── */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
            📍 Location (click map to set)
          </h2>

          <div
            ref={mapContainerRef}
            className="w-full h-64 rounded-lg border border-gray-200 z-0"
          />

          <div className="grid grid-cols-2 gap-4 mt-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Latitude</label>
              <input
                type="number"
                step="0.000001"
                value={latitude}
                onChange={e => setLatitude(parseFloat(e.target.value) || 0)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Longitude</label>
              <input
                type="number"
                step="0.000001"
                value={longitude}
                onChange={e => setLongitude(parseFloat(e.target.value) || 0)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          </div>
        </div>

        {/* ─── Basic Info ─────────────────────────────── */}
        <div className="bg-white rounded-xl shadow-sm p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-1">
            🖼 Basic Info
          </h2>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Cover Image URL</label>
            <input
              type="url"
              value={coverImageUrl}
              onChange={e => setCoverImageUrl(e.target.value)}
              placeholder="https://example.com/photo.jpg"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {coverImageUrl && (
            <img
              src={coverImageUrl}
              alt="Preview"
              className="w-full h-32 object-cover rounded-lg border"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Price Range</label>
              <input
                type="text"
                value={priceRange}
                onChange={e => setPriceRange(e.target.value)}
                placeholder="50,000 - 150,000 VND"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Status</label>
              <select
                value={status ? 'open' : 'closed'}
                onChange={e => setStatus(e.target.value === 'open')}
                title="Place status"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option value="open">✅ Open</option>
                <option value="closed">🚫 Closed</option>
              </select>
            </div>
          </div>
        </div>

        {/* ─── Multilingual Tabs ──────────────────────── */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
            🌐 Translations
          </h2>

          {/* Tab bar */}
          <div className="flex border-b border-gray-200 mb-4">
            {LANGS.map(l => (
              <button
                key={l.code}
                type="button"
                onClick={() => setActiveLang(l.code)}
                className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors
                  ${activeLang === l.code
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* Fields for selected language */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Name ({activeLang.toUpperCase()})
              </label>
              <input
                type="text"
                required
                value={currentTrans.name}
                onChange={e => setTransField('name', e.target.value)}
                placeholder="Place name…"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Description ({activeLang.toUpperCase()})
              </label>
              <textarea
                rows={4}
                value={currentTrans.description}
                onChange={e => setTransField('description', e.target.value)}
                placeholder="Description…"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Audio URL ({activeLang.toUpperCase()}) — optional
              </label>
              <input
                type="url"
                value={currentTrans.audioUrl}
                onChange={e => setTransField('audioUrl', e.target.value)}
                placeholder="https://example.com/audio.mp3"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          </div>
        </div>

        {/* ─── Submit ─────────────────────────────────── */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50
                       text-white font-semibold rounded-lg px-6 py-2.5 text-sm
                       shadow-md transition-colors"
          >
            {saving ? 'Saving…' : isEdit ? 'Update Place' : 'Create Place'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/places')}
            className="text-gray-500 hover:text-gray-700 text-sm font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default PlaceForm;
