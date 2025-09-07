import React from 'react';

interface StatusIndicatorProps {
  isFocused?: boolean;
  isHighlighted?: boolean;
  size?: 'sm' | 'md';
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ isFocused, isHighlighted, size = 'md' }) => {
  const base = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
  const color = isFocused ? 'bg-red-500' : isHighlighted ? 'bg-yellow-400' : 'bg-blue-500';
  const textColor = isFocused ? 'text-red-600' : isHighlighted ? 'text-yellow-600' : 'text-blue-600';

  return (
    <div className="flex items-center gap-2">
      <div
        className={`${base} rounded-full border${size === 'md' ? '-2' : ''} border-white shadow-sm transition-all duration-300 ${color}`}
        style={isFocused ? { animation: 'smooth-pulse 2s ease-in-out infinite' } : {}}
      />
      <span className={`text-xs font-medium transition-colors duration-300 ${textColor}`}>
        {isFocused ? 'Focused' : isHighlighted ? 'Click to focus' : 'Click to highlight'}
      </span>
    </div>
  );
};

export default StatusIndicator;

