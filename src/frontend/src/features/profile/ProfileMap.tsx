import React, { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Pin as BackendPin } from '../../backend/backend.did';
import { useMapInstance } from './useMapInstance';
import { MapLoadingOverlay, CollapseButton } from './MapComponents';
import { parseCoordinates, type ValidPin } from './map-utils';
import { MAP_CONFIG, UI_CONFIG } from './map-constants';

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
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const expandTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Create custom icons for focused and normal pins
  const normalIcon = L.divIcon({
    className: 'custom-pin-icon',
    html: `<div class="w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg" style="z-index: 100;"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
  
  const focusedIcon = L.divIcon({
    className: 'custom-pin-icon focused',
    html: `<div class="w-8 h-8 bg-red-500 rounded-full border-3 border-white shadow-xl animate-pulse" style="z-index: 1000; position: relative;"></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
  
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
          zIndexOffset: 0 
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

    if (validPins.length > 0) {
      const bounds = L.latLngBounds(validPins.map(p => [p.lat, p.lng]));
      mapInstance.fitBounds(bounds, { 
        padding: UI_CONFIG.FIT_BOUNDS_PADDING, 
        maxZoom: UI_CONFIG.MAX_ZOOM_ON_FIT 
      });
    }
  }, [mapInstance, backendPins, normalIcon, focusedIcon, onPinClick, isCollapsed]);

  // Update marker icons when focusedPinId changes (without recreating all markers)
  useEffect(() => {
    if (!mapInstance || isCollapsed) return;

    markersRef.current.forEach((marker, pinId) => {
      const isFocused = focusedPinId === pinId;
      const icon = isFocused ? focusedIcon : normalIcon;
      
      marker.setIcon(icon);
      marker.setZIndexOffset(isFocused ? 1000 : 0);
    });
  }, [focusedPinId, normalIcon, focusedIcon, mapInstance, isCollapsed]);

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

    if (!mapInstance || !focusedPinId) return;

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
            .map(pin => {
              const coords = parseCoordinates(pin.latitude, pin.longitude);
              return coords ? [coords.lat, coords.lng] : null;
            })
            .filter(Boolean) as [number, number][]
        );
        
        mapInstance.fitBounds(bounds, { 
          padding: UI_CONFIG.FIT_BOUNDS_PADDING, 
          maxZoom: UI_CONFIG.MAX_ZOOM_ON_FIT,
          animate: true,
          duration: 0.5
        });
        
        // Stage 2: Zoom to focused pin after 1.5 seconds
        focusTimeoutRef.current = setTimeout(() => {
          if (mapInstance && focusedMarker) {
            mapInstance.setView(markerLatLng, 15, { animate: true, duration: 0.8 });
          }
          focusTimeoutRef.current = null;
        }, 1500);
      } else {
        // If only one pin, just zoom to it directly
        mapInstance.setView(markerLatLng, 15, { animate: true, duration: 0.5 });
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
  }, [focusedPinId, mapInstance, isCollapsed, backendPins]);

  return (
    <>
      {/* CSS for pin z-index management */}
      <style>{`
        .custom-pin-icon.focused {
          z-index: 1000 !important;
        }
        .custom-pin-icon {
          z-index: 100;
        }
      `}</style>
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
    </>
  );
};
