import React from 'react';
import MusicEmbed from '../common/MusicEmbed';
import PinActionButton from './PinActionButton';
import { Pin } from '../map/types/map';

interface PinInfoPopupProps {
  pin: Pin;
  onViewProfile: (userId: string) => void;
  onEdit?: (pin: Pin) => void;
  onDelete?: (pin: Pin) => void;
  onClose?: () => void;
  showPrivacy?: boolean;
  showTimestamp?: boolean;
}

const PinInfoPopup: React.FC<PinInfoPopupProps> = ({
  pin,
  onViewProfile,
  onEdit,
  onDelete,
  onClose,
  showPrivacy = true,
  showTimestamp = true,
}) => {
  const privacy = pin.isPrivate ? (
    <span className="privacy-badge private">
      <span className="privacy-icon">🔒</span> Private
    </span>
  ) : (
    <span className="privacy-badge public">
      Public
    </span>
  );

  return (
    <div className="w-[340px] max-w-[92vw] rounded-2xl bg-white/80 dark:bg-zinc-900/80 shadow-xl backdrop-blur-md border border-zinc-200 dark:border-zinc-700 flex flex-col animate-fade-in max-h-[90vh] overflow-y-auto">
      <div className="h-14 w-full relative rounded-t-2xl flex items-center justify-between px-5 py-3 bg-gradient-to-r from-white/60 via-zinc-100/60 to-white/40 dark:from-zinc-900/60 dark:via-zinc-800/60 dark:to-zinc-900/40 border-b border-zinc-200 dark:border-zinc-700">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 truncate">
          {pin.name || 'Unnamed Memory'}
        </h3>
        {onClose && (
          <button
            className="cursor-pointer bg-zinc-200/70 hover:bg-zinc-300 dark:bg-zinc-800/70 dark:hover:bg-zinc-700 transition-colors rounded-full w-8 h-8 flex items-center justify-center shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-600"
            onClick={onClose}
            aria-label="Close"
            title="Close"
          >
            <svg
              className="h-5 w-5 text-zinc-600 dark:text-zinc-300"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
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
  {/* Privacy info removed as requested */}
      {pin.description && (
        <div className="px-5 py-3 border-b border-zinc-100 dark:border-zinc-800 max-h-40 overflow-y-auto">
          <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed break-words">
            {pin.description}
          </p>
        </div>
      )}
      {pin.musicLink && (
        <div className="px-5 py-3 border-b border-zinc-100 dark:border-zinc-800">
          <MusicEmbed musicLink={pin.musicLink} />
        </div>
      )}
      <div className="px-5 py-3 flex flex-col gap-2">
        <button
          type="button"
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium py-2 px-3 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
          onClick={() => onViewProfile(pin.owner.toString())}
        >
          <span className="text-base">👤</span> View Profile
        </button>
        {pin.isOwner && (
          <div className="flex gap-2">
            {onEdit && (
              <PinActionButton color="edit" onClick={() => onEdit(pin)}>
                <span className="text-base">✏️</span> Edit
              </PinActionButton>
            )}
            {onDelete && (
              <PinActionButton color="delete" onClick={() => onDelete(pin)}>
                <span className="text-base">🗑️</span> Delete
              </PinActionButton>
            )}
          </div>
        )}
      </div>
      {showTimestamp && pin.timestamp && (
        <div className="px-5 py-2 text-right">
          <span className="timestamp text-sm font-medium text-zinc-700 dark:text-zinc-200">
            Spot added: {new Date(pin.timestamp).toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
};

export default PinInfoPopup;
