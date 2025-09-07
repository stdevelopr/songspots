import React, { useRef } from 'react';
import SpotCard from './components/SpotCard';
import { Spot } from './types';
import { useHighlightScroll } from './hooks/useHighlightScroll';

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
  useHighlightScroll(selectedPinId, spotRefs);

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
          <SpotCard
            key={spot.id.toString()}
            spot={spot}
            isViewingOwnProfile={isViewingOwnProfile}
            onEdit={onEdit}
            onDelete={onDelete}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            isHighlighted={selectedPinId === spot.id.toString()}
            isFocused={focusedPinId === spot.id.toString()}
            onPinClick={(pinId) => onPinClick?.(pinId)}
            spotRef={(el) => (spotRefs.current[spot.id.toString()] = el)}
          />
        ))}
    </div>
  );
};

export default ProfileSpotList;

