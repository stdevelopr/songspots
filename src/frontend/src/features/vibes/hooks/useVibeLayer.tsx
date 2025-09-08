import { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { Pin, Vibe } from '../../map/types/map';

import { getMoodIcon } from '../../common/utils/icons';

interface Options {
  map: L.Map | null;
  pins?: Pin[];
  vibes?: Vibe[];
  onViewProfile: (userId: string | null) => void;
  onEdit: (pin: Pin | Vibe) => void;
  onDelete: (pin: Pin | Vibe) => void;
  onPinClick?: (pin: Pin) => void;
  onVibeClick?: (vibe: Vibe) => void;
  isMobile?: boolean;
}

export function useVibeLayer({
  map,
  pins,
  vibes,
  onViewProfile,
  onEdit,
  onDelete,
  onPinClick,
  onVibeClick,
  isMobile,
}: Options) {
  const layerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!map) return;

    // Remove previous layer group
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
    }

    const layer = L.layerGroup().addTo(map);
    layerRef.current = layer;

    const itemsToRender = vibes || pins || [];
    
    itemsToRender.forEach((item) => {
      const icon = getMoodIcon(item.mood, !!item.isPrivate, !!item.musicLink);

      const m = L.marker([item.lat, item.lng], { icon });

      // No popup binding - we'll use fullscreen modal for all clicks
      m.on('click', () => {
        if (vibes && onVibeClick) {
          onVibeClick(item as Vibe);
        } else if (pins && onPinClick) {
          onPinClick(item as Pin);
        }
      });
      m.addTo(layer);
    });
  }, [map, pins, vibes, isMobile]);
}
