import React from 'react';
import { Pin } from '@features/map/types/map';
import { useVibeDisplay } from '../hooks';
import {
  Header,
  MusicBlock,
  DescriptionBlock,
  MoodTag,
  ProfileButton,
  ActionButton,
} from './shared';

interface VibeInfoPopupMobileLandscapeProps {
  vibe: Pin;
  onViewProfile: (userId: string | null) => void;
  onEdit?: (vibe: Pin) => void;
  onDelete?: (vibe: Pin) => void;
  onClose?: () => void;
  showTimestamp?: boolean;
}

const VibeInfoPopupMobileLandscape: React.FC<VibeInfoPopupMobileLandscapeProps> = ({
  vibe,
  onViewProfile,
  onEdit,
  onDelete,
  onClose,
  showTimestamp = true,
}) => {
  const display = useVibeDisplay(vibe, { showTimestamp });

  return (
    <div className="w-screen h-screen bg-white/20 backdrop-blur-md flex flex-col animate-fade-in overflow-hidden">
      <Header title={display.title} onClose={onClose} size="md" />

      {/* Always visible mood banner */}
      {display.hasMood && display.mood && (
        <MoodTag mood={display.mood} variant="banner" size="md" />
      )}

      {/* Main Content Area - 2-column layout */}
      <div className="flex-1 flex min-h-0">
        {/* Left Column: Media or Empty State */}
        <div className="flex-1 flex items-center justify-center bg-black/10 p-2">
          {display.hasMedia ? (
            <div className="w-full h-full">
              <MusicBlock musicLink={display.musicLink} />
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
            {display.hasDescription && <DescriptionBlock size="sm" text={display.description} />}

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
              <ProfileButton
                fullWidth
                label={display.profileButton.label}
                onClick={() => onViewProfile(display.profileButton.userId)}
              />
            )}

            {/* Owner Actions */}
            {display.canEdit && (
              <div className="flex gap-2 justify-center">
                {onEdit && (
                  <ActionButton
                    type="edit"
                    onClick={() => onEdit(vibe)}
                    ariaLabel="Edit vibe"
                    title="Edit"
                    className="flex-1 h-11 rounded-xl"
                  />
                )}
                {onDelete && (
                  <ActionButton
                    type="delete"
                    onClick={() => onDelete(vibe)}
                    ariaLabel="Delete vibe"
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

export default VibeInfoPopupMobileLandscape;
