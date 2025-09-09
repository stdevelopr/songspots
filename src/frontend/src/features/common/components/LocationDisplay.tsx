import React from 'react';
import { useReverseGeocode } from '../hooks/useGeocoding';

interface LocationDisplayProps {
  latitude: string;
  longitude: string;
  showIcon?: boolean;
  className?: string;
}

const LocationDisplay: React.FC<LocationDisplayProps> = ({
  latitude,
  longitude,
  showIcon = true,
  className = '',
}) => {
  const { address, isLoading, error } = useReverseGeocode(latitude, longitude);

  // Fallback coordinates display
  const fallbackCoords = `${parseFloat(latitude).toFixed(4)}, ${parseFloat(longitude).toFixed(4)}`;

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {showIcon && (
          <svg
            className="w-4 h-4 text-gray-400 animate-pulse"
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
        <span className="text-gray-500 animate-pulse">Loading address...</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`} title={`${latitude}, ${longitude}`}>
      {showIcon && (
        <svg
          className="w-4 h-4 text-gray-600"
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
      <span>{address || fallbackCoords}</span>
    </div>
  );
};

export default LocationDisplay;
