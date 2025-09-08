import { useState, useEffect, useCallback, useMemo } from 'react';
import L from 'leaflet';
import type { Vibe as BackendPin } from '../../../../backend/backend.did';
import { calculateMapCenter } from '../utils/map-utils';

interface UseMapInstanceConfig {
  defaultCenter: [number, number];
  defaultZoom: number;
  singlePinZoom: number;
  multiPinZoom: number;
  tileLayerUrl: string;
  maxZoom: number;
  attribution: string;
}

export const useMapInstance = (
  mapRef: React.RefObject<HTMLDivElement>, 
  isCollapsed: boolean, 
  backendPins: BackendPin[],
  config: UseMapInstanceConfig
) => {
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [containerReady, setContainerReady] = useState(false);

  const mapConfig = useMemo(() => 
    calculateMapCenter(backendPins, {
      defaultCenter: config.defaultCenter,
      defaultZoom: config.defaultZoom,
      singlePinZoom: config.singlePinZoom,
      multiPinZoom: config.multiPinZoom
    }), 
    [backendPins, config]
  );

  const cleanupMap = useCallback(() => {
    if (mapInstance) {
      try {
        mapInstance.off();
        mapInstance.remove();
        
        if (mapRef.current) {
          (mapRef.current as any)._leaflet_id = undefined;
        }
      } catch (error) {
        console.warn('Error removing map:', error);
      } finally {
        setMapInstance(null);
        setIsMapReady(false);
        setContainerReady(false);
      }
    }
  }, [mapInstance, mapRef]);

  const initializeMap = useCallback(() => {
    if (!mapRef.current || mapInstance || !containerReady || isCollapsed) {
      return;
    }

    try {
      if (mapRef.current) {
        (mapRef.current as any)._leaflet_id = undefined;
      }

      const map = L.map(mapRef.current).setView(mapConfig.center, mapConfig.zoom);
      
      L.tileLayer(config.tileLayerUrl, {
        maxZoom: config.maxZoom,
        attribution: config.attribution
      }).addTo(map);

      setMapInstance(map);

      const handleMapReady = () => {
        map.invalidateSize();
        setIsMapReady(true);
      };

      map.on('load', handleMapReady);
      map.whenReady(handleMapReady);
      
      requestAnimationFrame(() => {
        map.invalidateSize();
      });

      const resizeObserver = new ResizeObserver(() => {
        if (map && !isCollapsed) {
          map.invalidateSize();
        }
      });

      if (mapRef.current) {
        resizeObserver.observe(mapRef.current);
      }

      return () => {
        resizeObserver.disconnect();
      };
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }, [mapRef, mapInstance, containerReady, isCollapsed, mapConfig, config]);

  return {
    mapInstance,
    isMapReady,
    containerReady,
    setContainerReady,
    cleanupMap,
    initializeMap
  };
};
