import { useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';
import type { Pin, Vibe } from '@features/map/types/map';

import { getMoodIcon } from '@common/utils/icons';
import { clusterPins, createClusterHTML } from '@common/utils/clustering';
import clusterStyles from '@common/components/ClusterMarker.module.css';

interface Options {
  map: L.Map | null;
  pins?: Pin[];
  vibes?: Vibe[];
  onViewProfile: (userId: string | null) => void;
  onEdit: (pin: Pin | Vibe) => void;
  onDelete: (pin: Pin | Vibe) => void;
  onPinClick?: (pin: Pin) => void;
  onVibeClick?: (vibe: Vibe) => void;
  isMobile?: boolean;
}

export function useVibeLayer({
  map,
  pins,
  vibes,
  onViewProfile: _onViewProfile,
  onEdit: _onEdit,
  onDelete: _onDelete,
  onPinClick,
  onVibeClick,
  isMobile: _isMobile,
}: Options) {
  const layerRef = useRef<L.LayerGroup | null>(null);
  const currentZoomRef = useRef<number>(10);

  const itemsToRender = useMemo<(Pin | Vibe)[]>(() => {
    if (vibes && vibes.length) return vibes as (Pin | Vibe)[];
    if (pins && pins.length) return pins as (Pin | Vibe)[];
    return [];
  }, [pins, vibes]);

  const createMarkersForZoom = (zoomLevel: number) => {
    if (!map) return;

    // Remove previous layer group
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
    }

    const layer = L.layerGroup().addTo(map);
    layerRef.current = layer;

    const isVibeMode = !!vibes;

    // Use clustering for very low zoom levels (global/continental view)
    if (zoomLevel <= 9 && itemsToRender.length > 0) {
      const clusters = clusterPins(itemsToRender, zoomLevel);
      
      clusters.forEach((cluster) => {
        if (cluster.count === 1) {
          // Single item - show as individual pin
          const item = cluster.items[0];
          const icon = getMoodIcon(item.mood, !!item.isPrivate, !!item.musicLink, zoomLevel);
          const m = L.marker([item.lat, item.lng], { icon });
          
          m.on('click', () => {
            if (isVibeMode && onVibeClick) {
              onVibeClick(item as Vibe);
            } else if (!isVibeMode && onPinClick) {
              onPinClick(item as Pin);
            }
          });
          m.addTo(layer);
        } else {
          // Multiple items - show as cluster
          const clusterIcon = L.divIcon({
            className: clusterStyles.clusterMarker,
            html: createClusterHTML(cluster),
            iconSize: [cluster.count < 10 ? 32 : cluster.count < 50 ? 44 : 56, cluster.count < 10 ? 32 : cluster.count < 50 ? 44 : 56],
            iconAnchor: [cluster.count < 10 ? 16 : cluster.count < 50 ? 22 : 28, cluster.count < 10 ? 16 : cluster.count < 50 ? 22 : 28],
            popupAnchor: [0, cluster.count < 10 ? -16 : cluster.count < 50 ? -22 : -28],
          });
          
          const clusterMarker = L.marker([cluster.lat, cluster.lng], { icon: clusterIcon });
          
          // Cluster click behavior - zoom in to show individual pins
          clusterMarker.on('click', () => {
            const targetZoom = Math.min(zoomLevel + 3, 15); // Zoom in 3 levels or to max detail
            map.setView([cluster.lat, cluster.lng], targetZoom);
          });
          
          clusterMarker.addTo(layer);
        }
      });
    } else {
      // High zoom - show individual pins
      itemsToRender.forEach((item) => {
        const icon = getMoodIcon(item.mood, !!item.isPrivate, !!item.musicLink, zoomLevel);

        const m = L.marker([item.lat, item.lng], { icon });

        m.on('click', () => {
          if (isVibeMode && onVibeClick) {
            onVibeClick(item as Vibe);
          } else if (!isVibeMode && onPinClick) {
            onPinClick(item as Pin);
          }
        });
        m.addTo(layer);
      });
    }
  };

  useEffect(() => {
    if (!map) return;

    const currentZoom = map.getZoom();
    currentZoomRef.current = currentZoom;
    createMarkersForZoom(currentZoom);

    // Listen for zoom changes
    const handleZoomEnd = () => {
      const newZoom = map.getZoom();
      if (Math.abs(newZoom - currentZoomRef.current) >= 1) {
        currentZoomRef.current = newZoom;
        createMarkersForZoom(newZoom);
      }
    };

    map.on('zoomend', handleZoomEnd);

    return () => {
      map.off('zoomend', handleZoomEnd);
      // Remove any remaining layer group on unmount/change
      if (layerRef.current) {
        try {
          map.removeLayer(layerRef.current);
        } catch {}
        layerRef.current = null;
      }
    };
  }, [map, itemsToRender, _isMobile]);
}
