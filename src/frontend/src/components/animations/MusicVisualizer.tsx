import React from 'react';

interface MusicVisualizerProps {
  isPlaying: boolean;
  variant?: 'bars' | 'pulse' | 'wave';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const MusicVisualizer: React.FC<MusicVisualizerProps> = ({
  isPlaying,
  variant = 'bars',
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const barHeights = {
    sm: ['h-1', 'h-2', 'h-1.5'],
    md: ['h-2', 'h-4', 'h-3'],
    lg: ['h-3', 'h-6', 'h-4'],
  };

  if (variant === 'bars') {
    return (
      <div className={`${sizeClasses[size]} ${className} ${isPlaying ? 'vibe-animate-music' : ''} flex items-end justify-center gap-0.5`}>
        <div className={`bar-1 ${barHeights[size][0]} w-0.5 bg-current rounded-t-full`} />
        <div className={`bar-2 ${barHeights[size][1]} w-0.5 bg-current rounded-t-full`} />
        <div className={`bar-3 ${barHeights[size][2]} w-0.5 bg-current rounded-t-full`} />
        <div className={`bar-1 ${barHeights[size][0]} w-0.5 bg-current rounded-t-full`} />
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={`${sizeClasses[size]} ${className} ${isPlaying ? 'vibe-animate-pulse-glow' : ''} flex items-center justify-center`}>
        <div className="w-3 h-3 bg-current rounded-full" />
      </div>
    );
  }

  if (variant === 'wave') {
    return (
      <div className={`${sizeClasses[size]} ${className} ${isPlaying ? 'vibe-animate-breathe' : ''} flex items-center justify-center`}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-full h-full"
        >
          <path
            d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 7V9C15 11.8 13.54 14.23 11.5 15.47V18.5C11.5 19.33 10.83 20 10 20S8.5 19.33 8.5 18.5V15.47C6.46 14.23 5 11.8 5 9V7L3 7V9C3 12.53 5.61 15.42 9 15.92V18.5C9 20.43 10.57 22 12.5 22S16 20.43 16 18.5V15.92C19.39 15.42 22 12.53 22 9Z"
            fill="currentColor"
            opacity={isPlaying ? 0.8 : 0.4}
          />
        </svg>
      </div>
    );
  }

  return null;
};

export default MusicVisualizer;