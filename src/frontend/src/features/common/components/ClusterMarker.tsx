import React from 'react';
import { getMoodById } from '../types/moods';
import type { ClusterData } from '../utils/clustering';
import type { MoodType } from '../types/moods';
import styles from './ClusterMarker.module.css';

interface ClusterMarkerProps {
  cluster: ClusterData;
}

const ClusterMarker: React.FC<ClusterMarkerProps> = ({ cluster }) => {
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
    },
  };

  if (isHomogeneous) {
    // Homogeneous cluster - show mood emoji with count
    const moodData = getMoodById(cluster.clusterMood as MoodType);
    
    return (
      <div
        className={`${styles['mood-cluster']} ${styles[`mood-cluster-${sizeClass}`]} ${styles['mood-cluster-emoji']}`}
        {...commonProps}
      >
        <div className={styles['mood-cluster-emoji-main']}>{moodData.emoji}</div>
        <div className={styles['mood-cluster-count-badge']}>{cluster.count}</div>
      </div>
    );
  } else {
    // Mixed cluster - use blended background with number
    return (
      <div
        className={`${styles['mood-cluster']} ${styles[`mood-cluster-${sizeClass}`]} ${styles['mood-cluster-mixed']}`}
        {...commonProps}
      >
        <div className={styles['mood-cluster-count']}>{cluster.count}</div>
      </div>
    );
  }
};

export default ClusterMarker;
