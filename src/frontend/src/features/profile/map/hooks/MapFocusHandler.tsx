import { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { Pin as BackendPin } from '../../../../backend/backend.did';
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
  const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const expandTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle focusing on a specific pin with two-stage animation
  useEffect(() => {
    // Clear any existing timeouts when focusedPinId changes
    if (focusTimeoutRef.current) {
      clearTimeout(focusTimeoutRef.current);
      focusTimeoutRef.current = null;
    }
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

      // Stage 1: Show full map view with all pins for context
      if (backendPins.length > 1) {
        const bounds = L.latLngBounds(
          backendPins
            .map((pin) => {
              const coords = parseCoordinates(pin.latitude, pin.longitude);
              return coords ? [coords.lat, coords.lng] : null;
            })
            .filter(Boolean) as [number, number][]
        );

        mapInstance.fitBounds(bounds, {
          padding: UI_CONFIG.FIT_BOUNDS_PADDING,
          maxZoom: UI_CONFIG.MAX_ZOOM_ON_FIT,
          animate: true,
          duration: 0.5,
        });

        // Stage 2: Zoom to focused pin after 1.5 seconds
        focusTimeoutRef.current = setTimeout(() => {
          if (mapInstance && focusedMarker) {
            mapInstance.setView(markerLatLng, 15, { animate: true, duration: 0.8 });
            // Keep animation flag true to preserve focus - don't clear it
          }
          focusTimeoutRef.current = null;
        }, 1500);
      } else {
        // If only one pin, just zoom to it directly
        mapInstance.setView(markerLatLng, 15, { animate: true, duration: 0.5 });
        // Keep animation flag true to preserve focus - don't clear it
      }
    }

    // Cleanup function to clear timeouts when component unmounts or dependencies change
    return () => {
      if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current);
        focusTimeoutRef.current = null;
      }
      if (expandTimeoutRef.current) {
        clearTimeout(expandTimeoutRef.current);
        expandTimeoutRef.current = null;
      }
    };
  }, [focusedPinId, mapInstance, isCollapsed, backendPins, markersRef, setIsCollapsed, isFocusAnimatingRef]);
};