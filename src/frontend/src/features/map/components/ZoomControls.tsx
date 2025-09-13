import React from 'react';
import type L from 'leaflet';

interface ZoomControlsProps {
  map: L.Map | null;
  className?: string;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({ map, className = '' }) => {
  const handleZoomIn = () => {
    if (!map) return;
    map.zoomIn();
  };
  const handleZoomOut = () => {
    if (!map) return;
    map.zoomOut();
  };

  return (
    <div className={`fixed bottom-24 right-4 pb-safe pr-safe flex flex-col gap-2 z-[500] ${className}`}>
      <button
        type="button"
        onClick={handleZoomIn}
        className="w-12 h-12 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center hover:shadow-lg active:scale-95 transition-all"
        aria-label="Zoom in"
        title="Zoom in"
      >
        <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
      <button
        type="button"
        onClick={handleZoomOut}
        className="w-12 h-12 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center hover:shadow-lg active:scale-95 transition-all"
        aria-label="Zoom out"
        title="Zoom out"
      >
        <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      </button>
    </div>
  );
};

export default ZoomControls;

