import React from 'react';
import { LocationStatus, UserLocation } from './types/map';

interface Props {
  status: LocationStatus;
  userLocation: UserLocation | null;
  showCounts: boolean;
  publicCount: number;
  privateCount: number;
  hasIdentity: boolean;
  onMyLocation: () => void;
  isRefreshing: boolean;
  isLoadingTransition: boolean;
  isInitialLoading: boolean;
}

export const MapHUD: React.FC<Props> = ({
  status,
  userLocation,
  showCounts,
  publicCount,
  privateCount,
  hasIdentity,
  onMyLocation,
  isRefreshing,
  isLoadingTransition,
  isInitialLoading,
}) => {
  const statusMsg =
    status === 'requesting'
      ? 'Requesting your location...'
      : status === 'granted'
        ? userLocation
          ? 'Location found! Map centered on your position.'
          : ''
        : status === 'denied'
          ? 'Location access denied. Using default map view.'
          : status === 'unavailable'
            ? 'Geolocation not supported. Using default map view.'
            : '';

  return (
    <>
      {!isLoadingTransition && !isInitialLoading && (
        <div className="absolute bottom-4 right-4 z-[1001]">
          <button
            onClick={onMyLocation}
            disabled={isRefreshing || status === 'unavailable'}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg shadow-lg font-medium text-sm transition-all duration-200 bg-blue-600 text-white hover:bg-blue-700 hover:shadow-xl active:scale-95 ${isRefreshing || status === 'unavailable' ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isRefreshing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>Finding location...</span>
              </>
            ) : status === 'unavailable' ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <span>Location unavailable</span>
              </>
            ) : status === 'denied' ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <span>Location denied</span>
              </>
            ) : userLocation && status === 'granted' ? (
              <>
                <div className="w-3 h-3 bg-white rounded-full animate-pulse border border-blue-500"></div>
                <span>Your location</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <span>My Location</span>
              </>
            )}
          </button>
        </div>
      )}
    </>
  );
};
