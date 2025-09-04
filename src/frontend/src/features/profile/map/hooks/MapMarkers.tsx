import { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { Pin as BackendPin } from '../../../../backend/backend.did';
import { parseCoordinates, type ValidPin } from '../utils/map-utils';
import { UI_CONFIG } from '../utils/map-constants';
import type { MapIcons } from '../components/MapIcons';

interface UseMapMarkersProps {
  mapInstance: L.Map | null;
  backendPins: BackendPin[];
  normalIcon: L.DivIcon;
  focusedIcon: L.DivIcon;
  focusedPinId?: string;
  isCollapsed: boolean;
  onPinClick?: (pinId: string) => void;
  isFocusAnimatingRef: React.MutableRefObject<boolean>;
}

export const useMapMarkers = ({
  mapInstance,
  backendPins,
  normalIcon,
  focusedIcon,
  focusedPinId,
  isCollapsed,
  onPinClick,
  isFocusAnimatingRef,
}: UseMapMarkersProps) => {
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

  // Add markers and fit bounds when pins change
  useEffect(() => {
    if (!mapInstance || isCollapsed) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => {
      mapInstance.removeLayer(marker);
    });
    markersRef.current.clear();

    if (backendPins.length === 0) return;

    const validPins: ValidPin[] = [];

    backendPins.forEach((pin) => {
      try {
        const coords = parseCoordinates(pin.latitude, pin.longitude);

        if (!coords) {
          console.warn('Invalid coordinates for pin:', pin);
          return;
        }

        validPins.push({ ...coords, pin });

        const pinId = pin.id.toString();
        const marker = L.marker([coords.lat, coords.lng], {
          icon: normalIcon,
          zIndexOffset: 0,
        }).addTo(mapInstance);

        // Store marker reference
        markersRef.current.set(pinId, marker);

        // Add click handler for pin selection (no popup since list shows details)
        if (onPinClick) {
          marker.on('click', (e) => {
            // Prevent default popup behavior
            e.originalEvent?.preventDefault();
            e.originalEvent?.stopPropagation();
            onPinClick(pinId);
          });
        }
      } catch (error) {
        console.warn('Error adding marker for pin:', pin, error);
      }
    });

    if (validPins.length > 0 && !isFocusAnimatingRef.current) {
      const bounds = L.latLngBounds(validPins.map((p) => [p.lat, p.lng]));
      mapInstance.fitBounds(bounds, {
        padding: UI_CONFIG.FIT_BOUNDS_PADDING,
        maxZoom: UI_CONFIG.MAX_ZOOM_ON_FIT,
      });
    }
  }, [mapInstance, backendPins, normalIcon, onPinClick, isCollapsed, isFocusAnimatingRef]);

  // Update marker icons when focusedPinId changes (without recreating all markers)
  useEffect(() => {
    if (!mapInstance || isCollapsed) return;

    markersRef.current.forEach((marker, pinId) => {
      const isFocused = focusedPinId === pinId;

      let icon = normalIcon;
      let zIndex = 100;

      if (isFocused) {
        icon = focusedIcon;
        zIndex = 1000;
      }

      marker.setIcon(icon);
      marker.setZIndexOffset(zIndex);
    });
  }, [focusedPinId, normalIcon, focusedIcon, mapInstance, isCollapsed]);

  return { markersRef };
};
