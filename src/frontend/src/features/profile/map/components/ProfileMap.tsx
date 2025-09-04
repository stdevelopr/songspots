import React, { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Pin as BackendPin } from '../../../../backend/backend.did';
import { useMapInstance } from '../hooks/useMapInstance';
import { MapLoadingOverlay, CollapseButton, MapCollapsedView } from './MapComponents';
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
}

export const ProfileMap: React.FC<ProfileMapProps> = ({
  backendPins,
  className = '',
  style,
  expandedHeight = UI_CONFIG.DEFAULT_EXPANDED_HEIGHT,
  onPinClick,
  focusedPinId,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const isFocusAnimatingRef = useRef<boolean>(false);

  const { normalIcon, focusedIcon } = useMapIcons();

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
    focusedIcon,
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
    setIsCollapsed((prev) => !prev);
  }, []);

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
            <CollapseButton onClick={toggleCollapse} isCollapsed={isCollapsed} />
          </div>
        )}
      </div>
    </>
  );
};
