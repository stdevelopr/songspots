import React from 'react';
import { Pin } from '@features/map/types/map';
import { useVibeDisplay } from '../hooks';
import { Header, MusicBlock, DescriptionBlock, MoodTag, ProfileButton, TimestampRow, ActionButton } from './shared';

interface VibeInfoPopupDesktopProps {
  vibe: Pin;
  onViewProfile: (userId: string | null) => void;
  onEdit?: (vibe: Pin) => void;
  onDelete?: (vibe: Pin) => void;
  onClose?: () => void;
  showTimestamp?: boolean;
}

const VibeInfoPopupDesktop: React.FC<VibeInfoPopupDesktopProps> = ({
  vibe,
  onViewProfile,
  onEdit,
  onDelete,
  onClose,
  showTimestamp = true,
}) => {
  const display = useVibeDisplay(vibe, { showTimestamp });

  return (
    <div className={display.hasMedia ? 'w-[92vw] max-w-4xl rounded-2xl bg-white/20 shadow-2xl backdrop-blur-md border border-white/20 flex flex-col animate-fade-in' : 'w-auto max-w-2xl rounded-2xl bg-white/20 shadow-2xl backdrop-blur-md border border-white/20 flex flex-col animate-fade-in'}>
      <Header title={display.title} onClose={onClose} size="md" />

      {/* Always visible mood banner */}
      {display.hasMood && display.mood && (
        <MoodTag mood={display.mood} variant="banner" size="md" />
      )}

      {/* Content */}
      {(display.hasMedia || display.hasDescription) ? (
        <div className="p-8">
          {display.hasMedia ? (
            <div className={`grid ${display.hasDescription ? 'grid-cols-2' : 'grid-cols-1'} gap-8`}>
              <div className="flex items-center justify-center min-w-0">
                <div className="w-full">
                  <MusicBlock musicLink={display.musicLink} />
                </div>
              </div>
              {display.hasDescription && <DescriptionBlock text={display.description} />}
            </div>
          ) : (
            display.hasDescription && <DescriptionBlock className="max-w-2xl mx-auto" text={display.description} />
          )}
        </div>
      ) : display.hasMood ? (
        <div className="p-8">
          <div className="text-center text-gray-500 text-sm">
            <p>This vibe doesn't have any additional details</p>
          </div>
        </div>
      ) : null}

      {/* Actions Footer */}
      <div className="px-8 pb-8 pt-4 border-t border-white/20 bg-white/5 backdrop-blur-sm rounded-b-2xl">
        <div className="flex flex-col items-center gap-4">
          {/* View Profile Button */}
          {display.showProfileButton && (
            <ProfileButton label={display.profileButton.label} onClick={() => onViewProfile(display.profileButton.userId)} />
          )}

          {/* Owner Actions */}
          {display.canEdit && (
            <div className="flex items-center gap-4 justify-center">
              {onEdit && (
                <ActionButton
                  type="edit"
                  onClick={() => onEdit(vibe)}
                  ariaLabel="Edit vibe"
                  title="Edit Pin"
                  className="p-4 w-12 h-12"
                />
              )}
              {onDelete && (
                <ActionButton
                  type="delete"
                  onClick={() => onDelete(vibe)}
                  ariaLabel="Delete vibe"
                  title="Delete Pin"
                  className="p-4 w-12 h-12"
                />
              )}
            </div>
          )}
        </div>

        {/* Timestamp */}
        {display.hasTimestamp && <TimestampRow date={display.timestampDate} />}
      </div>
    </div>
  );
};

export default VibeInfoPopupDesktop;
