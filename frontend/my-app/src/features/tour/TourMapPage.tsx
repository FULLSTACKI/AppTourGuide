import React, { useEffect, useState, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useGeolocation } from './useGeolocation';
import { haversineDistance } from './haversine';
import { placesService } from '../../services/tourService';
import type { PlaceDto } from '../../types/tour';
import PlaceDetailSheet from './PlaceDetailSheet';

const AUTOPLAY_RADIUS_METERS = 15;

/** Maps our short lang codes to BCP-47 speech synthesis locale tags */
const SPEECH_LANG_MAP: Record<string, string> = {
  en: 'en-US',
  vi: 'vi-VN',
  ja: 'ja-JP',
  ko: 'ko-KR',
  zh: 'zh-CN',
};

interface LanguageSelectorProps {
  lang: string;
  onChange: (lang: string) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ lang, onChange }) => (
  <select
    value={lang}
    onChange={e => onChange(e.target.value)}
    title="Select language"
    className="absolute top-4 right-4 z-[1000] bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-md"
  >
    <option value="en">🇬🇧 English</option>
    <option value="vi">🇻🇳 Tiếng Việt</option>
    <option value="ja">🇯🇵 日本語</option>
    <option value="ko">🇰🇷 한국어</option>
    <option value="zh">🇨🇳 中文</option>
  </select>
);

const TourMapPage: React.FC = () => {
  const { position, error: geoError, isTracking } = useGeolocation();
  const [lang, setLang] = useState('en');
  const [places, setPlaces] = useState<PlaceDto[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<PlaceDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Track which places have already auto-narrated (by place ID)
  const narratedRef = useRef<Set<string>>(new Set());
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const placeMarkersRef = useRef<L.Marker[]>([]);

  // Fetch places whenever language changes
  useEffect(() => {
    setLoading(true);
    placesService
      .getAll(lang)
      .then(data => {
        setPlaces(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [lang]);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current).setView([16.0471, 108.2068], 16); // Da Nang default
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update user marker on map
  useEffect(() => {
    if (!mapRef.current || !position) return;

    const { latitude, longitude } = position;

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([latitude, longitude]);
    } else {
      const userIcon = L.divIcon({
        html: '<div style="width:16px;height:16px;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 0 6px rgba(0,0,0,0.3);"></div>',
        iconSize: [16, 16],
        iconAnchor: [8, 8],
        className: '',
      });
      userMarkerRef.current = L.marker([latitude, longitude], { icon: userIcon })
        .addTo(mapRef.current)
        .bindPopup('You are here');
      mapRef.current.setView([latitude, longitude], 17);
    }
  }, [position]);

  // Update place markers on map
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear old markers
    placeMarkersRef.current.forEach(m => m.remove());
    placeMarkersRef.current = [];

    places.forEach(place => {
      const placeIcon = L.divIcon({
        html: '<div style="width:24px;height:24px;background:#f97316;border:3px solid white;border-radius:50%;box-shadow:0 0 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:12px;">🍜</div>',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        className: '',
      });

      const marker = L.marker([place.latitude, place.longitude], { icon: placeIcon })
        .addTo(mapRef.current!)
        .bindPopup(
          `<strong>${place.translation?.name ?? 'Unknown'}</strong><br/>` +
          `<em>${place.priceRange}</em><br/>` +
          `<small>${place.translation?.description?.substring(0, 100) ?? ''}...</small>`
        );

      marker.on('click', () => setSelectedPlace(place));
      placeMarkersRef.current.push(marker);
    });
  }, [places]);

  // ─── Speak a description via Web Speech API ────────────────
  const speakText = useCallback(
    (text: string) => {
      window.speechSynthesis.cancel(); // always stop any in-progress speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = SPEECH_LANG_MAP[lang] ?? 'en-US';
      utterance.rate = 0.95;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    },
    [lang]
  );

  // ─── Unlock speech engine (browser autoplay policy) ────────
  const handleUnlockAudio = useCallback(() => {
    // Fire a silent utterance from a user gesture to satisfy browser policy
    const silent = new SpeechSynthesisUtterance('');
    window.speechSynthesis.speak(silent);
    setAudioUnlocked(true);
  }, []);

  // ─── Auto-narrate when within AUTOPLAY_RADIUS_METERS ──────
  const checkProximitySpeech = useCallback(() => {
    if (!audioUnlocked || !position || places.length === 0) return;

    for (const place of places) {
      if (narratedRef.current.has(place.id)) continue;

      const dist = haversineDistance(
        position.latitude,
        position.longitude,
        place.latitude,
        place.longitude
      );

      if (dist < AUTOPLAY_RADIUS_METERS && place.translation?.description) {
        narratedRef.current.add(place.id);
        setSelectedPlace(place);

        // Build narration: name + description
        const name = place.translation.name ?? '';
        const desc = place.translation.description;
        speakText(name ? `${name}. ${desc}` : desc);
        break; // only trigger one at a time
      }
    }
  }, [audioUnlocked, position, places, speakText]);

  useEffect(() => {
    checkProximitySpeech();
  }, [checkProximitySpeech]);

  // Reset narrated set & stop speech when language changes
  useEffect(() => {
    narratedRef.current.clear();
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [lang]);

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Map container */}
      <div ref={mapContainerRef} className="absolute inset-0 z-0" />

      {/* Language selector */}
      <LanguageSelector lang={lang} onChange={setLang} />

      {/* GPS status indicator */}
      <div className="absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow-md px-3 py-2 text-sm">
        {isTracking ? (
          <span className="text-green-600">📍 GPS Active</span>
        ) : geoError ? (
          <span className="text-red-600">⚠ {geoError}</span>
        ) : (
          <span className="text-yellow-600">⏳ Acquiring GPS...</span>
        )}
      </div>

      {/* Speaking indicator pill */}
      {isSpeaking && (
        <button
          onClick={() => {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
          }}
          className="absolute top-16 left-4 z-[1000] bg-orange-500 text-white rounded-full
                     px-4 py-2 text-sm font-medium shadow-lg flex items-center gap-2
                     animate-pulse hover:bg-orange-600 transition-colors"
          aria-label="Stop narration"
        >
          <span className="text-base">🔊</span> Speaking… <span className="text-xs opacity-75">(tap to stop)</span>
        </button>
      )}

      {/* Audio unlock overlay — required before auto-narration can fire */}
      {!audioUnlocked && !loading && (
        <div className="absolute inset-0 z-[1001] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <button
            onClick={handleUnlockAudio}
            className="bg-orange-500 hover:bg-orange-600 active:scale-95 text-white
                       rounded-2xl px-8 py-4 text-lg font-bold shadow-2xl
                       transition-all flex flex-col items-center gap-2"
          >
            <span className="text-4xl">🎧</span>
            <span>Start Audio Tour</span>
            <span className="text-xs font-normal opacity-80">
              Tap to enable voice narration
            </span>
          </button>
        </div>
      )}

      {/* Loading indicator */}
      {loading && (
        <div className="absolute top-1/2 left-1/2 z-[1000] -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-lg px-6 py-4">
          <span className="text-gray-600">Loading places...</span>
        </div>
      )}

      {/* Selected place detail sheet */}
      {selectedPlace && (
        <PlaceDetailSheet
          place={selectedPlace}
          lang={lang}
          onClose={() => setSelectedPlace(null)}
        />
      )}
    </div>
  );
};

export default TourMapPage;
