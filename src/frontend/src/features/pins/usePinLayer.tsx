import { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { Pin } from '../map/types/map';

import PinPopup from './PinPopup';

import { pinIcons } from '../common';
import { bindReactPopup } from '../common/utils/bindReactPopup';

interface Options {
  map: L.Map | null;
  pins: Pin[];
  onViewProfile: (userId: string | null) => void;
  onEdit: (pin: Pin) => void;
  onDelete: (pin: Pin) => void;
  onPinClick?: (pin: Pin) => void;
  isMobile?: boolean;
}

export function usePinLayer({
  map,
  pins,
  onViewProfile,
  onEdit,
  onDelete,
  onPinClick,
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

    pins.forEach((pin) => {
      const icon = pin.isPrivate
        ? pin.musicLink
          ? pinIcons.privateMusic
          : pinIcons.private
        : pin.musicLink
          ? pinIcons.publicMusic
          : pinIcons.public;

      const m = L.marker([pin.lat, pin.lng], { icon });

      // Only bind popup on desktop
      if (!isMobile) {
        bindReactPopup(m, () => (
          <PinPopup
            key={pin.id + pin.name}
            pin={pin}
            onViewProfile={onViewProfile}
            onEdit={onEdit}
            onDelete={onDelete}
            onClose={() => m.closePopup()}
          />
        ));
      }
      m.on('click', () => {
        m.openPopup();
        if (onPinClick) {
          onPinClick(pin);
        }
      });
      m.addTo(layer);
    });
  }, [map, pins, isMobile]);
}
