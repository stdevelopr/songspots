import React from 'react';
import { LocationDisplay } from '../../../../common';

interface InfoGridProps {
  latitude: string | number;
  longitude: string | number;
  formatDate: () => string;
}

const InfoGrid: React.FC<InfoGridProps> = ({ latitude, longitude, formatDate }) => {
  return (
    <div className="flex gap-3 mb-3">
      <div className="flex-1 bg-white/80 rounded-md p-2 border border-gray-100 transition-all duration-300">
        <span className="font-semibold text-gray-700 text-xs flex items-center mb-1 transition-colors duration-300">
          <svg className="w-3 h-3 mr-1 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Location
        </span>
        <div className="text-[10px] text-gray-600 transition-colors duration-300">
          <LocationDisplay latitude={String(latitude)} longitude={String(longitude)} showIcon={false} />
        </div>
      </div>

      <div className="flex-1 bg-white/80 rounded-md p-2 border border-gray-100 transition-all duration-300">
        <span className="font-semibold text-gray-700 text-xs flex items-center mb-1 transition-colors duration-300">
          <svg className="w-3 h-3 mr-1 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Created
        </span>
        <p className="text-[10px] text-gray-600 transition-colors duration-300">{formatDate()}</p>
      </div>
    </div>
  );
};

export default InfoGrid;
