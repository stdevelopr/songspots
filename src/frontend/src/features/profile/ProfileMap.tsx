import React, { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Pin as BackendPin } from '../../backend/backend.did';
import { useMapInstance } from './useMapInstance';
import { MapLoadingOverlay, CollapseButton } from './MapComponents';
import { parseCoordinates, createPopupContent, type ValidPin } from './map-utils';
import { MAP_CONFIG, UI_CONFIG } from './map-constants';

interface ProfileMapProps {
  backendPins: BackendPin[];
  className?: string;
  style?: React.CSSProperties;
  expandedHeight?: string;
}

export const ProfileMap: React.FC<ProfileMapProps> = ({
  backendPins,
  className = '',
  style,
  expandedHeight = UI_CONFIG.DEFAULT_EXPANDED_HEIGHT,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  
  const {
    mapInstance,
    isMapReady,
    containerReady,
    setContainerReady,
    cleanupMap,
    initializeMap
  } = useMapInstance(mapRef, isCollapsed, backendPins, {
    defaultCenter: MAP_CONFIG.DEFAULT_CENTER,
    defaultZoom: MAP_CONFIG.DEFAULT_ZOOM,
    singlePinZoom: MAP_CONFIG.SINGLE_PIN_ZOOM,
    multiPinZoom: MAP_CONFIG.MULTI_PIN_ZOOM,
    tileLayerUrl: MAP_CONFIG.TILE_LAYER_URL,
    maxZoom: MAP_CONFIG.MAX_ZOOM,
    attribution: MAP_CONFIG.ATTRIBUTION
  });

  const toggleCollapse = useCallback(() => {
    setIsCollapsed(prev => !prev);
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

  // Monitor when container is ready
  useEffect(() => {
    if (isCollapsed || containerReady) return;

    const checkContainer = (): boolean => {
      if (mapRef.current) {
        const rect = mapRef.current.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setContainerReady(true);
          return true;
        }
      }
      return false;
    };

    if (checkContainer()) return;

    const frameId = requestAnimationFrame(() => {
      if (checkContainer()) return;
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.boundingClientRect.width > 0) {
            setContainerReady(true);
            observer.disconnect();
          }
        });
      });

      if (mapRef.current) {
        observer.observe(mapRef.current);
      }

      return () => observer.disconnect();
    });

    return () => cancelAnimationFrame(frameId);
  }, [isCollapsed, containerReady, setContainerReady]);

  // Ensure proper map initialization
  useEffect(() => {
    if (mapInstance && !isCollapsed) {
      mapInstance.invalidateSize();
      requestAnimationFrame(() => {
        mapInstance.invalidateSize();
      });
    }
  }, [mapInstance, isCollapsed]);

  // Add markers and fit bounds when pins change
  useEffect(() => {
    if (!mapInstance) return;

    mapInstance.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        mapInstance.removeLayer(layer);
      }
    });

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

        const marker = L.marker([coords.lat, coords.lng]).addTo(mapInstance);
        marker.bindPopup(createPopupContent(pin));
      } catch (error) {
        console.warn('Error adding marker for pin:', pin, error);
      }
    });

    if (validPins.length > 0) {
      const bounds = L.latLngBounds(validPins.map(p => [p.lat, p.lng]));
      mapInstance.fitBounds(bounds, { 
        padding: UI_CONFIG.FIT_BOUNDS_PADDING, 
        maxZoom: UI_CONFIG.MAX_ZOOM_ON_FIT 
      });
    }
  }, [mapInstance, backendPins]);

  return (
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
        <div
          className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 text-white rounded-2xl shadow cursor-pointer border border-blue-400"
          style={{ borderRadius: '1rem' }}
          onClick={toggleCollapse}
        >
          <span className="font-semibold text-base pl-2">Show Map</span>
          <CollapseButton onClick={toggleCollapse} isCollapsed={isCollapsed} />
        </div>
      ) : (
        <div className="relative w-full h-full">
          <div 
            key={`map-${isCollapsed}`}
            ref={mapRef} 
            className="w-full h-full rounded-2xl"
            style={{ 
              height: expandedHeight,
              minHeight: UI_CONFIG.MIN_HEIGHT 
            }}
          />
          
          {!isMapReady && <MapLoadingOverlay />}
          <CollapseButton onClick={toggleCollapse} isCollapsed={isCollapsed} />
        </div>
      )}
    </div>
  );
};
