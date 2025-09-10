import React from 'react';

export interface MobileHeaderProps {
  title?: string;
  subtitle?: string;
  leftAction?: {
    icon: React.ReactNode;
    onClick: () => void;
    label: string;
  };
  rightAction?: {
    icon: React.ReactNode;
    onClick: () => void;
    label: string;
  };
  showPinCount?: boolean;
  pinCount?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  title = 'Vibes Map',
  subtitle,
  leftAction,
  rightAction,
  showPinCount = false,
  pinCount = 0,
  className = '',
  style,
}) => {
  return (
    <header
      className={`
        bg-white border-b border-gray-200 px-4 py-3 pt-safe
        flex items-center justify-between
        ${className}
      `}
      style={style}
    >
      {/* Left side */}
      <div className="flex items-center flex-1">
        {leftAction ? (
          <button
            onClick={leftAction.onClick}
            className="touch-target flex items-center justify-center mr-3 p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label={leftAction.label}
            title={leftAction.label}
          >
            {leftAction.icon}
          </button>
        ) : (
          <div className="w-10" /> // Spacer for alignment
        )}
        
        <div className="flex-1 min-w-0">
          <h1 className="text-mobile-lg font-semibold text-gray-900 truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-mobile-sm text-gray-500 truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Center - Pin count (optional) */}
      {showPinCount && (
        <div className="flex-shrink-0 mx-3">
          <div className="bg-gray-100 rounded-full px-3 py-1">
            <span className="text-mobile-sm font-medium text-gray-700">
              {pinCount} {pinCount === 1 ? 'spot' : 'spots'}
            </span>
          </div>
        </div>
      )}

      {/* Right side */}
      <div className="flex items-center flex-1 justify-end">
        {rightAction ? (
          <button
            onClick={rightAction.onClick}
            className="touch-target flex items-center justify-center ml-3 p-2 -mr-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label={rightAction.label}
            title={rightAction.label}
          >
            {rightAction.icon}
          </button>
        ) : (
          <div className="w-10" /> // Spacer for alignment
        )}
      </div>
    </header>
  );
};

// Compact version for minimal space usage
export interface CompactMobileHeaderProps {
  title?: string;
  pinCount?: number;
  onMenuClick?: () => void;
  className?: string;
}

export const CompactMobileHeader: React.FC<CompactMobileHeaderProps> = ({
  title = 'Vibes',
  pinCount,
  onMenuClick,
  className = '',
}) => {
  return (
    <header
      className={`
        bg-white/95 backdrop-blur-sm border-b border-gray-200/50 px-4 py-2 pt-safe
        flex items-center justify-between
        ${className}
      `}
    >
      {/* Menu button */}
      {onMenuClick && (
        <button
          onClick={onMenuClick}
          className="touch-target-small flex items-center justify-center p-1 rounded-md hover:bg-gray-100 transition-colors"
          aria-label="Menu"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      {/* Title and count */}
      <div className="flex items-center gap-2">
        <h1 className="text-mobile-base font-medium text-gray-900">
          {title}
        </h1>
        {typeof pinCount === 'number' && (
          <div className="bg-gray-100 rounded-full px-2 py-0.5">
            <span className="text-mobile-xs font-medium text-gray-600">
              {pinCount}
            </span>
          </div>
        )}
      </div>

      {/* Spacer for balance */}
      <div className="w-8" />
    </header>
  );
};

export default MobileHeader;