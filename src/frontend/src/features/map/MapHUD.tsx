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
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1001]">
          <button
            onClick={onMyLocation}
            disabled={isRefreshing || status === 'unavailable'}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg shadow-lg font-medium text-sm transition-all duration-200 ${isRefreshing ? 'bg-blue-100 text-blue-600 cursor-not-allowed' : status === 'unavailable' ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-xl active:scale-95'}`}
          >
            {isRefreshing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>Finding Location...</span>
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

      {status === 'requesting' && !isLoadingTransition && !isInitialLoading && (
        <div className="absolute top-20 left-4 bg-blue-50 border border-blue-200 rounded-lg shadow-lg px-4 py-2 z-[1000]">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-blue-700">{statusMsg}</span>
          </div>
        </div>
      )}

      {(status === 'denied' || status === 'unavailable') &&
        !isLoadingTransition &&
        !isInitialLoading && (
          <div className="absolute top-20 left-4 bg-yellow-50 border border-yellow-200 rounded-lg shadow-lg px-4 py-2 z-[1000]">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 text-yellow-600">⚠️</div>
              <span className="text-sm text-yellow-700">{statusMsg}</span>
            </div>
          </div>
        )}

      {showCounts && !isLoadingTransition && !isInitialLoading && (
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg px-4 py-2 z-[1000]">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">
                {publicCount} public pin{publicCount !== 1 ? 's' : ''}
              </span>
            </div>
            {hasIdentity && privateCount > 0 && (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">
                  {privateCount} private pin{privateCount !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {userLocation && status === 'granted' && !isLoadingTransition && !isInitialLoading && (
        <div className="absolute bottom-20 right-4 bg-blue-50 border border-blue-200 rounded-lg shadow-lg px-4 py-2 z-[1000]">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-blue-700">Your location</span>
          </div>
        </div>
      )}

      {!hasIdentity && !isLoadingTransition && !isInitialLoading && (
        <div className="absolute bottom-20 left-4 bg-yellow-50 border border-yellow-200 rounded-lg shadow-lg px-4 py-2 z-[1000]">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 text-yellow-600">ℹ️</div>
            <span className="text-sm text-yellow-700">
              Log in to create pins and see your private pins
            </span>
          </div>
        </div>
      )}
    </>
  );
};
