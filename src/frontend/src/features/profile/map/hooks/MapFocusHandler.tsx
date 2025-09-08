import { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { Vibe as BackendPin } from '../../../../backend/backend.did';
import { parseCoordinates } from '../utils/map-utils';
import { UI_CONFIG } from '../utils/map-constants';

interface UseMapFocusHandlerProps {
  mapInstance: L.Map | null;
  focusedPinId?: string;
  backendPins: BackendPin[];
  markersRef: React.MutableRefObject<Map<string, L.Marker>>;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isFocusAnimatingRef: React.MutableRefObject<boolean>;
}

export const useMapFocusHandler = ({
  mapInstance,
  focusedPinId,
  backendPins,
  markersRef,
  isCollapsed,
  setIsCollapsed,
  isFocusAnimatingRef,
}: UseMapFocusHandlerProps) => {
  const expandTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle focusing on a specific pin with two-stage animation
  useEffect(() => {
    if (expandTimeoutRef.current) {
      clearTimeout(expandTimeoutRef.current);
      expandTimeoutRef.current = null;
    }

    if (!mapInstance || !focusedPinId) {
      isFocusAnimatingRef.current = false;
      return;
    }

    // Set animation flag to prevent fitBounds interference
    isFocusAnimatingRef.current = true;

    // Find the focused marker
    const focusedMarker = markersRef.current.get(focusedPinId);
    if (!focusedMarker) {
      console.warn('Focused marker not found:', focusedPinId);
      return;
    }

    // Ensure map is expanded when focusing on a pin
    if (isCollapsed) {
      setIsCollapsed(false);
      // Wait for map to expand before trying to animate
      expandTimeoutRef.current = setTimeout(() => {
        performFocusAnimation();
      }, 400); // Wait for collapse animation to complete
      return;
    }

    performFocusAnimation();

    function performFocusAnimation() {
      if (!mapInstance || !focusedMarker) return;

      const markerLatLng = focusedMarker.getLatLng();

      if (mapInstance && focusedMarker) {
        mapInstance.setView(markerLatLng, 15, { animate: true, duration: 0.8 });
      }
    }
  }, [
    focusedPinId,
    mapInstance,
    isCollapsed,
    backendPins,
    markersRef,
    setIsCollapsed,
    isFocusAnimatingRef,
  ]);
};
