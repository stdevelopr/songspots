import React from 'react';
import { MusicEmbed } from '../../../common';
import StatusIndicator from './components/StatusIndicator';
import PrivacyBadge from './components/PrivacyBadge';
import SpotActions from './components/SpotActions';
import InfoGrid from './components/InfoGrid';

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
      <div className={`flex gap-4 ${pin.musicLink ? 'h-56' : 'h-auto'} min-w-0`}>
        {pin.musicLink && (
          <div className="flex-shrink-0 w-80 h-56">
            <div className="w-full h-full rounded-lg overflow-hidden transition-all duration-300">
              <MusicEmbed musicLink={pin.musicLink} />
            </div>
          </div>
        )}

        <div className={`flex-1 flex flex-col justify-between ${pin.musicLink ? 'h-56' : 'h-auto'} min-w-0`}>
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
              <StatusIndicator isFocused={isFocused} isHighlighted={isHighlighted} />
              {isViewingOwnProfile && <PrivacyBadge isPrivate={pin.isPrivate} />}
            </div>
          </div>

          <InfoGrid latitude={pin.latitude} longitude={pin.longitude} formatDate={formatDate} />

          {isViewingOwnProfile && (
            <SpotActions item={pin} onEdit={onEdit} onDelete={onDelete} />
          )}
        </div>
      </div>
    </div>
  );
};

export default PinGrid;
