import React, { useCallback, useState } from 'react';
import { getMoodById } from '../types/moods';
import type { ClusterData } from '../utils/clustering';
import type { MoodType } from '../types/moods';
import styles from './ClusterMarker.module.css';

interface ClusterMarkerProps {
  cluster: ClusterData;
  onClick?: (cluster: ClusterData) => void;
  isSelected?: boolean;
  isLoading?: boolean;
  className?: string;
}

const ClusterMarker: React.FC<ClusterMarkerProps> = ({
  cluster,
  onClick,
  isSelected = false,
  isLoading = false,
  className,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const sizeClass = cluster.count < 10 ? 'small' : cluster.count < 50 ? 'medium' : 'large';

  // Keyboard and click handlers
  const handleClick = useCallback(() => {
    onClick?.(cluster);
  }, [onClick, cluster]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setIsPressed(true);
        handleClick();
      }
    },
    [handleClick]
  );

  const handleKeyUp = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      setIsPressed(false);
    }
  }, []);

  // Check if cluster is homogeneous (single mood type, excluding 'none')
  const moodsWithCount = Object.entries(cluster.moodDistribution).filter(
    ([mood, count]) => count > 0 && mood !== 'none'
  );
  const isHomogeneous = moodsWithCount.length === 1 && cluster.clusterMood !== 'none';

  // Add confidence indicator through opacity/border
  const confidenceAlpha = Math.max(0.7, cluster.moodConfidence); // Minimum 70% opacity
  const borderStyle =
    cluster.moodConfidence > 0.6 ? 'solid' : cluster.moodConfidence > 0.3 ? 'dashed' : 'dotted';

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
    // Accessibility improvements
    'aria-label': tooltipText,
    'aria-pressed': isSelected,
    'aria-describedby': `cluster-${cluster.lat}-${cluster.lng}-description`,
    role: 'button',
    tabIndex: 0,
    onClick: handleClick,
    onKeyDown: handleKeyDown,
    onKeyUp: handleKeyUp,
    className: [
      styles.cluster,
      styles[sizeClass],
      isSelected && styles.selected,
      isLoading && styles.loading,
      isPressed && styles.pressed,
      className,
    ]
      .filter(Boolean)
      .join(' '),
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
      <div {...commonProps} className={`${commonProps.className} ${styles.emoji}`}>
        <div className={styles.emojiMain}>{moodData.emoji}</div>
        <div className={styles.countBadge}>{cluster.count}</div>
      </div>
    );
  } else {
    // Mixed cluster - use blended background with number
    return (
      <div {...commonProps}>
        <div className={styles.count}>{cluster.count}</div>
      </div>
    );
  }
};

export default ClusterMarker;
