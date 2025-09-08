import React from 'react';
import { MoodType, getMoodById } from '../../../common/types/moods';

interface MoodTagProps {
  mood: MoodType;
  size?: 'sm' | 'md';
  variant?: 'banner' | 'inline';
  className?: string;
}

const MoodTag: React.FC<MoodTagProps> = ({ 
  mood, 
  size = 'md', 
  variant = 'banner',
  className = '' 
}) => {
  const moodData = getMoodById(mood);
  const isSmall = size === 'sm';

  if (variant === 'banner') {
    return (
      <div 
        className={`w-full flex items-center justify-center px-4 py-2 bg-white/10 border-b border-white/20 ${className}`}
        style={{ 
          background: `linear-gradient(90deg, ${moodData.colors.primary}15 0%, ${moodData.colors.secondary}15 100%)` 
        }}
      >
        <div className="flex items-center gap-2">
          <div 
            className={`rounded-full flex items-center justify-center flex-shrink-0 ${isSmall ? 'w-5 h-5 text-xs' : 'w-6 h-6 text-sm'}`}
            style={{ background: moodData.colors.gradient }}
          >
            {moodData.emoji}
          </div>
          <span className={`font-medium text-gray-800 ${isSmall ? 'text-sm' : 'text-base'}`}>
            {moodData.name}
          </span>
          <span className={`text-gray-600 ${isSmall ? 'text-xs' : 'text-sm'}`}>
            • {moodData.description}
          </span>
        </div>
      </div>
    );
  }

  // Inline variant (original design)
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 border border-white/30 shadow-sm ${className}`}>
      <div 
        className="w-4 h-4 rounded-full flex items-center justify-center text-xs flex-shrink-0"
        style={{ background: moodData.colors.gradient }}
      >
        {moodData.emoji}
      </div>
      <span className="text-sm font-medium text-gray-800">{moodData.name}</span>
      <span className="text-xs text-gray-600">• {moodData.description}</span>
    </div>
  );
};

export default MoodTag;