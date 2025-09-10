import React from 'react';
import { haptics } from '../../utils/haptics';

export interface FloatingActionButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  label?: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  className?: string;
  style?: React.CSSProperties;
  badge?: number | string;
  loading?: boolean;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon,
  onClick,
  label,
  disabled = false,
  variant = 'primary',
  size = 'medium',
  position = 'bottom-right',
  className = '',
  style,
  badge,
  loading = false,
}) => {
  const sizeClasses = {
    small: 'w-12 h-12',
    medium: 'w-14 h-14', 
    large: 'w-16 h-16',
  };

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4 bottom-safe right-safe',
    'bottom-left': 'bottom-4 left-4 bottom-safe left-safe',
    'top-right': 'top-4 right-4 top-safe right-safe',
    'top-left': 'top-4 left-4 top-safe left-safe',
  };

  const variantClasses = {
    primary: 'fab fab-primary',
    secondary: 'fab fab-secondary',
  };

  const handleClick = () => {
    if (!disabled && !loading) {
      haptics.buttonPress(); // Haptic feedback on button press
      onClick();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || loading}
      className={`
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${positionClasses[position]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      style={style}
      aria-label={label}
      title={label}
    >
      {/* Loading spinner */}
      {loading ? (
        <div className="animate-spin rounded-full border-2 border-current border-t-transparent w-5 h-5" />
      ) : (
        <>
          {/* Icon */}
          <div className="flex items-center justify-center">
            {icon}
          </div>
          
          {/* Badge */}
          {badge && !loading && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
              {typeof badge === 'number' && badge > 99 ? '99+' : badge}
            </div>
          )}
        </>
      )}
    </button>
  );
};

// Extended FAB with label (for secondary actions)
export interface ExtendedFABProps extends Omit<FloatingActionButtonProps, 'size'> {
  expanded?: boolean;
}

export const ExtendedFAB: React.FC<ExtendedFABProps> = ({
  icon,
  label,
  expanded = false,
  className = '',
  ...props
}) => {
  return (
    <button
      type="button"
      onClick={props.onClick}
      disabled={props.disabled || props.loading}
      className={`
        fab
        ${props.variant === 'secondary' ? 'fab-secondary' : 'fab-primary'}
        ${expanded ? 'px-4 py-3 rounded-full' : 'w-14 h-14'}
        transition-all duration-300
        ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      style={{
        position: 'fixed',
        ...props.style,
      }}
      aria-label={label}
      title={label}
    >
      <div className="flex items-center gap-2">
        {/* Icon */}
        <div className="flex-shrink-0">
          {props.loading ? (
            <div className="animate-spin rounded-full border-2 border-current border-t-transparent w-5 h-5" />
          ) : (
            icon
          )}
        </div>
        
        {/* Label (when expanded) */}
        {expanded && label && !props.loading && (
          <span className="text-sm font-medium whitespace-nowrap">
            {label}
          </span>
        )}
      </div>
      
      {/* Badge */}
      {props.badge && !props.loading && (
        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
          {typeof props.badge === 'number' && props.badge > 99 ? '99+' : props.badge}
        </div>
      )}
    </button>
  );
};

// FAB Group for multiple related actions
export interface FABGroupProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  spacing?: number;
  className?: string;
}

export const FABGroup: React.FC<FABGroupProps> = ({
  children,
  direction = 'up',
  spacing = 16,
  className = '',
}) => {
  const directionStyles = {
    up: 'flex-col-reverse',
    down: 'flex-col',
    left: 'flex-row-reverse',
    right: 'flex-row',
  };

  return (
    <div
      className={`fixed flex ${directionStyles[direction]} ${className}`}
      style={{
        gap: `${spacing}px`,
      }}
    >
      {children}
    </div>
  );
};

export default FloatingActionButton;