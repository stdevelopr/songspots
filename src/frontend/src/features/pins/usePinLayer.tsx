import { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { Pin } from '../map/types/map';

import PinPopup from './PinPopup';

import { pinIcons } from '../common';
import { bindReactPopup } from '../common/utils/bindReactPopup';

interface Options {
  map: L.Map | null;
  pins: Pin[];
  onViewProfile: (userId: string) => void;
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
  useEffect(() => {
    if (!map) return;

    const layer = L.layerGroup().addTo(map);

    layer.clearLayers();

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
