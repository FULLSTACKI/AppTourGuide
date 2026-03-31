import { useState, useEffect, useCallback } from 'react';

interface GeoPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
}

interface UseGeolocationReturn {
  position: GeoPosition | null;
  error: string | null;
  isTracking: boolean;
}

export function useGeolocation(): UseGeolocationReturn {
  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  const onSuccess = useCallback((pos: GeolocationPosition) => {
    setPosition({
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
    });
    setError(null);
    setIsTracking(true);
  }, []);

  const onError = useCallback((err: GeolocationPositionError) => {
    setError(err.message);
    setIsTracking(false);
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      maximumAge: 5000,
      timeout: 15000,
    });

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [onSuccess, onError]);

  return { position, error, isTracking };
}
