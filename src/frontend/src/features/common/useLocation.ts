import { useCallback, useState } from 'react';
import type { LocationStatus, UserLocation } from '../types/map';

export function useLocation() {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [status, setStatus] = useState<LocationStatus>('requesting');
  const [complete, setComplete] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const request = useCallback((isRefresh = false) => {
    if (!navigator.geolocation) {
      setStatus('unavailable');
      setComplete(true);
      return;
    }

    if (isRefresh) setRefreshing(true);
    else {
      setStatus('requesting');
      setComplete(false);
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setStatus('granted');
        setRefreshing(false);
        setComplete(true);
      },
      () => {
        setStatus('denied');
        setRefreshing(false);
        setComplete(true);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, []);

  return { userLocation, status, complete, refreshing, request };
}
