import React from 'react';
import MusicEmbed from '../../common/MusicEmbed';
import LocationDisplay from '../../common/LocationDisplay';

interface PinGridProps {
  pin: any;
  index: number;
  isViewingOwnProfile: boolean;
  onEdit: (pin: any) => void;
  onDelete: (pin: any) => void;
  onViewOnMap: (pin: any) => void;
  formatDate: () => string;
  getProfileAccentColor: () => string;
  spotRef: (el: HTMLDivElement | null) => void;
}

const PinGrid: React.FC<PinGridProps> = ({
  pin,
  index,
  isViewingOwnProfile,
  onEdit,
  onDelete,
  onViewOnMap,
  formatDate,
  getProfileAccentColor,
  spotRef,
}) => {
  return (
    <div
      key={pin.id.toString()}
      ref={spotRef}
      data-pin-id={pin.id.toString()}
      className="w-full rounded-2xl p-5 border border-gray-100 bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 transform hover:scale-[1.02] group min-h-[220px]"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Video first */}
      {pin.musicLink && (
        <div className="mb-4">
          <div className="w-full aspect-video">
            <MusicEmbed musicLink={pin.musicLink} />
          </div>
        </div>
      )}
      
      {/* Title and description after video */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 tracking-tight">
              {pin.name || 'Unnamed Memory'}
            </h3>
            {isViewingOwnProfile && (
              <>
                {pin.isPrivate ? (
                  <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 ring-1 ring-slate-200">
                    <span>🔒</span>
                    <span>Private</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200">
                    <span>🌍</span>
                    <span>Public</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        {isViewingOwnProfile && (
          <div className="ml-4 flex gap-2">
            <button
              onClick={() => onEdit(pin)}
              className="px-2.5 py-2 text-blue-700 bg-blue-50/60 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
              title="Edit memory"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
            <button
              onClick={() => onDelete(pin)}
              className="px-2.5 py-2 text-red-700 bg-red-50/60 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
              title="Delete memory"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
      
      {pin.description && (
        <div className="mb-4">
          <p className="text-gray-700 text-sm leading-relaxed bg-white/60 rounded-lg p-3 border border-gray-100">
            {pin.description}
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-[inset_0_1px_0_0_rgba(0,0,0,0.02)]">
          <span className="font-semibold text-gray-700 flex items-center mb-1">
            Location
          </span>
          <div className="text-[11px] text-gray-600">
            <LocationDisplay
              latitude={pin.latitude}
              longitude={pin.longitude}
              showIcon={false}
            />
          </div>
        </div>
        <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-[inset_0_1px_0_0_rgba(0,0,0,0.02)]">
          <span className="font-semibold text-gray-700 flex items-center mb-1">
            <svg
              className="w-4 h-4 mr-2"
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
          <p className="text-[11px] text-gray-600">{formatDate()}</p>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100">
        <button
          onClick={() => onViewOnMap(pin)}
          className={`text-${getProfileAccentColor()}-700 hover:text-${getProfileAccentColor()}-800 text-sm font-medium flex items-center gap-2 bg-${getProfileAccentColor()}-50/70 hover:bg-${getProfileAccentColor()}-100 px-4 py-2 rounded-lg border border-${getProfileAccentColor()}-100 transition-all`}
        >
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
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span>View on Map</span>
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
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default PinGrid;