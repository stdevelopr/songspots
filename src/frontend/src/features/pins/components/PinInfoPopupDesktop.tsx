import React from 'react';
import ActionButton from './ActionButton';
import { Pin } from '../../map/types/map';
import { usePinDisplay } from '../hooks';
import { Header, MusicBlock, DescriptionBlock, ProfileButton, TimestampRow } from '.';

interface PinInfoPopupDesktopProps {
  pin: Pin;
  onViewProfile: (userId: string | null) => void;
  onEdit?: (pin: Pin) => void;
  onDelete?: (pin: Pin) => void;
  onClose?: () => void;
  showTimestamp?: boolean;
}

const PinInfoPopupDesktop: React.FC<PinInfoPopupDesktopProps> = ({
  pin,
  onViewProfile,
  onEdit,
  onDelete,
  onClose,
  showTimestamp = true,
}) => {
  const display = usePinDisplay(pin, { showTimestamp });

  return (
    <div className={display.hasMedia ? 'w-[92vw] max-w-4xl rounded-2xl bg-white/20 shadow-2xl backdrop-blur-md border border-white/20 flex flex-col animate-fade-in' : 'w-auto max-w-2xl rounded-2xl bg-white/20 shadow-2xl backdrop-blur-md border border-white/20 flex flex-col animate-fade-in'}>
      <Header title={display.title} onClose={onClose} size="md" />

      {/* Content */}
      {(display.hasMedia || display.hasDescription) && (
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
      )}

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
                  onClick={() => onEdit(pin)}
                  ariaLabel="Edit pin"
                  title="Edit Pin"
                  className="p-4 w-12 h-12"
                />
              )}
              {onDelete && (
                <ActionButton
                  type="delete"
                  onClick={() => onDelete(pin)}
                  ariaLabel="Delete pin"
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

export default PinInfoPopupDesktop;
