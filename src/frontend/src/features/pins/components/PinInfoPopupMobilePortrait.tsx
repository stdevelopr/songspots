import React from 'react';
import MusicEmbed from '../../common/MusicEmbed';
import ActionButton from './ActionButton';
import { Pin } from '../../map/types/map';

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
  const hasMedia = Boolean(pin.musicLink);
  const hasDescription = Boolean((pin.description || '').trim());

  return (
    <div className="w-[95vw] max-w-sm rounded-2xl bg-white/20 shadow-xl backdrop-blur-md border border-white/20 flex flex-col max-h-[85vh] overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="h-14 w-full relative rounded-t-2xl flex items-center justify-between px-4 py-3 bg-gradient-to-r from-white/30 via-white/20 to-white/10 border-b border-white/30 flex-shrink-0">
        <h3 className="text-base font-semibold text-gray-900 truncate flex-1 pr-2">
          {pin.name || 'Unnamed Memory'}
        </h3>
        {onClose && (
          <button
            className="cursor-pointer bg-white text-gray-700 hover:bg-gray-50 transition-all duration-200 rounded-full w-8 h-8 flex items-center justify-center shadow-md border border-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-0 flex-shrink-0 ml-2"
            onClick={onClose}
            aria-label="Close"
            title="Close"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
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

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Description */}
        {hasDescription && (
          <div className="px-4 py-3 border-b border-gray-100/50">
            <div className="bg-white/20 rounded-lg p-3 border border-white/30">
              <p className="text-sm text-gray-700 leading-relaxed break-words line-clamp-6">
                {pin.description}
              </p>
            </div>
          </div>
        )}

        {/* Music Embed */}
        {hasMedia && (
          <div className="px-4 py-3 border-b border-gray-100/50">
            <div className="scale-[0.98] origin-center transform">
              <MusicEmbed musicLink={pin.musicLink!} />
            </div>
          </div>
        )}

        {/* Empty state for no content */}
        {!hasMedia && !hasDescription && (
          <div className="px-4 py-8 text-center">
            <div className="text-gray-500 text-sm">
              <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <p>This memory doesn't have any additional details</p>
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom Actions */}
      <div className="px-4 py-4 bg-white/10 backdrop-blur-sm rounded-b-2xl border-t border-white/20 flex-shrink-0">
        {/* Primary Action - View Profile */}
        <button
          type="button"
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500/90 text-white font-semibold py-3 px-4 hover:bg-indigo-600/90 active:bg-indigo-700/90 transition-all duration-200 border border-indigo-400/50 shadow-lg mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
          onClick={() => {
            if (pin.isOwner) {
              onViewProfile(null);
            } else {
              onViewProfile(pin.owner.toString());
            }
          }}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-sm">
            {pin.isOwner ? 'My Profile' : 'View Profile'}
          </span>
        </button>

        {/* Owner Actions */}
        {/* Temporarily always show for debugging */}
        {(pin.isOwner || true) && (
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
        {showTimestamp && pin.timestamp && (
          <div className="mt-3 pt-3 border-t border-white/10">
            <div className="text-center">
              <span className="text-xs font-medium text-gray-600 bg-white/20 px-3 py-1 rounded-full">
                {new Date(pin.timestamp).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PinInfoPopupMobilePortrait;