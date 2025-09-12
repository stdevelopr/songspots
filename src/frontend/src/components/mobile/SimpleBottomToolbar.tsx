import React from 'react';

interface SimpleToolbarProps {
  children: React.ReactNode;
  className?: string;
}

export const SimpleBottomToolbar: React.FC<SimpleToolbarProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`
      fixed bottom-0 left-0 right-0 
      bg-white border-t border-gray-200
      px-4 py-2
      pb-[calc(0.5rem+env(safe-area-inset-bottom))]
      flex items-center justify-around gap-4
      z-[9999]
      shadow-lg
      ${className}
    `}>
      {children}
    </div>
  );
};

interface ToolbarButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  badge?: number;
  variant?: 'primary' | 'secondary';
}

export const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  icon,
  label,
  onClick,
  onLongPress,
  disabled = false,
  loading = false,
  badge,
  variant = 'secondary'
}) => {
  const longPressTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const [isLongPressing, setIsLongPressing] = React.useState(false);

  const handleTouchStart = () => {
    if (!onLongPress || disabled || loading) return;
    
    longPressTimerRef.current = setTimeout(() => {
      setIsLongPressing(true);
      onLongPress();
      // Add haptic feedback if available
      if (navigator.vibrate) navigator.vibrate(50);
    }, 800); // 800ms for long press
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    
    if (!isLongPressing && !disabled && !loading) {
      onClick();
    }
    
    setIsLongPressing(false);
  };

  const handleTouchCancel = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    setIsLongPressing(false);
  };
  return (
    <button
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchCancel}
      disabled={disabled || loading}
      className={`
        relative flex flex-col items-center justify-center
        min-w-[60px] py-2 px-3 rounded-lg
        transition-all duration-200 ease-out
        ${disabled 
          ? 'opacity-50 cursor-not-allowed' 
          : 'active:scale-95 hover:bg-gray-50'
        }
        ${variant === 'primary' 
          ? 'text-blue-600' 
          : 'text-gray-600'
        }
      `}
      aria-label={label}
    >
      {/* Icon */}
      <div className="relative mb-0.5">
        {loading ? (
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-current border-t-transparent" />
        ) : (
          icon
        )}
        
        {/* Badge */}
        {badge && !loading && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
            <span className="font-medium text-[10px]">
              {badge > 99 ? '99+' : badge}
            </span>
          </div>
        )}
      </div>
      
      {/* Label */}
      <span className="text-[10px] font-medium leading-none">
        {label}
      </span>
    </button>
  );
};

export default SimpleBottomToolbar;