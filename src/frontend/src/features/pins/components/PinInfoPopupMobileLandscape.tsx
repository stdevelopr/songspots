import React from 'react';
import MusicEmbed from '../../common/MusicEmbed';
import ActionButton from './ActionButton';
import { Pin } from '../../map/types/map';

interface PinInfoPopupMobileLandscapeProps {
  pin: Pin;
  onViewProfile: (userId: string | null) => void;
  onEdit?: (pin: Pin) => void;
  onDelete?: (pin: Pin) => void;
  onClose?: () => void;
  showTimestamp?: boolean;
}

const PinInfoPopupMobileLandscape: React.FC<PinInfoPopupMobileLandscapeProps> = ({
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
    <div className="w-[95vw] max-w-2xl rounded-2xl bg-white/20 shadow-xl backdrop-blur-md border border-white/20 flex flex-col max-h-[90vh] animate-fade-in">
      {/* Header */}
      <div className="h-12 w-full relative rounded-t-2xl flex items-center justify-between px-5 py-3 bg-gradient-to-r from-white/30 via-white/20 to-white/10 border-b border-white/30 flex-shrink-0">
        <h3 className="text-base font-semibold text-gray-900 truncate flex-1 pr-3">
          {pin.name || 'Unnamed Memory'}
        </h3>
        {onClose && (
          <button
            className="cursor-pointer bg-white text-gray-700 hover:bg-gray-50 transition-all duration-200 rounded-full w-8 h-8 flex items-center justify-center shadow-md border border-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-0 flex-shrink-0 ml-3"
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

      {/* Main Content Area - Horizontal Layout */}
      <div className="flex-1 overflow-hidden">
        {hasMedia || hasDescription ? (
          <div className="h-full flex">
            {/* Music Embed Side */}
            {hasMedia && (
              <div className={`${hasDescription ? 'w-3/5' : 'w-full'} p-4 border-r border-gray-100/50 flex items-center justify-center bg-white/5`}>
                <div className="w-full max-w-md">
                  <MusicEmbed musicLink={pin.musicLink!} />
                </div>
              </div>
            )}

            {/* Description Side */}
            {hasDescription && (
              <div className={`${hasMedia ? 'w-2/5' : 'w-full'} p-4 overflow-y-auto`}>
                <div className="bg-white/20 rounded-xl p-4 border border-white/30 h-full min-h-0">
                  <h4 className="text-xs font-semibold text-gray-800 mb-3 uppercase tracking-wider opacity-75">
                    Description
                  </h4>
                  <div className="overflow-y-auto h-full">
                    <p className="text-sm text-gray-700 leading-relaxed break-words">
                      {pin.description}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Empty State */
          <div className="p-6 flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <svg className="w-10 h-10 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <p className="text-sm">This memory doesn't have any additional content</p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Actions Bar */}
      <div className="px-4 py-3 border-t border-white/20 bg-white/10 backdrop-blur-sm rounded-b-2xl flex-shrink-0">
        <div className="flex items-center justify-between gap-3">
          {/* View Profile Button */}
          <button
            type="button"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-500/90 text-white font-medium py-2.5 px-4 hover:bg-indigo-600/90 active:bg-indigo-700/90 transition-all duration-200 border border-indigo-400/50 shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
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

          {/* Owner Action Buttons */}
          {/* Temporarily always show for debugging */}
          {(pin.isOwner || true) && (
            <div className="flex gap-2">
              {onEdit && (
                <ActionButton
                  type="edit"
                  onClick={() => onEdit(pin)}
                  ariaLabel="Edit pin"
                  title="Edit"
                  className="shrink-0 w-10 h-10 rounded-lg"
                />
              )}
              {onDelete && (
                <ActionButton
                  type="delete"
                  onClick={() => onDelete(pin)}
                  ariaLabel="Delete pin"
                  title="Delete"
                  className="shrink-0 w-10 h-10 rounded-lg"
                />
              )}
            </div>
          )}

          {/* Timestamp */}
          {showTimestamp && pin.timestamp && (
            <div className="flex-shrink-0">
              <span className="text-xs font-medium text-gray-600 bg-white/20 px-3 py-1.5 rounded-full border border-white/20">
                {new Date(pin.timestamp).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PinInfoPopupMobileLandscape;