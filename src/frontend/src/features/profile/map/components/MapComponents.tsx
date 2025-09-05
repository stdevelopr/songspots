import React from 'react';

export const MapLoadingOverlay: React.FC = () => (
  <div 
    className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-2xl flex items-center justify-center"
    style={{ zIndex: 1000 }}
  >
    <div className="flex flex-col items-center space-y-3">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      <span className="text-sm text-gray-600">Loading map...</span>
    </div>
  </div>
);

interface CollapseButtonProps {
  onClick: () => void;
  isCollapsed: boolean;
}

export const CollapseButton: React.FC<CollapseButtonProps> = ({ onClick, isCollapsed }) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    onClick();
  };

  if (isCollapsed) {
    return (
      <button
        onClick={handleClick}
        className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors border border-white/20"
        title="Expand map"
        style={{ marginLeft: '0.5rem' }}
      >
        <ChevronDownIcon />
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className="absolute top-3 right-3 p-2 rounded-lg bg-white/95 hover:bg-white shadow-lg border border-gray-200 transition-all duration-200"
      title="Collapse map"
      style={{ 
        zIndex: 1000,
        pointerEvents: 'auto'
      }}
    >
      <ChevronUpIcon />
    </button>
  );
};

const ChevronUpIcon: React.FC = () => (
  <svg
    className="w-5 h-5 text-gray-700 transition-transform duration-300"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 15l7-7 7 7"
    />
  </svg>
);

const ChevronDownIcon: React.FC = () => (
  <svg
    className="w-5 h-5 transition-transform duration-300"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 9l-7 7-7-7"
    />
  </svg>
);

interface MapCollapsedViewProps {
  onToggleCollapse: () => void;
}

export const MapCollapsedView: React.FC<MapCollapsedViewProps> = ({ onToggleCollapse }) => (
  <div
    className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 text-white rounded-2xl shadow cursor-pointer border border-blue-400"
    style={{ borderRadius: '1rem' }}
    onClick={onToggleCollapse}
  >
    <span className="font-semibold text-base pl-2">Show Map</span>
    <CollapseButton onClick={onToggleCollapse} isCollapsed={true} />
  </div>
);

interface ShowAllButtonProps {
  onClick: () => void;
}

export const ShowAllButton: React.FC<ShowAllButtonProps> = ({ onClick }) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      className="absolute bottom-3 left-3 px-3 py-2 rounded-lg bg-white/95 hover:bg-white shadow-lg border border-gray-200 transition-all duration-200 text-sm font-medium text-gray-700 hover:text-gray-900"
      title="Show all pins"
      style={{ 
        zIndex: 1000,
        pointerEvents: 'auto'
      }}
    >
      <div className="flex items-center gap-1.5">
        <ShowAllIcon />
        <span>Show All</span>
      </div>
    </button>
  );
};

const ShowAllIcon: React.FC = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
    />
  </svg>
);