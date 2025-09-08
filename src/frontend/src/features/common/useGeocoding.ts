import { useState, useEffect } from 'react';

interface GeocodingResult {
  address: string | null;
  isLoading: boolean;
  error: string | null;
}

const addressCache = new Map<string, string>();

export function useReverseGeocode(latitude: string | number, longitude: string | number): GeocodingResult {
  const [address, setAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!latitude || !longitude) {
      setAddress(null);
      return;
    }

    const lat = typeof latitude === 'string' ? parseFloat(latitude) : latitude;
    const lng = typeof longitude === 'string' ? parseFloat(longitude) : longitude;

    if (isNaN(lat) || isNaN(lng)) {
      setAddress(null);
      return;
    }

    const cacheKey = `${lat.toFixed(6)},${lng.toFixed(6)}`;
    
    // Check cache first
    if (addressCache.has(cacheKey)) {
      setAddress(addressCache.get(cacheKey)!);
      setIsLoading(false);
      setError(null);
      return;
    }

    const fetchAddress = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Using OpenStreetMap Nominatim (free, no API key required)
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
          {
            headers: {
              'User-Agent': 'Vybers App'
            }
          }
        );

        if (!response.ok) {
          throw new Error('Geocoding service unavailable');
        }

        const data = await response.json();
        
        let formattedAddress = '';
        if (data.display_name) {
          // Try to create a concise address
          const addr = data.address || {};
          const parts = [];
          
          if (addr.house_number && addr.road) {
            parts.push(`${addr.house_number} ${addr.road}`);
          } else if (addr.road) {
            parts.push(addr.road);
          } else if (addr.pedestrian) {
            parts.push(addr.pedestrian);
          }
          
          if (addr.neighbourhood || addr.suburb) {
            parts.push(addr.neighbourhood || addr.suburb);
          }
          
          if (addr.city || addr.town || addr.village) {
            parts.push(addr.city || addr.town || addr.village);
          }
          
          if (addr.state) {
            parts.push(addr.state);
          }
          
          formattedAddress = parts.length > 0 ? parts.join(', ') : data.display_name;
          
          // Limit length and clean up
          if (formattedAddress.length > 80) {
            const shortParts = parts.slice(0, 3);
            formattedAddress = shortParts.join(', ');
            if (formattedAddress.length > 80) {
              formattedAddress = formattedAddress.substring(0, 77) + '...';
            }
          }
        }

        const finalAddress = formattedAddress || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        
        // Cache the result
        addressCache.set(cacheKey, finalAddress);
        setAddress(finalAddress);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to get address';
        setError(errorMessage);
        // Fallback to coordinates
        const fallback = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        setAddress(fallback);
        addressCache.set(cacheKey, fallback);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce the API call
    const timeoutId = setTimeout(fetchAddress, 300);
    return () => clearTimeout(timeoutId);
  }, [latitude, longitude]);

  return { address, isLoading, error };
}