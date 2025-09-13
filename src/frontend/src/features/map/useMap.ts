import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';

export const useMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);

  // initialize map
  useEffect(() => {
    if (!mapRef.current) return;

    // Neutral initial view (avoids jumping from a specific city like NYC)
    const initialCenter: [number, number] = [0, 0];
    const initialZoom = 2;

    // Create map instance with world bounds
    const map = L.map(mapRef.current, {
      maxBounds: [[-90, -180], [90, 180]],
      maxBoundsViscosity: 1.0,
      zoomControl: false,
    }).setView(initialCenter, initialZoom);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      minZoom: 2,
    }).addTo(map);

    // Create a dedicated pane for the user location marker above regular markers
    const userPane = map.createPane('userLocation');
    if (userPane) {
      userPane.style.zIndex = '700'; // default markerPane is 600
      userPane.style.pointerEvents = 'none'; // do not intercept clicks
    }

    setMapInstance(map);
  }, []);

  useEffect(() => {
    if (!mapInstance) return;

    const close = () => mapInstance.closePopup();

    mapInstance.on('dragstart', close);
    mapInstance.on('zoomstart', close);

    return () => {
      mapInstance.off('dragstart', close);
      mapInstance.off('zoomstart', close);
    };
  }, [mapInstance]);

  return { mapInstance, setMapInstance, mapRef };
};
