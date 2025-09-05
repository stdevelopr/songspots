import React, { useEffect, useRef } from 'react';
import MusicEmbed from '../../../common/MusicEmbed';
import LocationDisplay from '../../../common/LocationDisplay';

interface Spot {
  id: bigint;
  name: string;
  description?: string;
  musicLink?: string;
  isPrivate: boolean;
  latitude: string;
  longitude: string;
}

interface ProfileSpotListProps {
  spots: Spot[];
  isViewingOwnProfile: boolean;
  isLoading: boolean;
  onEdit: (spot: Spot) => void;
  onDelete: (spot: Spot) => void;
  onMouseEnter?: (spot: Spot) => void;
  onMouseLeave?: () => void;
  selectedPinId?: string | null;
  focusedPinId?: string | null;
  onPinClick?: (pinId: string, onRestoreBounds?: () => void) => void;
}

const ProfileSpotList: React.FC<ProfileSpotListProps> = ({
  spots,
  isViewingOwnProfile,
  isLoading,
  onEdit,
  onDelete,
  onMouseEnter,
  onMouseLeave,
  selectedPinId,
  focusedPinId,
  onPinClick,
}) => {
  const spotRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Scroll to selected pin when selectedPinId changes
  useEffect(() => {
    if (selectedPinId && spotRefs.current[selectedPinId]) {
      const element = spotRefs.current[selectedPinId];
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });
        
        // Add temporary highlight effect
        element.style.transform = 'scale(1.02)';
        element.style.boxShadow = '0 8px 32px rgba(59, 130, 246, 0.3)';
        element.style.borderColor = 'rgb(59, 130, 246)';
        
        // Remove highlight after animation
        setTimeout(() => {
          if (element) {
            element.style.transform = '';
            element.style.boxShadow = '';
            element.style.borderColor = '';
          }
        }, 2000);
      }
    }
  }, [selectedPinId]);
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="animate-pulse bg-white/90 rounded-2xl border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="h-5 w-40 bg-gray-200 rounded" />
              <div className="h-6 w-16 bg-gray-200 rounded-full" />
            </div>
            <div className="h-4 w-full bg-gray-100 rounded mb-2" />
            <div className="h-4 w-2/3 bg-gray-100 rounded mb-4" />
            <div className="h-8 w-28 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    );
  }
  if (spots.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No spots yet</h3>
        <p className="text-gray-700 mb-4">
          {isViewingOwnProfile ? 'Start creating spots by clicking on the map!' : 'No spots yet.'}
        </p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-4 items-center">
      {spots
        .slice()
        .sort((a, b) => Number(b.id) - Number(a.id))
        .map((spot) => (
          <div
            key={spot.id.toString()}
            ref={(el) => (spotRefs.current[spot.id.toString()] = el)}
            data-pin-id={spot.id.toString()}
            className="w-full bg-white/95 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 border border-gray-100 p-4 flex flex-col gap-2"
            onMouseEnter={() => onMouseEnter?.(spot)}
            onMouseLeave={() => onMouseLeave?.()}
            onClick={() => onPinClick?.(spot.id.toString())}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center min-w-0 gap-2 flex-1">
                  <h3
                    className="text-lg font-semibold text-gray-900 truncate overflow-hidden whitespace-nowrap min-w-0 flex-1 max-w-[45vw]"
                    title={spot.name || 'Unnamed Spot'}
                  >
                    {spot.name || 'Unnamed Spot'}
                  </h3>
                </div>
              </div>
              
              {/* Top right indicators */}
              <div className="flex flex-col gap-1 items-end">
                {/* Map marker action indicator */}
                <div className="flex items-center gap-2">
                  {/* Simple circular marker matching map colors */}
                  <div className={`w-3 h-3 rounded-full border border-white shadow-sm transition-all duration-300 ${
                    focusedPinId === spot.id.toString()
                      ? 'bg-red-500' 
                      : selectedPinId === spot.id.toString()
                        ? 'bg-yellow-400' 
                        : 'bg-blue-500'
                  }`} style={focusedPinId === spot.id.toString() ? { animation: 'smooth-pulse 2s ease-in-out infinite' } : {}}></div>
                  
                  {/* Action text */}
                  <span className={`text-xs font-medium transition-colors duration-300 ${
                    focusedPinId === spot.id.toString()
                      ? 'text-red-600'
                      : selectedPinId === spot.id.toString()
                        ? 'text-yellow-600'
                        : 'text-blue-600'
                  }`}>
                    {focusedPinId === spot.id.toString() 
                      ? 'Focused' 
                      : selectedPinId === spot.id.toString() 
                        ? 'Click to focus' 
                        : 'Click to highlight'}
                  </span>
                </div>
                
                {/* Privacy badge for own profile */}
                {isViewingOwnProfile && (
                  <div>
                    {spot.isPrivate ? (
                      <span className="flex-shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 ring-1 ring-slate-200">
                        🔒 Private
                      </span>
                    ) : (
                      <span className="flex-shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 ring-1 ring-emerald-200">
                        🌍 Public
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {isViewingOwnProfile && (
              <div className="flex gap-2 mt-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(spot);
                  }}
                  className="text-indigo-700 bg-indigo-50/60 hover:bg-indigo-100 border border-indigo-200 text-sm px-2.5 py-1 rounded-md"
                >
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(spot);
                  }}
                  className="text-red-700 bg-red-50/60 hover:bg-red-100 border border-red-200 text-sm px-2.5 py-1 rounded-md"
                >
                  Delete
                </button>
              </div>
            )}
            {spot.description && (
              <p className="text-gray-700 text-sm leading-relaxed bg-white/60 rounded-lg p-3 border border-gray-100">
                {spot.description}
              </p>
            )}
            {spot.musicLink && (
              <div className="mb-3 bg-white/60 rounded-lg p-3 border border-gray-100 flex justify-center">
                <div className="w-full aspect-video">
                  <MusicEmbed musicLink={spot.musicLink} />
                </div>
              </div>
            )}
            <div className="text-xs text-gray-500">
              <LocationDisplay
                latitude={spot.latitude}
                longitude={spot.longitude}
                showIcon={true}
                className="text-gray-500"
              />
            </div>
          </div>
        ))}
    </div>
  );
};

export default ProfileSpotList;
