import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Pin as BackendPin } from '../../backend/backend.did';

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
  expandedHeight = '400px', // Default height, can be overridden
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const collapsedHeight = '64px';

  // Single effect to handle map lifecycle
  useEffect(() => {
    if (isCollapsed) {
      // Clean up existing map when collapsed
      if (mapInstance) {
        try {
          mapInstance.off();
          mapInstance.remove();
          
          // Clear Leaflet's internal reference to prevent "already initialized" error
          if (mapRef.current) {
            (mapRef.current as any)._leaflet_id = undefined;
            // Don't clear innerHTML as it breaks interaction
          }
        } catch (error) {
          console.warn('Error removing map:', error);
        } finally {
          setMapInstance(null);
        }
      }
      return;
    }

    // Don't create if container not ready or map already exists
    if (!mapRef.current || mapInstance) return;

    try {
      // Ensure container is clean before creating map
      if (mapRef.current) {
        (mapRef.current as any)._leaflet_id = undefined;
        // Don't clear innerHTML as it may break interaction
      }

      // Always create map with default center - pins effect will handle bounds
      let center: [number, number] = [40.7128, -74.006]; // Default to NYC
      let zoom = 10;

      const map = L.map(mapRef.current).setView(center, zoom);
      
      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      setMapInstance(map);
    } catch (error) {
      console.error('Error initializing map:', error);
    }

    // Cleanup function
    return () => {
      if (mapInstance) {
        try {
          mapInstance.off();
          mapInstance.remove();
          
          // Clear Leaflet's internal reference
          if (mapRef.current) {
            (mapRef.current as any)._leaflet_id = undefined;
            // Don't clear innerHTML as it breaks interaction
          }
        } catch (error) {
          // Safe to ignore cleanup errors
        }
      }
    };
  }, [isCollapsed, backendPins]); // Removed mapInstance from deps to prevent loops

  // Add markers for pins and fit bounds when pins change
  useEffect(() => {
    if (!mapInstance) return;

    // Clear existing markers
    mapInstance.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        mapInstance.removeLayer(layer);
      }
    });

    if (backendPins.length === 0) return;

    // Add markers for each pin
    const validPins: Array<{ lat: number; lng: number; pin: typeof backendPins[0] }> = [];
    
    backendPins.forEach((pin) => {
      try {
        const lat = parseFloat(pin.latitude);
        const lng = parseFloat(pin.longitude);
        
        if (isNaN(lat) || isNaN(lng)) {
          console.warn('Invalid coordinates for pin:', pin);
          return;
        }

        validPins.push({ lat, lng, pin });

        const marker = L.marker([lat, lng]).addTo(mapInstance);
        
        // Add popup with pin information
        const popupContent = `
          <div class="pin-popup">
            <h3 class="font-semibold text-lg mb-2">${pin.name || 'Unnamed Pin'}</h3>
            ${pin.description ? `<p class="text-sm text-gray-600 mb-2">${pin.description}</p>` : ''}
            ${pin.musicLink ? `<a href="${pin.musicLink}" target="_blank" class="text-blue-500 hover:text-blue-700 text-sm">🎵 Listen</a>` : ''}
          </div>
        `;
        
        marker.bindPopup(popupContent);
      } catch (error) {
        console.warn('Error adding marker for pin:', pin, error);
      }
    });

    // Fit bounds to show all pins if we have valid pins
    if (validPins.length > 0) {
      const bounds = L.latLngBounds(validPins.map(p => [p.lat, p.lng]));
      mapInstance.fitBounds(bounds, { padding: [20, 20], maxZoom: 15 });
    }
  }, [mapInstance, backendPins]);

  return (
    <div
      className={`profile-map bg-white/95 backdrop-blur-sm border border-gray-100 shadow-sm rounded-2xl overflow-hidden transition-all duration-300 ease-in-out ${className}`}
      style={{
        ...style,
        height: isCollapsed ? collapsedHeight : expandedHeight,
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
          <button
            onClick={toggleCollapse}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors border border-white/20"
            title="Expand map"
            style={{ marginLeft: '0.5rem' }}
          >
            <svg
              className="w-5 h-5 transform rotate-180 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15l7-7 7 7"
              />
            </svg>
          </button>
        </div>
      ) : (
        <div className="relative w-full h-full">
          {/* Map fills entire container when expanded */}
          <div 
            key={`map-${isCollapsed}`} // Force recreation of DOM element
            ref={mapRef} 
            className="w-full h-full rounded-2xl"
            style={{ 
              height: expandedHeight,
              minHeight: '150px' 
            }}
          />
          {/* Floating collapse button in top-right corner */}
          <button
            onClick={toggleCollapse}
            className="absolute top-3 right-3 p-2 rounded-lg bg-white/95 hover:bg-white shadow-lg border border-gray-200 transition-all duration-200"
            title="Collapse map"
            style={{ 
              zIndex: 1000, // Higher than Leaflet's default z-index
              pointerEvents: 'auto' // Ensure button is clickable
            }}
          >
            <svg
              className="w-5 h-5 text-gray-700 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15l7-7 7 7"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};
