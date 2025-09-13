import { useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';
import type { Pin, Vibe } from '@features/map/types/map';

import { getMoodIcon } from '@common/utils/icons';
import { clusterPins, createClusterHTML } from '@common/utils/clustering';
import type { MoodType } from '@common/types/moods';
import clusterStyles from '@common/components/ClusterMarker.module.css';

/**
 * Options for rendering vibe/pin markers on a Leaflet map with simple zoom-aware clustering.
 */
interface Options {
  map: L.Map | null;
  pins?: Pin[];
  vibes?: Vibe[];
  onViewProfile: (userId: string | null) => void;
  onEdit: (pin: Pin | Vibe) => void;
  onDelete: (pin: Pin | Vibe) => void;
  onPinClick?: (pin: Pin) => void;
  onVibeClick?: (vibe: Vibe) => void;
  onMultipleVibesSelected?: (vibes: (Pin | Vibe)[]) => void;
  isMobile?: boolean;
  /** Cluster when zoom is at or below this level (default: 9) */
  clusterAtOrBelow?: number;
  /** Zoom-in delta when clicking a cluster (default: 3) */
  zoomInOnClusterBy?: number;
  /** Maximum zoom level when zooming into a cluster (default: 15) */
  maxDetailZoom?: number;
  /** Optional hook when a cluster gets clicked */
  onClusterClick?: (lat: number, lng: number, nextZoom: number) => void;
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
  onMultipleVibesSelected,
  isMobile: _isMobile,
  clusterAtOrBelow = 9,
  zoomInOnClusterBy = 3,
  maxDetailZoom = 15,
  onClusterClick,
}: Options) {
  const layerRef = useRef<L.LayerGroup | null>(null);
  const currentZoomRef = useRef<number>(10);

  // Compute reasonable padding for fitBounds so expanded markers stay on-screen
  const getFitPadding = () => {
    if (!map) return { padding: L.point(60, 60) } as L.FitBoundsOptions;
    const size = map.getSize();
    // Use ~8% of width and ~10% of height for padding
    const padX = Math.max(40, Math.round(size.x * 0.08));
    const padY = Math.max(48, Math.round(size.y * 0.10));
    return { padding: L.point(padX, padY) } as L.FitBoundsOptions;
  };

  const itemsToRender = useMemo<(Pin | Vibe)[]>(() => {
    let items: (Pin | Vibe)[] = [];
    if (vibes && vibes.length) items = vibes as (Pin | Vibe)[];
    else if (pins && pins.length) items = pins as (Pin | Vibe)[];
    
    console.log('useVibeLayer itemsToRender:', {
      totalItems: items.length,
      hasVibes: !!vibes?.length,
      hasPins: !!pins?.length,
      hasMultipleVibesCallback: !!onMultipleVibesSelected,
      items: items.map(item => ({ id: item.id, lat: item.lat, lng: item.lng, name: item.name }))
    });
    
    return items;
  }, [pins, vibes, onMultipleVibesSelected]);

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
    if (zoomLevel <= clusterAtOrBelow && itemsToRender.length > 0) {
      const clusters = clusterPins(itemsToRender, zoomLevel);
      
      clusters.forEach((cluster) => {
        if (cluster.count === 1) {
          // Single item - show as individual pin
          const item = cluster.items[0];
          const icon = getMoodIcon(item.mood, !!item.isPrivate, !!item.musicLink, zoomLevel);
          const m = L.marker([item.lat, item.lng], { icon });
          
          m.on('click', (e) => {
            console.log('Clustered vibe marker clicked!', { item, isVibeMode, hasVibeClick: !!onVibeClick, hasPinClick: !!onPinClick });
            e.originalEvent?.stopPropagation();
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
          
          // Cluster click behavior - zoom to fit all items with padding
          clusterMarker.on('click', (e) => {
            e.originalEvent?.stopPropagation();
            const targetZoom = Math.min(zoomLevel + zoomInOnClusterBy, maxDetailZoom);
            if (onClusterClick) onClusterClick(cluster.lat, cluster.lng, targetZoom);

            // Build bounds from all items in this cluster
            const points = cluster.items.map(it => L.latLng(it.lat, it.lng));
            const bounds = L.latLngBounds(points);
            const isZeroArea =
              Math.abs(bounds.getNorth() - bounds.getSouth()) < 1e-9 &&
              Math.abs(bounds.getEast() - bounds.getWest()) < 1e-9;

            if (!isZeroArea) {
              map.fitBounds(bounds, {
                ...getFitPadding(),
                maxZoom: maxDetailZoom,
                animate: true,
              });
            } else {
              // Fallback for identical coords: zoom in centered
              map.setView([cluster.lat, cluster.lng], targetZoom, { animate: true });
            }
          });
          
          clusterMarker.addTo(layer);
        }
      });
    } else {
      // High zoom - group nearby pins using progressive proximity clustering
      // Calculate visual overlap threshold based on marker size and zoom level
      const getVisualOverlapThreshold = (zoom: number) => {
        if (!itemsToRender.length) return 0;
        
        // Much smaller visual overlap threshold - only prevent actual overlapping markers
        const baseMarkerSize = 40; // pixels
        const metersPerPixel = 156543.03392 * Math.cos(itemsToRender[0]?.lat * Math.PI / 180) / Math.pow(2, zoom);
        const markerRadiusInDegrees = (baseMarkerSize / 2 * metersPerPixel) / 111320; // Convert pixels to degrees
        
        // Minimal padding - just enough to prevent actual overlap
        return markerRadiusInDegrees * 1.1; // Only 1.1x marker radius, much tighter
      };
      
      const getProximityThreshold = (zoom: number) => {
        const visualThreshold = getVisualOverlapThreshold(zoom);
        
        // Use the larger of coordinate-based threshold or visual overlap threshold
        let coordinateThreshold;
        if (zoom <= 12) coordinateThreshold = 0.001;   // ~111 meters - wide grouping for overview
        else if (zoom <= 14) coordinateThreshold = 0.0005;  // ~55 meters - medium grouping
        else if (zoom <= 15) coordinateThreshold = 0.0002;  // ~22 meters - closer grouping
        else if (zoom <= 16) coordinateThreshold = 0.0001;  // ~11 meters - tight grouping
        else if (zoom <= 17) coordinateThreshold = 0.00005; // ~5.5 meters - very tight
        else coordinateThreshold = 0.00002;                 // ~2.2 meters - same position only
        
        return Math.max(coordinateThreshold, visualThreshold);
      };
      
      const proximityThreshold = getProximityThreshold(zoomLevel);
      const isAtMaxZoom = zoomLevel >= 19; // At maximum zoom level
      const locationGroups = new Map<string, typeof itemsToRender>();
      const processedItems = new Set<string>();
      
      itemsToRender.forEach((item, index) => {
        if (processedItems.has(item.id)) return;
        
        // Find all items within proximity threshold
        const nearbyItems = [item];
        processedItems.add(item.id);
        
        itemsToRender.forEach((otherItem, otherIndex) => {
          if (otherIndex === index || processedItems.has(otherItem.id)) return;
          
          // Calculate distance
          const latDiff = Math.abs(item.lat - otherItem.lat);
          const lngDiff = Math.abs(item.lng - otherItem.lng);
          const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
          
          if (distance <= proximityThreshold) {
            nearbyItems.push(otherItem);
            processedItems.add(otherItem.id);
          }
        });
        
        // Use the first item's coordinates as the group key
        const groupKey = `${item.lat.toFixed(8)},${item.lng.toFixed(8)}`;
        locationGroups.set(groupKey, nearbyItems);
      });
      
      // Debug logging for clustering
      const visualThreshold = getVisualOverlapThreshold(zoomLevel);
      console.log('Progressive proximity grouping with visual overlap:', {
        totalItems: itemsToRender.length,
        zoomLevel,
        visualThreshold,
        visualThresholdMeters: Math.round(visualThreshold * 111000),
        proximityThreshold,
        proximityThresholdMeters: Math.round(proximityThreshold * 111000), // Convert to meters
        isAtMaxZoom,
        groupCount: locationGroups.size,
        groups: Array.from(locationGroups.entries()).map(([key, items]) => ({
          key,
          count: items.length,
          items: items.map(item => ({ id: item.id, lat: item.lat, lng: item.lng, name: item.name }))
        }))
      });
      
      locationGroups.forEach((items, locationKey) => {
        if (items.length === 1) {
          // Single item at this location
          const item = items[0];
          const icon = getMoodIcon(item.mood, !!item.isPrivate, !!item.musicLink, zoomLevel);
          const m = L.marker([item.lat, item.lng], { icon });

          m.on('click', (e) => {
            console.log('Vibe marker clicked!', { item, isVibeMode, hasVibeClick: !!onVibeClick, hasPinClick: !!onPinClick });
            e.originalEvent?.stopPropagation();
            if (isVibeMode && onVibeClick) {
              onVibeClick(item as Vibe);
            } else if (!isVibeMode && onPinClick) {
              onPinClick(item as Pin);
            }
          });
          m.addTo(layer);
        } else {
          // Multiple items at exact same location - show as mini cluster
          console.log('Creating mini cluster for multiple items:', {
            count: items.length,
            locationKey,
            items: items.map(item => ({ id: item.id, name: item.name, lat: item.lat, lng: item.lng }))
          });
          
          const firstItem = items[0];
          
          // Create proper cluster data for HTML generation
          const moodDistribution: Record<MoodType | 'none', number> = {} as Record<MoodType | 'none', number>;
          items.forEach(item => {
            const mood = item.mood || 'none';
            moodDistribution[mood as MoodType | 'none'] = (moodDistribution[mood as MoodType | 'none'] || 0) + 1;
          });
          
          // Find dominant mood
          const sortedMoods = Object.entries(moodDistribution)
            .filter(([mood]) => mood !== 'none')
            .sort(([, a], [, b]) => b - a);
          const dominantMood = (sortedMoods.length > 0 ? sortedMoods[0][0] : 'none') as MoodType | 'none';
          
          const clusterData = {
            lat: firstItem.lat,
            lng: firstItem.lng,
            count: items.length,
            items,
            moodDistribution,
            dominantMood,
            clusterMood: dominantMood,
            moodConfidence: sortedMoods.length > 0 ? sortedMoods[0][1] / items.length : 0,
            moodBlend: '',
            radius: 0,
          };
          
          const clusterIcon = L.divIcon({
            className: `${clusterStyles.clusterMarker} proximity-cluster`,
            html: createClusterHTML(clusterData),
            iconSize: [40, 40], // Slightly larger to make clusters more prominent
            iconAnchor: [20, 20],
            popupAnchor: [0, -20],
          });
          
          const clusterMarker = L.marker([firstItem.lat, firstItem.lng], { icon: clusterIcon });
          
          // Smart click behavior: fit bounds to items when possible
          clusterMarker.on('click', (e) => {
            e.originalEvent?.stopPropagation();
            console.log('Multiple vibes cluster clicked!', { 
              items: items.length, 
              zoomLevel, 
              isAtMaxZoom,
              proximityThreshold,
              proximityThresholdMeters: Math.round(proximityThreshold * 111000)
            });

            // Try to fit bounds to all items first so none fall off-screen
            const points = items.map(it => L.latLng(it.lat, it.lng));
            const bounds = L.latLngBounds(points);
            const isZeroArea =
              Math.abs(bounds.getNorth() - bounds.getSouth()) < 1e-9 &&
              Math.abs(bounds.getEast() - bounds.getWest()) < 1e-9;

            if (!isZeroArea) {
              map?.fitBounds(bounds, {
                ...getFitPadding(),
                maxZoom: 20,
                animate: true,
              });
              return;
            }

            // If at maximum zoom, show selection instead of trying to zoom further
            if (isAtMaxZoom) {
              console.log('At maximum zoom - showing selection for cluster:', { 
                itemCount: items.length, 
                zoomLevel 
              });
              if (onMultipleVibesSelected) {
                onMultipleVibesSelected(items);
              } else {
                // Fallback: just open the first one
                if (isVibeMode && onVibeClick) {
                  onVibeClick(items[0] as Vibe);
                } else if (!isVibeMode && onPinClick) {
                  onPinClick(items[0] as Pin);
                }
              }
            } else {
              // Calculate the zoom level needed for proper visual separation (identical coords)
              const calculateRequiredZoom = () => {
                // Find the closest pair of items in the cluster
                let minDistance = Infinity;
                for (let i = 0; i < items.length; i++) {
                  for (let j = i + 1; j < items.length; j++) {
                    const latDiff = items[i].lat - items[j].lat;
                    const lngDiff = items[i].lng - items[j].lng;
                    const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
                    minDistance = Math.min(minDistance, distance);
                  }
                }
                
                // Calculate zoom needed for 120px separation (3x marker size for clear separation)
                const requiredSeparationPx = 120;
                const lat = items[0].lat;
                
                // Binary search for the right zoom level
                for (let testZoom = zoomLevel + 1; testZoom <= 22; testZoom++) {
                  const metersPerPixel = 156543.03392 * Math.cos(lat * Math.PI / 180) / Math.pow(2, testZoom);
                  const separationInDegrees = (requiredSeparationPx * metersPerPixel) / 111320;
                  
                  if (minDistance >= separationInDegrees) {
                    return Math.min(testZoom, 20); // Cap at zoom 20 (higher than before)
                  }
                }
                
                return 20; // Fallback to max zoom 20
              };
              
              const targetZoom = calculateRequiredZoom();
              console.log(`Intelligent zoom calculation: ${zoomLevel} → ${targetZoom} (needed for visual separation)`);
              map?.setView([firstItem.lat, firstItem.lng], targetZoom, { animate: true });
            }
          });
          
          clusterMarker.addTo(layer);
        }
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
