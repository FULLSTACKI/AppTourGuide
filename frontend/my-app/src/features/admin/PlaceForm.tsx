import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { adminPlacesService } from '../../services/adminService';
import type { PlaceCreatePayload } from '../../types/admin';

// ---------------------------------------------------------------------------
// Fix Leaflet default marker icon path (broken by Vite/Webpack bundlers).
// ---------------------------------------------------------------------------
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const HCM_CENTER: [number, number] = [10.762622, 106.660172];
const DEFAULT_ZOOM = 16;

// ---------------------------------------------------------------------------
// MapClickHandler -- react-leaflet hook component for click-to-pick.
// ---------------------------------------------------------------------------
interface MapClickHandlerProps {
  onLocationSelect: (lat: number, lng: number) => void;
}

const MapClickHandler: React.FC<MapClickHandlerProps> = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onLocationSelect(
        parseFloat(lat.toFixed(6)),
        parseFloat(lng.toFixed(6)),
      );
    },
  });
  return null;
};

// ---------------------------------------------------------------------------
// PlaceForm Component
// ---------------------------------------------------------------------------
const PlaceForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  // -- Form state --------------------------------------------------------
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [priceRange, setPriceRange] = useState('');
  const [sourceLanguageCode, setSourceLanguageCode] = useState('vi');

  // -- File upload state -------------------------------------------------
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // -- Single translation ------------------------------------------------
  const [transName, setTransName] = useState('');
  const [transDescription, setTransDescription] = useState('');

  // -- UI state ----------------------------------------------------------
  const [isLoading, setIsLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // =====================================================================
  // Load existing data (edit mode)
  // =====================================================================
  useEffect(() => {
    if (!isEdit || !id) return;

    const load = async () => {
      try {
        const place = await adminPlacesService.getById(id, sourceLanguageCode);

        setLatitude(place.latitude);
        setLongitude(place.longitude);
        setPriceRange(place.priceRange ?? '');
        setExistingImageUrl(place.coverImageUrl ?? '');
        setTransName(place.translation?.name ?? '');
        setTransDescription(place.translation?.description ?? '');
      } catch {
        setError('Failed to load place data.');
      } finally {
        setLoadingData(false);
      }
    };

    load();
  }, [id, isEdit, sourceLanguageCode]);

  // =====================================================================
  // File input handler + ObjectURL preview lifecycle
  // =====================================================================
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] ?? null;
      setCoverImage(file);

      if (file) {
        const url = URL.createObjectURL(file);
        setImagePreview(url);
      } else {
        setImagePreview(null);
      }
    },
    [],
  );

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  // =====================================================================
  // Map click
  // =====================================================================
  const handleLocationSelect = useCallback((lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
  }, []);

  // =====================================================================
  // Build payload matching PlaceCreatePayload.
  // The adminService will convert this into FormData with ASP.NET keys.
  // =====================================================================
  const buildPayload = (): PlaceCreatePayload => ({
    latitude: latitude!,
    longitude: longitude!,
    priceRange,
    sourceLanguageCode,
    coverImage,
    translation: {
      name: transName,
      description: transDescription,
    },
  });

  // =====================================================================
  // Form submission
  // =====================================================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    // -- Validation ------------------------------------------------------
    if (latitude === null || longitude === null) {
      setError('Please select a location on the map.');
      return;
    }

    if (!isEdit && !coverImage) {
      setError('Please select a cover image file.');
      return;
    }

    if (!transName.trim()) {
      setError('Place name is required.');
      return;
    }

    setIsLoading(true);

    try {
      const payload = buildPayload();

      if (isEdit && id) {
        await adminPlacesService.update(id, payload);
        setSuccessMsg('Place updated successfully.');
      } else {
        await adminPlacesService.create(payload);
        setSuccessMsg('Place created successfully.');

        // Reset form after successful creation.
        setLatitude(null);
        setLongitude(null);
        setPriceRange('');
        setCoverImage(null);
        setImagePreview(null);
        setExistingImageUrl('');
        setTransName('');
        setTransDescription('');
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    } catch (err: unknown) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof (err as Record<string, unknown>).response === 'object'
      ) {
        const resp = (err as { response: { data?: { message?: string } } }).response;
        setError(resp?.data?.message ?? 'An unexpected error occurred.');
      } else {
        setError('Network error. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // =====================================================================
  // Render
  // =====================================================================
  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
        <span className="ml-3 text-gray-500">Loading place data...</span>
      </div>
    );
  }

  const mapCenter: [number, number] =
    latitude !== null && longitude !== null
      ? [latitude, longitude]
      : HCM_CENTER;

  // Determine which image to show in the preview area.
  const previewSrc = imagePreview ?? (existingImageUrl || null);

  return (
    <div className="mx-auto max-w-4xl pb-12">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        {isEdit ? 'Edit Place' : 'New Place'}
      </h1>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* --- Map Picker --- */}
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-700">
            Location (click the map to select)
          </h2>

          <div className="overflow-hidden rounded-lg border border-gray-200">
            <MapContainer
              center={mapCenter}
              zoom={DEFAULT_ZOOM}
              scrollWheelZoom={true}
              className="h-72 w-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapClickHandler onLocationSelect={handleLocationSelect} />
              {latitude !== null && longitude !== null && (
                <Marker position={[latitude, longitude]} />
              )}
            </MapContainer>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs text-gray-500">Latitude</label>
              <input
                type="text"
                readOnly
                value={latitude !== null ? String(latitude) : ''}
                placeholder="Click map to set"
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-700"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Longitude</label>
              <input
                type="text"
                readOnly
                value={longitude !== null ? String(longitude) : ''}
                placeholder="Click map to set"
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-700"
              />
            </div>
          </div>
        </div>

        {/* --- Cover Image + Details --- */}
        <div className="space-y-4 rounded-xl bg-white p-5 shadow-sm">
          <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-gray-700">
            Cover Image and Details
          </h2>

          <div>
            <label className="mb-1 block text-xs text-gray-500">
              Cover Image {isEdit ? '(leave empty to keep current)' : '(required)'}
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              title="Select cover image"
              onChange={handleFileChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                         file:mr-3 file:rounded-md file:border-0 file:bg-orange-50
                         file:px-3 file:py-1 file:text-sm file:font-medium
                         file:text-orange-700 hover:file:bg-orange-100
                         focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {previewSrc && (
            <img
              src={previewSrc}
              alt="Cover preview"
              className="h-40 w-full rounded-lg border object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs text-gray-500">Price Range</label>
              <input
                type="text"
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                placeholder="Low to Medium"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Source Language Code</label>
              <select
                value={sourceLanguageCode}
                onChange={(e) => setSourceLanguageCode(e.target.value)}
                title="Source language for auto-translation"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option value="vi">vi -- Vietnamese</option>
                <option value="en">en -- English</option>
              </select>
            </div>
          </div>
        </div>

        {/* --- Translation --- */}
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-700">
            Translation
          </h2>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs text-gray-500">
                Name (required)
              </label>
              <input
                type="text"
                required
                value={transName}
                onChange={(e) => setTransName(e.target.value)}
                placeholder="Place name..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-gray-500">
                Description
              </label>
              <textarea
                rows={4}
                value={transDescription}
                onChange={(e) => setTransDescription(e.target.value)}
                placeholder="Description..."
                className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <p className="text-xs text-gray-400">
              Other languages will be auto-translated from the source language by the backend.
            </p>
          </div>
        </div>

        {/* --- Submit --- */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-6 py-2.5
                       text-sm font-semibold text-white shadow-md transition-colors
                       hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            {isLoading
              ? 'Saving...'
              : isEdit
                ? 'Update Place'
                : 'Create Place'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/places')}
            className="text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default PlaceForm;
