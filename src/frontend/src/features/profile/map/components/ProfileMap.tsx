import React, { useState, useEffect, useRef, useCallback, useImperativeHandle } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Pin as BackendPin } from '../../../../backend/backend.did';
import { useMapInstance } from '../hooks/useMapInstance';
import { MapLoadingOverlay, CollapseButton, MapCollapsedView, ShowAllButton } from './MapComponents';
import { useMapIcons, MapIconStyles } from './MapIcons';
import { useMapMarkers } from '../hooks/MapMarkers';
import { useMapContainerMonitor } from '../hooks/MapContainerMonitor';
import { useMapFocusHandler } from '../hooks/MapFocusHandler';
import { MAP_CONFIG, UI_CONFIG } from '../utils/map-constants';

interface ProfileMapProps {
  backendPins: BackendPin[];
  className?: string;
  style?: React.CSSProperties;
  expandedHeight?: string;
  onPinClick?: (pinId: string) => void;
  focusedPinId?: string;
  highlightedPinId?: string;
  onResetSelection?: () => void;
}

export interface ProfileMapRef {
  restoreBounds: () => void;
  expandMap: () => void;
}

export const ProfileMap = React.forwardRef<ProfileMapRef, ProfileMapProps>(({
  backendPins,
  className = '',
  style,
  expandedHeight = UI_CONFIG.DEFAULT_EXPANDED_HEIGHT,
  onPinClick,
  focusedPinId,
  highlightedPinId,
  onResetSelection,
}, ref) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const isFocusAnimatingRef = useRef<boolean>(false);

  const { normalIcon, highlightedIcon, focusedIcon } = useMapIcons();

  const { mapInstance, isMapReady, containerReady, setContainerReady, cleanupMap, initializeMap } =
    useMapInstance(mapRef, isCollapsed, backendPins, {
      defaultCenter: MAP_CONFIG.DEFAULT_CENTER,
      defaultZoom: MAP_CONFIG.DEFAULT_ZOOM,
      singlePinZoom: MAP_CONFIG.SINGLE_PIN_ZOOM,
      multiPinZoom: MAP_CONFIG.MULTI_PIN_ZOOM,
      tileLayerUrl: MAP_CONFIG.TILE_LAYER_URL,
      maxZoom: MAP_CONFIG.MAX_ZOOM,
      attribution: MAP_CONFIG.ATTRIBUTION,
    });

  const { markersRef } = useMapMarkers({
    mapInstance,
    backendPins,
    normalIcon,
    highlightedIcon,
    focusedIcon,
    highlightedPinId,
    focusedPinId,
    isCollapsed,
    onPinClick,
    isFocusAnimatingRef,
  });

  useMapContainerMonitor({
    mapRef,
    isCollapsed,
    containerReady,
    setContainerReady,
  });

  useMapFocusHandler({
    mapInstance,
    focusedPinId,
    backendPins,
    markersRef,
    isCollapsed,
    setIsCollapsed,
    isFocusAnimatingRef,
  });

  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => {
      const willCollapse = !prev;
      // If collapsing, reset all pin states
      if (willCollapse && onResetSelection) {
        onResetSelection();
      }
      return willCollapse;
    });
  }, [onResetSelection]);

  const restoreBounds = useCallback(() => {
    if (!mapInstance || !backendPins.length) return;
    
    // Reset animation flag to allow fitBounds to work
    isFocusAnimatingRef.current = false;
    
    if (backendPins.length === 1) {
      // Single pin - center on it with appropriate zoom
      const pin = backendPins[0];
      mapInstance.setView([parseFloat(pin.latitude), parseFloat(pin.longitude)], MAP_CONFIG.SINGLE_PIN_ZOOM, {
        animate: true,
        duration: 0.8
      });
    } else {
      // Multiple pins - fit bounds to show all
      const bounds = L.latLngBounds(
        backendPins.map(pin => [parseFloat(pin.latitude), parseFloat(pin.longitude)] as [number, number])
      );
      mapInstance.fitBounds(bounds, { 
        padding: [20, 20],
        animate: true,
        duration: 0.8
      });
    }
  }, [mapInstance, backendPins, isFocusAnimatingRef]);

  // Handle map lifecycle
  useEffect(() => {
    if (isCollapsed) {
      cleanupMap();
      return;
    }

    const cleanup = initializeMap();
    return cleanup;
  }, [isCollapsed, cleanupMap, initializeMap]);

  // Ensure proper map initialization
  useEffect(() => {
    if (mapInstance && !isCollapsed) {
      mapInstance.invalidateSize();
      requestAnimationFrame(() => {
        mapInstance.invalidateSize();
      });
    }
  }, [mapInstance, isCollapsed]);

  const expandMap = useCallback(() => {
    if (isCollapsed) {
      setIsCollapsed(false);
    }
  }, [isCollapsed]);

  const handleShowAll = useCallback(() => {
    // Reset all pin states
    if (onResetSelection) {
      onResetSelection();
    }
    // Restore map bounds to show all pins
    restoreBounds();
  }, [onResetSelection, restoreBounds]);

  // Expose functions to parent via ref
  useImperativeHandle(ref, () => ({
    restoreBounds,
    expandMap
  }), [restoreBounds, expandMap]);

  return (
    <>
      <MapIconStyles />
      <div
        className={`profile-map bg-white/95 backdrop-blur-sm border border-gray-100 shadow-sm rounded-2xl overflow-hidden transition-all duration-300 ease-in-out ${className}`}
        style={{
          ...style,
          height: isCollapsed ? UI_CONFIG.COLLAPSED_HEIGHT : expandedHeight,
          position: 'sticky',
          top: '0',
          zIndex: 10,
        }}
      >
        {isCollapsed ? (
          <MapCollapsedView onToggleCollapse={toggleCollapse} />
        ) : (
          <div className="relative w-full h-full">
            <div
              key={`map-${isCollapsed}`}
              ref={mapRef}
              className="w-full h-full rounded-2xl"
              style={{
                height: expandedHeight,
                minHeight: UI_CONFIG.MIN_HEIGHT,
              }}
            />

            {!isMapReady && <MapLoadingOverlay />}
            <ShowAllButton onClick={handleShowAll} />
            <CollapseButton onClick={toggleCollapse} isCollapsed={isCollapsed} />
          </div>
        )}
      </div>
    </>
  );
});

ProfileMap.displayName = 'ProfileMap';
