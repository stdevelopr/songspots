import React from 'react';
import { MoodType, getMoodById } from '../types/moods';
import type { Pin, Vibe } from '../../map/types/map';
import ClusterMarker from '../components/ClusterMarker';
import { renderComponentToHTMLSync, renderComponentToHTML } from './renderToHTML';

export interface ClusterData {
  lat: number;
  lng: number;
  count: number;
  items: (Pin | Vibe)[];
  moodDistribution: Record<MoodType | 'none', number>;
  dominantMood: MoodType | 'none';
  clusterMood: MoodType | 'none'; // The overall "feeling" of the cluster
  moodConfidence: number; // How confident we are about the cluster mood (0-1)
  moodBlend: string; // CSS gradient representing the cluster feeling
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

// Calculate the overall "feeling" of a cluster based on mood distribution
function calculateClusterMood(distribution: Record<MoodType | 'none', number>): {
  clusterMood: MoodType | 'none';
  confidence: number;
  blend: string;
} {
  const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);
  const moodsWithCount = Object.entries(distribution).filter(([mood, count]) => count > 0 && mood !== 'none') as [MoodType, number][];
  
  if (moodsWithCount.length === 0) {
    return { clusterMood: 'none', confidence: 0, blend: '#cccccc' };
  }

  // Calculate percentages
  const moodPercentages = moodsWithCount.map(([mood, count]) => ({
    mood,
    percentage: count / total,
    count
  }));

  // Sort by percentage (highest first)
  moodPercentages.sort((a, b) => b.percentage - a.percentage);

  // Calculate confidence based on how dominant the top mood is
  const topMood = moodPercentages[0];
  const confidence = topMood.percentage;

  // If one mood is very dominant (>60%), use it as cluster mood
  if (confidence > 0.6) {
    const moodData = getMoodById(topMood.mood);
    return {
      clusterMood: topMood.mood,
      confidence,
      blend: moodData.colors.gradient
    };
  }

  // If there are multiple significant moods, blend the top 2-3
  const significantMoods = moodPercentages.filter(m => m.percentage >= 0.15);
  
  if (significantMoods.length === 1) {
    const moodData = getMoodById(significantMoods[0].mood);
    return {
      clusterMood: significantMoods[0].mood,
      confidence: significantMoods[0].percentage,
      blend: moodData.colors.gradient
    };
  }

  // Create a blended mood representation
  const primaryMood = significantMoods[0];
  const secondaryMood = significantMoods[1];
  
  const primaryData = getMoodById(primaryMood.mood);
  const secondaryData = getMoodById(secondaryMood.mood);
  
  // Create a gradient blend weighted by the percentages
  const primaryWeight = primaryMood.percentage / (primaryMood.percentage + secondaryMood.percentage);
  const secondaryWeight = 1 - primaryWeight;
  
  const blendGradient = `linear-gradient(135deg, 
    ${primaryData.colors.primary} 0%, 
    ${primaryData.colors.secondary} ${primaryWeight * 50}%, 
    ${secondaryData.colors.primary} ${50 + secondaryWeight * 25}%, 
    ${secondaryData.colors.secondary} 100%)`;

  return {
    clusterMood: primaryMood.mood,
    confidence: confidence,
    blend: blendGradient
  };
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
      moodDistribution: {
        energetic: 0,
        chill: 0,
        creative: 0,
        romantic: 0,
        peaceful: 0,
        party: 0,
        mysterious: 0,
        none: 0
      },
      dominantMood: 'none',
      clusterMood: 'none',
      moodConfidence: 0,
      moodBlend: '#cccccc',
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
    
    // Calculate the overall cluster mood and visual representation
    const moodAnalysis = calculateClusterMood(cluster.moodDistribution);
    cluster.clusterMood = moodAnalysis.clusterMood;
    cluster.moodConfidence = moodAnalysis.confidence;
    cluster.moodBlend = moodAnalysis.blend;
    
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

// HTML element creation helper (fallback for when React rendering fails)
function createHTMLElement(tag: string, props: Record<string, any>, children?: string): string {
  const attributes = Object.entries(props)
    .map(([key, value]) => {
      if (key === 'style' && typeof value === 'object') {
        const styleStr = Object.entries(value)
          .map(([prop, val]) => `${prop.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${val}`)
          .join('; ');
        return `style="${styleStr}"`;
      }
      if (key === 'className') {
        return `class="${value}"`;
      }
      return `${key}="${value}"`;
    })
    .join(' ');
  
  return `<${tag} ${attributes}>${children || ''}</${tag}>`;
}

// Fallback HTML generation function
function createClusterHTMLFallback(cluster: ClusterData): string {
  const sizeClass = cluster.count < 10 ? 'small' : cluster.count < 50 ? 'medium' : 'large';
  
  // Check if cluster is homogeneous (single mood type, excluding 'none')
  const moodsWithCount = Object.entries(cluster.moodDistribution).filter(([mood, count]) => count > 0 && mood !== 'none');
  const isHomogeneous = moodsWithCount.length === 1 && cluster.clusterMood !== 'none';
  
  // Add confidence indicator through opacity/border
  const confidenceAlpha = Math.max(0.7, cluster.moodConfidence); // Minimum 70% opacity
  const borderStyle = cluster.moodConfidence > 0.6 ? 'solid' : cluster.moodConfidence > 0.3 ? 'dashed' : 'dotted';
  
  // Create compact mood breakdown for tooltip - each mood on its own line
  const moodBreakdown = moodsWithCount
    .sort(([, a], [, b]) => b - a) // Sort by count descending
    .map(([mood, count]) => {
      const moodData = getMoodById(mood as MoodType);
      const percentage = Math.round((count / cluster.count) * 100);
      return `${moodData.emoji} ${moodData.name} ${percentage}% (${count})`;
    });
  
  // Add 'none' moods if any
  if (cluster.moodDistribution.none > 0) {
    const percentage = Math.round((cluster.moodDistribution.none / cluster.count) * 100);
    moodBreakdown.push(`🎯 ${percentage}% (${cluster.moodDistribution.none})`);
  }
  
  const tooltipText = isHomogeneous 
    ? `${cluster.count} ${getMoodById(cluster.clusterMood as MoodType).name} vibes`
    : `${cluster.count} vibes:\n${moodBreakdown.join('\n')}`;

  const commonProps = {
    'data-cluster-count': cluster.count,
    'data-mood': cluster.clusterMood,
    'data-breakdown': moodBreakdown.join(' | '),
    'data-tooltip': tooltipText,
    style: {
      background: cluster.moodBlend,
      opacity: confidenceAlpha,
      borderStyle: borderStyle,
    }
  };

  if (isHomogeneous) {
    // Homogeneous cluster - show mood emoji with count
    const moodData = getMoodById(cluster.clusterMood as MoodType);
    
    const emojiMain = createHTMLElement('div', { className: 'mood-cluster-emoji-main' }, moodData.emoji);
    const countBadge = createHTMLElement('div', { className: 'mood-cluster-count-badge' }, cluster.count.toString());
    
    return createHTMLElement('div', {
      className: `mood-cluster mood-cluster-${sizeClass} mood-cluster-emoji`,
      ...commonProps
    }, emojiMain + countBadge);
  } else {
    // Mixed cluster - use blended background with number
    const countElement = createHTMLElement('div', { className: 'mood-cluster-count' }, cluster.count.toString());
    
    return createHTMLElement('div', {
      className: `mood-cluster mood-cluster-${sizeClass} mood-cluster-mixed`,
      ...commonProps
    }, countElement);
  }
}

// Create cluster marker HTML using TSX component with fallback
export function createClusterHTML(cluster: ClusterData): string {
  try {
    const component = React.createElement(ClusterMarker, { cluster });
    const html = renderComponentToHTMLSync(component);
    
    // If React rendering worked and produced HTML, use it
    if (html && html.trim().length > 0) {
      return html;
    }
  } catch (error) {
    console.warn('React rendering failed, using fallback:', error);
  }
  
  // Fallback to direct HTML generation
  return createClusterHTMLFallback(cluster);
}

// Async version for cases where we can wait for rendering
export async function createClusterHTMLAsync(cluster: ClusterData): Promise<string> {
  const component = React.createElement(ClusterMarker, { cluster });
  return renderComponentToHTML(component);
}