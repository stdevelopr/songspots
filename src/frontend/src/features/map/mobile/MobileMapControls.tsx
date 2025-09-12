import React from 'react';
import { SimpleBottomToolbar, ToolbarButton } from '../../../components/mobile/SimpleBottomToolbar';
import { LocationStatus, UserLocation } from '../types/map';

interface MobileMapControlsProps {
  // Location controls
  status: LocationStatus;
  userLocation: UserLocation | null;
  onMyLocation: () => void;
  onCreate?: () => void;
  isRefreshing: boolean;

  // Filter controls
  onFilter?: () => void;
  filterCount?: number;

  // User profile
  onProfile?: () => void;
  onLogin?: () => void;
  onLogout?: () => void;
  userInitials?: string;
  hasIdentity: boolean;

  // Loading states
  isLoadingTransition?: boolean;
  isInitialLoading?: boolean;
}

export const MobileMapControls: React.FC<MobileMapControlsProps> = ({
  status,
  userLocation,
  onMyLocation,
  onCreate,
  isRefreshing,
  onFilter,
  filterCount = 0,
  onProfile,
  onLogin,
  onLogout,
  userInitials,
  hasIdentity,
  isLoadingTransition = false,
  isInitialLoading = false,
}) => {
  // Show controls even during loading - only hide during true initial loading
  if (isInitialLoading && !userLocation) {
    return null;
  }

  const getLocationIcon = () => {
    if (status === 'unavailable') {
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18 18M5.636 5.636L6 6"
          />
        </svg>
      );
    }

    if (status === 'denied') {
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      );
    }

    if (userLocation && status === 'granted') {
      return (
        <div className="relative">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
          <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border border-white" />
        </div>
      );
    }

    return (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    );
  };

  const getLocationLabel = () => {
    if (status === 'unavailable') return 'Location unavailable';
    if (status === 'denied') return 'Location denied';
    if (userLocation && status === 'granted') return 'Your location';
    return 'Your location';
  };

  const isLocationDisabled = isRefreshing || status === 'unavailable' || status === 'requesting';

  return (
    <SimpleBottomToolbar>
      {/* Filter Button */}
      {onFilter && (
        <ToolbarButton
          icon={
            <div className="relative">
              <div className="w-6 h-6 flex items-center justify-center text-lg">🎭</div>
              {filterCount > 0 && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </div>
          }
          label="Filters"
          onClick={onFilter}
          badge={filterCount > 0 ? filterCount : undefined}
          variant={filterCount > 0 ? 'primary' : 'secondary'}
        />
      )}

      {/* Location Button - Always show */}
      <ToolbarButton
        icon={getLocationIcon()}
        label={getLocationLabel()}
        onClick={onMyLocation}
        disabled={isLocationDisabled}
        variant="primary"
      />

      {/* Create Vibe Button */}
      {onCreate && hasIdentity && (
        <ToolbarButton
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          }
          label="Drop Vibe"
          onClick={onCreate}
          variant="primary"
        />
      )}

      {/* Profile Button */}
      <ToolbarButton
        icon={
          hasIdentity ? (
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-medium">{userInitials || 'U'}</span>
            </div>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          )
        }
        label={hasIdentity ? 'Profile' : 'Sign In'}
        onClick={hasIdentity ? onProfile || (() => {}) : onLogin || (() => {})}
        onLongPress={hasIdentity && onLogout ? onLogout : undefined}
        variant="secondary"
      />
    </SimpleBottomToolbar>
  );
};

// Compact version for minimal space usage
interface CompactMobileMapControlsProps {
  onMyLocation: () => void;
  status: LocationStatus;
  isRefreshing: boolean;
  pinCount?: number;
}

export const CompactMobileMapControls: React.FC<CompactMobileMapControlsProps> = ({
  onMyLocation,
  status,
  isRefreshing,
  pinCount,
}) => {
  const isLocationDisabled = isRefreshing || status === 'unavailable';

  return (
    <div className="fixed bottom-4 right-4 pb-safe pr-safe flex flex-col gap-2">
      {/* Pin count badge */}
      {typeof pinCount === 'number' && pinCount > 0 && (
        <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-lg border border-gray-200">
          <span className="text-mobile-sm font-medium text-gray-700">
            {pinCount} {pinCount === 1 ? 'spot' : 'spots'}
          </span>
        </div>
      )}

      {/* Location button */}
      <button
        onClick={onMyLocation}
        disabled={isLocationDisabled}
        className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-lg disabled:opacity-50"
        aria-label="My Location"
      >
        {isRefreshing ? (
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
        ) : (
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        )}
      </button>
    </div>
  );
};

export default MobileMapControls;
