import React from 'react';
import { MusicEmbed, LocationDisplay } from '@common';
import StatusIndicator from './StatusIndicator';
import PrivacyBadge from './PrivacyBadge';
import SpotActions from './SpotActions';
import { Spot } from '../types';

interface SpotCardProps {
  spot: Spot;
  isViewingOwnProfile: boolean;
  onEdit: (spot: Spot) => void;
  onDelete: (spot: Spot) => void;
  onMouseEnter?: (spot: Spot) => void;
  onMouseLeave?: () => void;
  onPinClick?: (pinId: string) => void;
  isHighlighted?: boolean;
  isFocused?: boolean;
  spotRef?: (el: HTMLDivElement | null) => void;
}

const SpotCard: React.FC<SpotCardProps> = ({
  spot,
  isViewingOwnProfile,
  onEdit,
  onDelete,
  onMouseEnter,
  onMouseLeave,
  onPinClick,
  isHighlighted,
  isFocused,
  spotRef,
}) => {
  return (
    <div
      key={spot.id.toString()}
      ref={spotRef}
      data-pin-id={spot.id.toString()}
      className="w-full bg-white/95 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-gray-100 p-4 flex flex-col gap-2 cursor-pointer"
      onMouseEnter={() => onMouseEnter?.(spot)}
      onMouseLeave={() => onMouseLeave?.()}
      onClick={() => onPinClick?.(spot.id.toString())}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center min-w-0 gap-2 flex-1">
            <h3
              className="text-lg font-semibold text-gray-900 truncate overflow-hidden whitespace-nowrap min-w-0 flex-1"
              title={spot.name || 'Unnamed Spot'}
            >
              {spot.name || 'Unnamed Spot'}
            </h3>
          </div>
        </div>
        <div className="flex flex-col gap-1 items-end">
          <StatusIndicator isFocused={isFocused} isHighlighted={isHighlighted} size="sm" />
          {isViewingOwnProfile && <PrivacyBadge isPrivate={spot.isPrivate} size="sm" />}
        </div>
      </div>

      {isViewingOwnProfile && (
        <SpotActions size="sm" item={spot} onEdit={onEdit} onDelete={onDelete} />
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
        <LocationDisplay latitude={spot.latitude} longitude={spot.longitude} showIcon={true} className="text-gray-500" />
      </div>
    </div>
  );
};

export default SpotCard;
