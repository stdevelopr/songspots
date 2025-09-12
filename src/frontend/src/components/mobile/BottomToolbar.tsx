import React from 'react';
import { haptics } from '../../utils/haptics';
import { LocationStatus, UserLocation } from '@features/map/types/map';

interface ToolbarAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  badge?: number | string;
  variant?: 'primary' | 'secondary';
}

interface BottomToolbarProps {
  actions: ToolbarAction[];
  className?: string;
}

export const BottomToolbar: React.FC<BottomToolbarProps> = ({ 
  actions, 
  className = '' 
}) => {
  const handleActionClick = (action: ToolbarAction) => {
    if (!action.disabled && !action.loading) {
      haptics.buttonPress();
      action.onClick();
    }
  };

  return (
    <div className={`
      fixed bottom-0 left-0 right-0 
      bg-white/95 backdrop-blur-sm border-t border-gray-200
      px-4 pb-safe pt-3
      flex items-center justify-around
      z-50
      ${className}
    `}>
      {actions.map((action) => (
        <button
          key={action.id}
          onClick={() => handleActionClick(action)}
          disabled={action.disabled || action.loading}
          className={`
            relative flex flex-col items-center justify-center
            min-w-[60px] py-2 px-3 rounded-lg
            transition-all duration-200 ease-out
            ${action.disabled 
              ? 'opacity-50 cursor-not-allowed' 
              : 'active:scale-95 hover:bg-gray-50'
            }
            ${action.variant === 'primary' 
              ? 'text-blue-600' 
              : 'text-gray-600'
            }
          `}
          aria-label={action.label}
          title={action.label}
        >
          {/* Icon container */}
          <div className="relative mb-1">
            {action.loading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-current border-t-transparent" />
            ) : (
              action.icon
            )}
            
            {/* Badge */}
            {action.badge && !action.loading && (
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                <span className="font-medium text-[10px]">
                  {typeof action.badge === 'number' && action.badge > 99 ? '99+' : action.badge}
                </span>
              </div>
            )}
          </div>
          
          {/* Label */}
          <span className="text-xs font-medium leading-none">
            {action.label}
          </span>
        </button>
      ))}
    </div>
  );
};

// Map-specific toolbar component
interface MapBottomToolbarProps {
  // Location controls
  status: LocationStatus;
  userLocation: UserLocation | null;
  onMyLocation: () => void;
  isRefreshing: boolean;
  
  // Map actions
  onCreate?: () => void;
  onFilter: () => void;
  
  // Counts and states
  pinCount?: number;
  filterCount?: number;
  hasIdentity: boolean;
  
  // Loading states
  isLoadingTransition?: boolean;
  isInitialLoading?: boolean;
}

export const MapBottomToolbar: React.FC<MapBottomToolbarProps> = ({
  status,
  userLocation,
  onMyLocation,
  isRefreshing,
  onCreate,
  onFilter,
  pinCount = 0,
  filterCount = 0,
  hasIdentity,
  isLoadingTransition = false,
  isInitialLoading = false,
}) => {
  // Don't show during loading
  if (isLoadingTransition || isInitialLoading) {
    return null;
  }

  const getLocationIcon = () => {
    if (status === 'unavailable') {
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18 18M5.636 5.636L6 6" />
        </svg>
      );
    }

    if (status === 'denied') {
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      );
    }

    if (userLocation && status === 'granted') {
      return (
        <div className="relative">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-white" />
        </div>
      );
    }

    return (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    );
  };

  const actions: ToolbarAction[] = [
    // Filter action (always show if there are pins)
    ...(pinCount > 0 ? [{
      id: 'filter',
      label: 'Filters',
      icon: (
        <div className="relative">
          <span className="text-2xl">🎭</span>
          {filterCount > 0 && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </div>
      ),
      onClick: onFilter,
      badge: filterCount > 0 ? filterCount : undefined,
      variant: filterCount > 0 ? 'primary' as const : 'secondary' as const,
    }] : []),
    
    // Location action
    {
      id: 'location',
      label: isRefreshing ? 'Finding...' : 'Location',
      icon: getLocationIcon(),
      onClick: onMyLocation,
      loading: isRefreshing,
      disabled: status === 'unavailable',
      variant: (userLocation && status === 'granted') ? 'primary' as const : 'secondary' as const,
    },
    
    // Create action (only if user has identity)
    ...(onCreate && hasIdentity ? [{
      id: 'create',
      label: 'Add Spot',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      onClick: onCreate,
      variant: 'primary' as const,
    }] : []),
    
    // Spots count (informational, only show if there are spots)
    ...(pinCount > 0 ? [{
      id: 'spots',
      label: `${pinCount} ${pinCount === 1 ? 'Spot' : 'Spots'}`,
      icon: (
        <div className="text-center">
          <div className="text-lg font-bold leading-none">{pinCount}</div>
        </div>
      ),
      onClick: () => {}, // Could open a spots list modal
      disabled: true, // Just informational
      variant: 'secondary' as const,
    }] : []),
  ];

  return <BottomToolbar actions={actions} />;
};

export default BottomToolbar;