import React from 'react';
import { useReverseGeocode } from '../hooks/useGeocoding';

interface LocationDisplayProps {
  latitude: string;
  longitude: string;
  showIcon?: boolean;
  className?: string;
  presetAddress?: string;
}

const LocationDisplay: React.FC<LocationDisplayProps> = ({
  latitude,
  longitude,
  showIcon = true,
  className = '',
  presetAddress,
}) => {
  const { address, isLoading, error } = useReverseGeocode(latitude, longitude, presetAddress);

  // Fallback coordinates display
  const fallbackCoords = `${parseFloat(latitude).toFixed(4)}, ${parseFloat(longitude).toFixed(4)}`;

  if (isLoading) {
    return (
      <div className={`flex items-start gap-2 min-w-0 max-w-full overflow-hidden ${className}`}>
        {showIcon && (
          <svg
            className="w-4 h-4 text-gray-400 animate-pulse flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
          </svg>
        )}
        <span className="text-gray-500 animate-pulse line-clamp-2 break-words block">Loading address...</span>
      </div>
    );
  }

  const titleText = address || `${latitude}, ${longitude}`;
  return (
    <div className={`flex items-start gap-2 min-w-0 max-w-full overflow-hidden ${className}`} title={titleText}>
      {showIcon && (
        <svg
          className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
        </svg>
      )}
      <span className="line-clamp-2 break-words block">{address || fallbackCoords}</span>
    </div>
  );
};

export default LocationDisplay;
