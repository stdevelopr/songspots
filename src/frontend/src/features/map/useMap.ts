import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';

export const useMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);

  console.log('Map ref:', mapRef.current);
  console.log('Map instance:', mapInstance);

  // initialize map
  useEffect(() => {
    if (!mapRef.current) return;

    // Determine initial map center and zoom
    let initialCenter: [number, number] = [40.7128, -74.006]; // Default to NYC
    let initialZoom = 10;

    // Create map instance
    const map = L.map(mapRef.current).setView(initialCenter, initialZoom);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    setMapInstance(map);
  }, []);

  return { mapInstance, setMapInstance, mapRef };
};
