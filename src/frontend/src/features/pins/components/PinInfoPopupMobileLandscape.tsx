import React from 'react';
import MusicEmbed from '../../common/MusicEmbed';
import ActionButton from './ActionButton';
import { Pin } from '../../map/types/map';
import PinActionButton from '../PinActionButton';
import usePinDisplay from '../usePinDisplay';

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
  const display = usePinDisplay(pin, { showTimestamp });

  return (
    <div className="w-screen h-screen bg-white/20 backdrop-blur-md flex flex-col animate-fade-in overflow-hidden">
      {/* Header */}
      <div className="h-12 w-full flex items-center justify-between px-5 py-3 bg-gradient-to-r from-white/30 via-white/20 to-white/10 border-b border-white/30 flex-shrink-0">
        <h3 className="text-base font-semibold text-gray-900 truncate flex-1 pr-3">
          {display.title}
        </h3>
        {onClose && (
          <button
            className="cursor-pointer bg-white/80 text-gray-600 hover:bg-white transition-all duration-200 rounded-full w-7 h-7 flex items-center justify-center shadow-sm border border-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-0 flex-shrink-0 ml-3"
            onClick={onClose}
            aria-label="Close"
            title="Close"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" aria-hidden="true">
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

      {/* Main Content Area - 2-column layout */}
      <div className="flex-1 flex min-h-0">
        {/* Left Column: Media or Empty State */}
        <div className="flex-1 flex items-center justify-center bg-black/10 p-2">
          {display.hasMedia ? (
            <div className="w-full h-full">
              {display.musicLink && <MusicEmbed musicLink={display.musicLink} />}
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <svg
                className="w-10 h-10 mx-auto mb-3 opacity-50"
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
              <p className="text-sm">This memory doesn't have any additional content</p>
            </div>
          )}
        </div>

        {/* Right Column: Info & Actions */}
        <div className="w-64 lg:w-80 flex-shrink-0 border-l border-white/20 bg-white/10 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Description */}
            {display.hasDescription && (
              <div>
                <h4 className="text-xs font-semibold text-gray-800 mb-2 uppercase tracking-wider">
                  Description
                </h4>
                <div className="bg-white/20 rounded-lg p-3 border border-white/30">
                  <p className="text-sm text-gray-700 leading-relaxed break-words">
                    {display.description}
                  </p>
                </div>
              </div>
            )}

            {/* Timestamp */}
            {display.hasTimestamp && display.timestampDate && (
              <div>
                <h4 className="text-xs font-semibold text-gray-800 mb-2 uppercase tracking-wider">
                  Created
                </h4>
                <span className="text-xs font-medium text-gray-600 bg-white/20 px-3 py-1.5 rounded-full border border-white/20">
                  {display.timestampDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            )}
          </div>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-white/20 flex-shrink-0 space-y-3">
            {/* Primary Action - View Profile */}
            {display.showProfileButton && (
              <button
                type="button"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500/90 text-white font-semibold py-3 px-4 hover:bg-indigo-600/90 active:bg-indigo-700/90 transition-all duration-200 border border-indigo-400/50 shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
                onClick={() => onViewProfile(display.profileButton.userId)}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span className="text-sm">{display.profileButton.label}</span>
              </button>
            )}

            {/* Owner Actions */}
            {display.canEdit && (
              <div className="flex gap-2 justify-center">
                {onEdit && (
                  <ActionButton
                    type="edit"
                    onClick={() => onEdit(pin)}
                    ariaLabel="Edit pin"
                    title="Edit"
                    className="flex-1 h-11 rounded-xl"
                  />
                )}
                {onDelete && (
                  <ActionButton
                    type="delete"
                    onClick={() => onDelete(pin)}
                    ariaLabel="Delete pin"
                    title="Delete"
                    className="flex-1 h-11 rounded-xl"
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PinInfoPopupMobileLandscape;
