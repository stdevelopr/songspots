import React from 'react';
import MusicEmbed from '../../common/MusicEmbed';
import ActionButton from './ActionButton';
import { Pin } from '../../map/types/map';

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
  const hasMedia = Boolean(pin.musicLink);
  const hasDescription = Boolean((pin.description || '').trim());

  return (
    <div className={hasMedia 
      ? 'w-[92vw] max-w-4xl rounded-2xl bg-white/20 shadow-2xl backdrop-blur-md border border-white/20 flex flex-col animate-fade-in'
      : 'w-auto max-w-2xl rounded-2xl bg-white/20 shadow-2xl backdrop-blur-md border border-white/20 flex flex-col animate-fade-in'
    }>
      {/* Header */}
      <div className="h-12 w-full relative rounded-t-2xl flex items-center justify-between px-6 py-3 bg-gradient-to-r from-white/30 via-white/20 to-white/10 border-b border-white/30">
        <h3 className="text-lg font-semibold text-gray-900 truncate flex-1 pr-3">
          {pin.name || 'Unnamed Memory'}
        </h3>
        {onClose && (
          <button
            className="cursor-pointer bg-white text-gray-700 hover:bg-gray-50 transition-colors rounded-full w-9 h-9 flex items-center justify-center shadow-md border border-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-0 flex-shrink-0 ml-3"
            onClick={onClose}
            aria-label="Close"
            title="Close"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M6 6L18 18M6 18L18 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Content */}
      {(hasMedia || hasDescription) && (
        <div className="p-8">
          {hasMedia ? (
            <div className={`grid ${hasDescription ? 'grid-cols-2' : 'grid-cols-1'} gap-8`}>
              {/* Music Embed */}
              <div className="flex items-center justify-center min-w-0">
                <div className="w-full">
                  <MusicEmbed musicLink={pin.musicLink!} />
                </div>
              </div>
              
              {/* Description */}
              {hasDescription && (
                <div className="flex flex-col gap-4 overflow-auto min-h-0">
                  <div className="border border-gray-100 rounded-xl p-6 bg-white/30 shadow-sm">
                    <h4 className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wide">
                      Description
                    </h4>
                    <p className="text-base text-gray-700 leading-relaxed break-words">
                      {pin.description}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            hasDescription && (
              <div className="border border-gray-100 rounded-xl p-6 bg-white/30 shadow-sm max-w-2xl mx-auto">
                <h4 className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wide">
                  Description
                </h4>
                <p className="text-base text-gray-700 leading-relaxed break-words">
                  {pin.description}
                </p>
              </div>
            )
          )}
        </div>
      )}

      {/* Actions Footer */}
      <div className="px-8 pb-8 pt-4 border-t border-white/20 bg-white/5 backdrop-blur-sm rounded-b-2xl">
        <div className="flex items-center justify-between">
          {/* View Profile Button */}
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500/90 text-white font-semibold py-3 px-6 hover:bg-indigo-600/90 active:bg-indigo-700/90 transition-all duration-200 border border-indigo-400/50 shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
            onClick={() => {
              if (pin.isOwner) {
                onViewProfile(null);
              } else {
                onViewProfile(pin.owner.toString());
              }
            }}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-base">
              {pin.isOwner ? 'My Profile' : 'View Profile'}
            </span>
          </button>

          {/* Owner Actions */}
          {/* Temporarily always show for debugging */}
          {(pin.isOwner || true) && (
            <div className="flex items-center gap-4">
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
        {showTimestamp && pin.timestamp && (
          <div className="mt-6 pt-4 border-t border-white/10">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">
                Memory created
              </span>
              <span className="font-medium text-gray-700">
                {new Date(pin.timestamp).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PinInfoPopupDesktop;