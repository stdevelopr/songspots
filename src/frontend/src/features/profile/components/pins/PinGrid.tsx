import React from 'react';
import MusicEmbed from '../../../common/MusicEmbed';
import LocationDisplay from '../../../common/LocationDisplay';

interface PinGridProps {
  pin: any;
  index: number;
  isViewingOwnProfile: boolean;
  onEdit: (pin: any) => void;
  onDelete: (pin: any) => void;
  formatDate: () => string;
  spotRef: (el: HTMLDivElement | null) => void;
  onPinClick?: (pinId: string) => void;
  isHighlighted?: boolean;
  isFocused?: boolean;
}

const PinGrid: React.FC<PinGridProps> = ({
  pin,
  index,
  isViewingOwnProfile,
  onEdit,
  onDelete,
  formatDate,
  spotRef,
  onPinClick,
  isHighlighted,
  isFocused,
}) => {
  return (
    <div
      key={pin.id.toString()}
      ref={spotRef}
      data-pin-id={pin.id.toString()}
      className="max-w-4xl mx-auto rounded-xl p-4 border border-gray-100 bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 transform group cursor-pointer relative"
      style={{ animationDelay: `${index * 100}ms` }}
      onClick={() => onPinClick?.(pin.id.toString())}
    >
      {/* Desktop horizontal layout */}
      <div className={`flex gap-4 ${pin.musicLink ? 'h-56' : 'h-auto'} min-w-0`}>
        {/* Left side: Video */}
        {pin.musicLink && (
          <div className="flex-shrink-0 w-80 h-56">
            <div className="w-full h-full rounded-lg overflow-hidden transition-all duration-300">
              <MusicEmbed musicLink={pin.musicLink} />
            </div>
          </div>
        )}

        {/* Right side: Content */}
        <div
          className={`flex-1 flex flex-col justify-between ${pin.musicLink ? 'h-56' : 'h-auto'} min-w-0`}
        >
          {/* Header with title and action indicator */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 tracking-tight truncate mb-1">
                {pin.name || 'Unnamed Memory'}
              </h3>
              {pin.description && (
                <p className="text-gray-700 text-sm leading-relaxed line-clamp-3 break-words overflow-hidden">
                  {pin.description}
                </p>
              )}
            </div>
            <div className="flex-shrink-0 ml-3 flex flex-col gap-2 items-end">
              {/* Map marker action indicator */}
              <div className="flex items-center gap-2">
                {/* Simple circular marker matching map colors */}
                <div
                  className={`w-4 h-4 rounded-full border-2 border-white shadow-sm transition-all duration-300 ${
                    isFocused ? 'bg-red-500' : isHighlighted ? 'bg-yellow-400' : 'bg-blue-500'
                  }`}
                  style={isFocused ? { animation: 'smooth-pulse 2s ease-in-out infinite' } : {}}
                ></div>

                {/* Action text */}
                <span
                  className={`text-xs font-medium transition-colors duration-300 ${
                    isFocused ? 'text-red-600' : isHighlighted ? 'text-yellow-600' : 'text-blue-600'
                  }`}
                >
                  {isFocused ? 'Focused' : isHighlighted ? 'Click to focus' : 'Click to highlight'}
                </span>
              </div>
              {/* Privacy badge for own profile */}
              {isViewingOwnProfile &&
                (() => {
                  const isPrivate = pin.isPrivate;
                  const badgeClasses = `flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm shadow-sm border ${
                    isPrivate
                      ? 'bg-amber-50/90 text-amber-800 border-amber-200/60'
                      : 'bg-emerald-50/90 text-emerald-800 border-emerald-200/60'
                  }`;
                  const icon = isPrivate ? '🔒' : '🌐';

                  return (
                    <div
                      className={badgeClasses}
                      title={
                        isPrivate ? 'Only you can see this memory' : 'Anyone can see this memory'
                      }
                    >
                      {icon}
                      <span className="leading-none">{isPrivate ? 'Private' : 'Public'}</span>
                    </div>
                  );
                })()}
            </div>
          </div>

          {/* Info grid */}
          <div className="flex gap-3 mb-3">
            <div className="flex-1 bg-white/80 rounded-md p-2 border border-gray-100 transition-all duration-300">
              <span className="font-semibold text-gray-700 text-xs flex items-center mb-1 transition-colors duration-300">
                <svg
                  className="w-3 h-3 mr-1 transition-colors duration-300"
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
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Location
              </span>
              <div className="text-[10px] text-gray-600 transition-colors duration-300">
                <LocationDisplay
                  latitude={pin.latitude}
                  longitude={pin.longitude}
                  showIcon={false}
                />
              </div>
            </div>
            <div className="flex-1 bg-white/80 rounded-md p-2 border border-gray-100 transition-all duration-300">
              <span className="font-semibold text-gray-700 text-xs flex items-center mb-1 transition-colors duration-300">
                <svg
                  className="w-3 h-3 mr-1 transition-colors duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Created
              </span>
              <p className="text-[10px] text-gray-600 transition-colors duration-300">
                {formatDate()}
              </p>
            </div>
          </div>

          {/* Actions Section */}
          {isViewingOwnProfile && (
            <div className="bg-gray-50/50 rounded-md p-2 border border-gray-100 transition-all duration-300">
              <div className="flex gap-2 items-center justify-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(pin);
                  }}
                  className="px-2 py-1 text-blue-700 bg-blue-50/60 hover:bg-blue-100 border border-blue-200 rounded transition-colors text-xs flex-1 justify-center flex items-center gap-1 cursor-pointer"
                  title="Edit memory"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  <span>Edit</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(pin);
                  }}
                  className="px-2 py-1 text-red-700 bg-red-50/60 hover:bg-red-100 border border-red-200 rounded transition-colors text-xs flex-1 justify-center flex items-center gap-1 cursor-pointer"
                  title="Delete memory"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  <span>Delete</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PinGrid;
