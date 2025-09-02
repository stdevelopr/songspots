import React, { useState } from 'react';
import type { Pin as BackendPin } from '../../backend/backend.did';

interface ProfileMapProps {
  backendPins: BackendPin[];
  className?: string;
  style?: React.CSSProperties;
  expandedHeight?: string;
}

export const ProfileMap: React.FC<ProfileMapProps> = ({
  backendPins,
  className = '',
  style,
  expandedHeight = '400px', // Default height, can be overridden
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const collapsedHeight = '64px';

  return (
    <div
      className={`profile-map bg-white/95 backdrop-blur-sm border border-gray-100 shadow-sm rounded-2xl overflow-hidden transition-all duration-300 ease-in-out ${className}`}
      style={{
        ...style,
        height: isCollapsed ? collapsedHeight : expandedHeight,
        position: 'sticky',
        top: '0',
        zIndex: 10,
      }}
    >
      {isCollapsed ? (
        <div
          className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 text-white rounded-2xl shadow cursor-pointer border border-blue-400"
          style={{ borderRadius: '1rem' }}
          onClick={toggleCollapse}
        >
          <span className="font-semibold text-base pl-2">Show Map</span>
          <button
            onClick={toggleCollapse}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors border border-white/20"
            title="Expand map"
            style={{ marginLeft: '0.5rem' }}
          >
            <svg
              className="w-5 h-5 transform rotate-180 transition-transform duration-300"
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
          </button>
        </div>
      ) : (
        <div className="flex justify-end p-2">
          <button
            onClick={toggleCollapse}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            title="Collapse map"
          >
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
                d="M5 15l7-7 7 7"
              />
            </svg>
          </button>
        </div>
      )}
      {/* Map rendering goes here */}
    </div>
  );
};
