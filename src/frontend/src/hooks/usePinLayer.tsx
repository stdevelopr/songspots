import { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { Pin } from '../types/map';
import { pinIcons } from '../utils/icons';
import PinPopup from '../components/PinPopup';
import { bindReactPopup } from '../utils/bindReactPopup';

interface Options {
  map: L.Map | null;
  pins: Pin[];
  onViewProfile: (userId: string) => void;
  onEdit: (pin: Pin) => void;
  onDelete: (pin: Pin) => void;
  onPinClick?: (pin: Pin) => void;
  isMobile?: boolean;
}

export function usePinLayer({ map, pins, onViewProfile, onEdit, onDelete, onPinClick }: Options) {
  const layerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!map) return;
    if (!layerRef.current) layerRef.current = L.layerGroup().addTo(map);
    const layer = layerRef.current;

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
      if (!(typeof window !== 'undefined' && window.innerWidth <= 600)) {
        bindReactPopup(m, () => (
          <PinPopup pin={pin} onViewProfile={onViewProfile} onEdit={onEdit} onDelete={onDelete} />
        ));
      }
      if (onPinClick) {
        m.on('click', () => {
          console.log('Pin clicked:', pin);
          onPinClick(pin);
        });
      }
      m.addTo(layer);
    });
  }, [map, pins, onViewProfile, onEdit, onDelete, onPinClick]);
}
