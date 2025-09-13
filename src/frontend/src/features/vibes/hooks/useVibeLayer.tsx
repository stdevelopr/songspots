import { useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';
import type { Pin, Vibe } from '@features/map/types/map';

import { getMoodIcon } from '@common/utils/icons';
import { createClusterHTML, calculateClusterMood } from '@common/utils/clustering';
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
    
    // cleaned logs
    
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

    // Use clustering for low zoom levels, but only when markers visually overlap (screen-space)
    if (zoomLevel <= clusterAtOrBelow && itemsToRender.length > 0 && map) {
      // Determine mood marker diameter (matches CSS zoom classes in MarkerIcons.module.css)
      const getMarkerDiameterPx = (zoom: number) => {
        if (zoom <= 5) return 12; // zoom-very-low
        if (zoom <= 10) return 16; // zoom-low
        if (zoom <= 14) return 24; // zoom-medium
        return 32; // zoom-high
      };

      const markerDiameterPx = getMarkerDiameterPx(zoomLevel);
      const overlapThresholdPx = markerDiameterPx; // cluster only when centers are within 1x diameter

      // Precompute pixel positions at current zoom
      const points = itemsToRender.map((item) => ({
        item,
        pixel: map.project(L.latLng(item.lat, item.lng), zoomLevel),
      }));

      const visited = new Set<string>();
      type Cluster = {
        lat: number;
        lng: number;
        count: number;
        items: (Pin | Vibe)[];
        moodDistribution: Record<MoodType | 'none', number>;
        dominantMood: MoodType | 'none';
        clusterMood: MoodType | 'none';
        moodConfidence: number;
        moodBlend: string;
        radius: number;
      };
      const clusters: Cluster[] = [];

      for (let i = 0; i < points.length; i++) {
        const { item: seedItem } = points[i];
        if (visited.has(seedItem.id)) continue;

        // BFS/union-find style grouping by screen-space overlap
        const queue: (Pin | Vibe)[] = [seedItem];
        const group: (Pin | Vibe)[] = [];
        visited.add(seedItem.id);

        while (queue.length) {
          const current = queue.pop()!;
          group.push(current);
          const currentPx = map.project(L.latLng(current.lat, current.lng), zoomLevel);

          for (let j = 0; j < points.length; j++) {
            const candidate = points[j].item;
            if (visited.has(candidate.id)) continue;
            const candidatePx = points[j].pixel;
            const dx = currentPx.x - candidatePx.x;
            const dy = currentPx.y - candidatePx.y;
            const dist = Math.hypot(dx, dy);
            if (dist <= overlapThresholdPx) {
              visited.add(candidate.id);
              queue.push(candidate);
            }
          }
        }

        if (group.length === 1) {
          // Single item - show as individual pin
          const item = group[0];
          const icon = getMoodIcon(item.mood, !!item.isPrivate, !!item.musicLink, zoomLevel);
          const m = L.marker([item.lat, item.lng], { icon });
          m.on('click', (e) => {
            e.originalEvent?.stopPropagation();
            if (isVibeMode && onVibeClick) onVibeClick(item as Vibe);
            else if (!isVibeMode && onPinClick) onPinClick(item as Pin);
          });
          m.addTo(layer);
        } else {
          // Build cluster meta
          const moodDistribution: Record<MoodType | 'none', number> = {
            energetic: 0,
            chill: 0,
            creative: 0,
            romantic: 0,
            peaceful: 0,
            party: 0,
            mysterious: 0,
            none: 0,
          };
          let latSum = 0;
          let lngSum = 0;
          group.forEach((it) => {
            latSum += it.lat;
            lngSum += it.lng;
            const mood = (it.mood || 'none') as MoodType | 'none';
            moodDistribution[mood] = (moodDistribution[mood] || 0) + 1;
          });
          const lat = latSum / group.length;
          const lng = lngSum / group.length;

          // Determine dominant mood and blended style
          const sortedMoods = Object.entries(moodDistribution)
            .filter(([m]) => m !== 'none')
            .sort(([, a], [, b]) => (b as number) - (a as number));
          const dominantMood = (sortedMoods.length > 0 ? sortedMoods[0][0] : 'none') as MoodType | 'none';
          const moodAnalysis = calculateClusterMood(moodDistribution);

          const cluster = {
            lat,
            lng,
            count: group.length,
            items: group,
            moodDistribution,
            dominantMood,
            clusterMood: moodAnalysis.clusterMood,
            moodConfidence: moodAnalysis.confidence,
            moodBlend: moodAnalysis.blend,
            radius: 0,
          };
          clusters.push(cluster);

          const size = cluster.count < 10 ? 32 : cluster.count < 50 ? 44 : 56;
          const clusterIcon = L.divIcon({
            className: clusterStyles.clusterMarker,
            html: createClusterHTML(cluster),
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
            popupAnchor: [0, -size / 2],
          });

          const clusterMarker = L.marker([cluster.lat, cluster.lng], { icon: clusterIcon });
          clusterMarker.on('click', (e) => {
            e.originalEvent?.stopPropagation();
            const targetZoom = Math.min(zoomLevel + zoomInOnClusterBy, maxDetailZoom);
            if (onClusterClick) onClusterClick(cluster.lat, cluster.lng, targetZoom);

            const rawMax = map.getMaxZoom?.();
            const mapMaxZoom = (rawMax == null || !isFinite(rawMax as number)) ? 20 : (rawMax as number);
            const currentZoom = map.getZoom?.() ?? zoomLevel;

            if (currentZoom >= Math.min(mapMaxZoom, targetZoom)) {
              if (onMultipleVibesSelected) {
                onMultipleVibesSelected(cluster.items);
                return;
              }
            }

            const pointsLatLng = cluster.items.map((it) => L.latLng(it.lat, it.lng));
            const bounds = L.latLngBounds(pointsLatLng);
            const isZeroArea =
              Math.abs(bounds.getNorth() - bounds.getSouth()) < 1e-9 &&
              Math.abs(bounds.getEast() - bounds.getWest()) < 1e-9;

            if (!isZeroArea) {
              map.fitBounds(bounds, { ...getFitPadding(), maxZoom: maxDetailZoom, animate: true });
            } else {
              map.setView([cluster.lat, cluster.lng], targetZoom, { animate: true });
            }
          });

          clusterMarker.addTo(layer);
        }
      }
    } else {
      // High zoom: collapse only true overlaps using screen-space grouping
      if (!map || itemsToRender.length === 0) return;

      const markerDiameterPx = zoomLevel <= 5 ? 12 : zoomLevel <= 10 ? 16 : zoomLevel <= 14 ? 24 : 32;
      const thresholdPx = markerDiameterPx; // collapse only if centers are within icon diameter

      const pts = itemsToRender.map((item) => ({ item, px: map.project([item.lat, item.lng], zoomLevel) }));
      const used = new Set<string>();

      const clusters: {
        items: (Pin | Vibe)[];
        lat: number;
        lng: number;
        moodDistribution: Record<MoodType | 'none', number>;
      }[] = [];

      for (let i = 0; i < pts.length; i++) {
        const seed = pts[i];
        if (used.has(seed.item.id)) continue;
        const queue: (Pin | Vibe)[] = [seed.item];
        used.add(seed.item.id);
        const group: (Pin | Vibe)[] = [];
        while (queue.length) {
          const cur = queue.pop()!;
          group.push(cur);
          const curPx = map.project([cur.lat, cur.lng], zoomLevel);
          for (let j = 0; j < pts.length; j++) {
            const cand = pts[j].item;
            if (used.has(cand.id)) continue;
            const candPx = pts[j].px;
            if (Math.hypot(curPx.x - candPx.x, curPx.y - candPx.y) <= thresholdPx) {
              used.add(cand.id);
              queue.push(cand);
            }
          }
        }

        // Build cluster record
        let lat = 0, lng = 0;
        const moodDistribution: Record<MoodType | 'none', number> = {
          energetic: 0, chill: 0, creative: 0, romantic: 0, peaceful: 0, party: 0, mysterious: 0, none: 0,
        };
        group.forEach((it) => {
          lat += it.lat; lng += it.lng;
          const mood = (it.mood || 'none') as MoodType | 'none';
          moodDistribution[mood] = (moodDistribution[mood] || 0) + 1;
        });
        lat /= group.length; lng /= group.length;
        clusters.push({ items: group, lat, lng, moodDistribution });
      }

      // Render
      clusters.forEach((c) => {
        if (c.items.length === 1) {
          const item = c.items[0];
          const icon = getMoodIcon(item.mood, !!item.isPrivate, !!item.musicLink, zoomLevel);
          const m = L.marker([item.lat, item.lng], { icon });
          m.on('click', (e) => {
            e.originalEvent?.stopPropagation();
            if (isVibeMode && onVibeClick) onVibeClick(item as Vibe);
            else if (!isVibeMode && onPinClick) onPinClick(item as Pin);
          });
          m.addTo(layer);
        } else {
          const sortedMoods = Object.entries(c.moodDistribution)
            .filter(([m]) => m !== 'none')
            .sort(([, a], [, b]) => (b as number) - (a as number));
          const dominantMood = (sortedMoods.length > 0 ? sortedMoods[0][0] : 'none') as MoodType | 'none';
          const moodAnalysis = calculateClusterMood(c.moodDistribution);
          const clusterData = {
            lat: c.lat,
            lng: c.lng,
            count: c.items.length,
            items: c.items,
            moodDistribution: c.moodDistribution,
            dominantMood,
            clusterMood: moodAnalysis.clusterMood,
            moodConfidence: moodAnalysis.confidence,
            moodBlend: moodAnalysis.blend,
            radius: 0,
          };
          const size = clusterData.count < 10 ? 32 : clusterData.count < 50 ? 44 : 56;
          const clusterIcon = L.divIcon({
            className: clusterStyles.clusterMarker,
            html: createClusterHTML(clusterData),
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
            popupAnchor: [0, -size / 2],
          });
          const clusterMarker = L.marker([clusterData.lat, clusterData.lng], { icon: clusterIcon });
          clusterMarker.on('click', (e) => {
            e.originalEvent?.stopPropagation();
            const targetZoom = Math.min(zoomLevel + zoomInOnClusterBy, maxDetailZoom);
            if (onClusterClick) onClusterClick(clusterData.lat, clusterData.lng, targetZoom);
            const rawMax = map.getMaxZoom?.();
            const mapMax = (rawMax == null || !isFinite(rawMax as number)) ? 20 : (rawMax as number);
            const currentZoom = map.getZoom?.() ?? zoomLevel;
            if (currentZoom >= Math.min(mapMax, targetZoom)) {
              if (onMultipleVibesSelected) { onMultipleVibesSelected(clusterData.items); return; }
            }
            const points = clusterData.items.map((it) => L.latLng(it.lat, it.lng));
            const bounds = L.latLngBounds(points);
            const isZero = Math.abs(bounds.getNorth() - bounds.getSouth()) < 1e-9 && Math.abs(bounds.getEast() - bounds.getWest()) < 1e-9;
            if (!isZero) map.fitBounds(bounds, { ...getFitPadding(), maxZoom: maxDetailZoom, animate: true });
            else map.setView([clusterData.lat, clusterData.lng], targetZoom, { animate: true });
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
