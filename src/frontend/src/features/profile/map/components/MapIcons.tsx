import L from 'leaflet';
import { useMemo } from 'react';

export interface MapIcons {
  normalIcon: L.DivIcon;
  highlightedIcon: L.DivIcon;
  focusedIcon: L.DivIcon;
}

export const useMapIcons = (): MapIcons => {
  const normalIcon = useMemo(
    () =>
      L.divIcon({
        className: 'custom-pin-icon',
        html: `<div class="w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg" style="z-index: 100;"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      }),
    []
  );

  const highlightedIcon = useMemo(
    () =>
      L.divIcon({
        className: 'custom-pin-icon highlighted',
        html: `<div class="w-7 h-7 bg-yellow-400 rounded-full border-[3px] border-white shadow-xl" style="z-index: 500; position: relative;"></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      }),
    []
  );

  const focusedIcon = useMemo(
    () =>
      L.divIcon({
        className: 'custom-pin-icon focused',
        html: `<div class="w-8 h-8 bg-red-500 rounded-full border-3 border-white shadow-xl animate-pulse" style="z-index: 1000; position: relative;"></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      }),
    []
  );

  return { normalIcon, highlightedIcon, focusedIcon };
};

export const MapIconStyles: React.FC = () => (
  <style>{`
    .custom-pin-icon.focused {
      z-index: 1000 !important;
    }
    .custom-pin-icon.highlighted {
      z-index: 500 !important;
    }
    .custom-pin-icon {
      z-index: 100;
    }
  `}</style>
);
