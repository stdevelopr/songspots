import React from 'react';
import { Pin } from '../../../map/types/map';
import { usePinDisplay } from '../../hooks';
import { Header, MusicBlock, DescriptionBlock, ProfileButton, TimestampBadge, ActionButton } from '../shared';

interface PinInfoPopupMobilePortraitProps {
  pin: Pin;
  onViewProfile: (userId: string | null) => void;
  onEdit?: (pin: Pin) => void;
  onDelete?: (pin: Pin) => void;
  onClose?: () => void;
  showTimestamp?: boolean;
}

const PinInfoPopupMobilePortrait: React.FC<PinInfoPopupMobilePortraitProps> = ({
  pin,
  onViewProfile,
  onEdit,
  onDelete,
  onClose,
  showTimestamp = true,
}) => {
  const display = usePinDisplay(pin, { showTimestamp });

  return (
    <div className="w-[95vw] max-w-sm rounded-2xl bg-white/20 shadow-xl backdrop-blur-md border border-white/20 flex flex-col max-h-[85vh] overflow-hidden animate-fade-in">
      <Header title={display.title} onClose={onClose} size="sm" />

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Description */}
        {display.hasDescription && <DescriptionBlock size="sm" text={display.description} />}

        {/* Music Embed */}
        {display.hasMedia && (
          <div className="px-4 py-3 border-b border-gray-100/50">
            <div className="scale-[0.98] origin-center transform">
              <MusicBlock musicLink={display.musicLink} />
            </div>
          </div>
        )}

        {/* Empty state for no content */}
        {!display.hasMedia && !display.hasDescription && (
          <div className="px-4 py-8 text-center">
            <div className="text-gray-500 text-sm">
              <svg
                className="w-8 h-8 mx-auto mb-2 opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              <p>This memory doesn't have any additional details</p>
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom Actions */}
      <div className="px-4 py-4 bg-white/10 backdrop-blur-sm rounded-b-2xl border-t border-white/20 flex-shrink-0">
        {/* Primary Action - View Profile */}
        {display.showProfileButton && (
          <ProfileButton className="mb-3" fullWidth label={display.profileButton.label} onClick={() => onViewProfile(display.profileButton.userId)} />
        )}

        {/* Owner Actions */}
        {display.canEdit && (onEdit || onDelete) && (
          <div className="flex gap-2 justify-center">
            {onEdit && (
              <ActionButton
                type="edit"
                onClick={() => onEdit(pin)}
                ariaLabel="Edit pin"
                title="Edit"
                className="shrink-0 w-11 h-11 rounded-xl"
              />
            )}
            {onDelete && (
              <ActionButton
                type="delete"
                onClick={() => onDelete(pin)}
                ariaLabel="Delete pin"
                title="Delete"
                className="shrink-0 w-11 h-11 rounded-xl"
              />
            )}
          </div>
        )}

        {/* Timestamp */}
        {display.hasTimestamp && <TimestampBadge date={display.timestampDate} />}
      </div>
    </div>
  );
};

export default PinInfoPopupMobilePortrait;
