import { MoodType, getMoodById } from '../types/moods';
import type { Pin, Vibe } from '../../map/types/map';

export interface ClusterData {
  lat: number;
  lng: number;
  count: number;
  items: (Pin | Vibe)[];
  moodDistribution: Record<MoodType | 'none', number>;
  dominantMood: MoodType | 'none';
  radius: number;
}

// Calculate distance between two points in kilometers
function getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Get clustering radius based on zoom level (in kilometers)
function getClusterRadius(zoomLevel: number): number {
  if (zoomLevel <= 3) return 1000; // 1000km for continental view
  if (zoomLevel <= 5) return 500;  // 500km for large country view
  if (zoomLevel <= 7) return 200;  // 200km for country/state view
  if (zoomLevel <= 9) return 50;   // 50km for regional view
  return 0; // No clustering for zoom > 9
}

// Cluster pins based on proximity and zoom level
export function clusterPins(items: (Pin | Vibe)[], zoomLevel: number): ClusterData[] {
  const clusterRadius = getClusterRadius(zoomLevel);
  
  // No clustering needed at high zoom levels
  if (clusterRadius === 0) {
    return [];
  }

  const clusters: ClusterData[] = [];
  const processed: Set<number> = new Set();

  items.forEach((item, index) => {
    if (processed.has(index)) return;

    const cluster: ClusterData = {
      lat: item.lat,
      lng: item.lng,
      count: 1,
      items: [item],
      moodDistribution: {},
      dominantMood: 'none',
      radius: clusterRadius
    };

    // Count this item's mood
    const mood = item.mood || 'none';
    cluster.moodDistribution[mood] = 1;

    processed.add(index);

    // Find nearby items to cluster
    items.forEach((otherItem, otherIndex) => {
      if (processed.has(otherIndex)) return;

      const distance = getDistance(item.lat, item.lng, otherItem.lat, otherItem.lng);
      
      if (distance <= clusterRadius) {
        cluster.items.push(otherItem);
        cluster.count++;
        processed.add(otherIndex);

        // Update mood distribution
        const otherMood = otherItem.mood || 'none';
        cluster.moodDistribution[otherMood] = (cluster.moodDistribution[otherMood] || 0) + 1;

        // Update cluster center (weighted average)
        cluster.lat = (cluster.lat * (cluster.count - 1) + otherItem.lat) / cluster.count;
        cluster.lng = (cluster.lng * (cluster.count - 1) + otherItem.lng) / cluster.count;
      }
    });

    // Determine dominant mood
    let maxCount = 0;
    let dominantMood: MoodType | 'none' = 'none';
    
    Object.entries(cluster.moodDistribution).forEach(([mood, count]) => {
      if (count > maxCount) {
        maxCount = count;
        dominantMood = mood as MoodType | 'none';
      }
    });
    
    cluster.dominantMood = dominantMood;
    clusters.push(cluster);
  });

  return clusters;
}

// Generate CSS conic-gradient for mood distribution pie chart
export function getMoodDistributionGradient(distribution: Record<MoodType | 'none', number>): string {
  const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);
  
  if (total === 0) return '#cccccc';

  const segments: string[] = [];
  let currentAngle = 0;

  Object.entries(distribution).forEach(([mood, count]) => {
    const percentage = (count / total) * 100;
    const angle = currentAngle + (percentage * 3.6); // Convert to degrees
    
    let color = '#cccccc'; // default for 'none'
    if (mood !== 'none') {
      const moodData = getMoodById(mood as MoodType);
      color = moodData.colors.primary;
    }

    segments.push(`${color} ${currentAngle}deg ${angle}deg`);
    currentAngle = angle;
  });

  return `conic-gradient(${segments.join(', ')})`;
}

// Create cluster marker HTML
export function createClusterHTML(cluster: ClusterData): string {
  const sizeClass = cluster.count < 10 ? 'small' : cluster.count < 50 ? 'medium' : 'large';
  const gradient = getMoodDistributionGradient(cluster.moodDistribution);
  
  // Use dominant mood color as fallback if no mood distribution
  let backgroundColor = '#6b7280'; // gray fallback
  if (cluster.dominantMood !== 'none') {
    const moodData = getMoodById(cluster.dominantMood as MoodType);
    backgroundColor = moodData.colors.gradient;
  }

  return `
<div class="mood-cluster mood-cluster-${sizeClass} mood-cluster-pie" 
     style="--mood-distribution: ${gradient}; background: ${backgroundColor};"
     data-cluster-count="${cluster.count}">
  <div class="mood-cluster-count">${cluster.count}</div>
</div>
`;
}