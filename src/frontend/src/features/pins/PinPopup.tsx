import React from 'react';
import { Pin } from '../map/types/map';

interface Props {
  pin: Pin;
  onViewProfile: (userId: string) => void;
  onEdit: (pin: Pin) => void;
  onDelete: (pin: Pin) => void;
  onClose?: () => void; // for mobile modal
}

const PinPopup: React.FC<Props> = ({ pin, onViewProfile, onEdit, onDelete, onClose }) => {
  const privacy = pin.isPrivate ? (
    <span className="privacy-badge private">
      <span className="privacy-icon">🔒</span> Private
    </span>
  ) : (
    <span className="privacy-badge public">
      <span className="privacy-icon">🌍</span> Public
    </span>
  );

  const musicText = pin.musicLink
    ? pin.musicLink.includes('youtu')
      ? 'Open YouTube'
      : pin.musicLink.includes('spotify')
        ? 'Open Spotify'
        : 'Open Music Link'
    : null;

  return (
    <div className="w-[340px] max-w-[92vw] rounded-2xl bg-white/80 dark:bg-zinc-900/80 shadow-xl backdrop-blur-md border border-zinc-200 dark:border-zinc-700 flex flex-col">
      <div className="h-14 w-full relative rounded-t-2xl flex items-center justify-between px-5 py-3 bg-gradient-to-r from-white/60 via-zinc-100/60 to-white/40 dark:from-zinc-900/60 dark:via-zinc-800/60 dark:to-zinc-900/40 border-b border-zinc-200 dark:border-zinc-700">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 truncate">
          {pin.name || 'Unnamed Pin'}
        </h3>
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
      </div>
      {pin.description && (
        <div className="px-5 py-3 border-b border-zinc-100 dark:border-zinc-800">
          <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
            {pin.description}
          </p>
        </div>
      )}
      {pin.musicLink && (
        <div className="px-5 py-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
          <span className="text-base">🎵</span>
          <a
            href={pin.musicLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-blue-700 dark:text-blue-300 underline hover:text-blue-900 dark:hover:text-blue-100 transition"
          >
            {musicText}
          </a>
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
            <button
              type="button"
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-medium py-2 px-3 hover:bg-blue-200 dark:hover:bg-blue-800 transition"
              onClick={() => onEdit(pin)}
            >
              <span className="text-base">✏️</span> Edit
            </button>
            <button
              type="button"
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200 font-medium py-2 px-3 hover:bg-rose-200 dark:hover:bg-rose-800 transition"
              onClick={() => onDelete(pin)}
            >
              <span className="text-base">🗑️</span> Delete
            </button>
          </div>
        )}
      </div>
    </div>

    // <div className="enhanced-pin-popup redesigned-popup">
    //   {/* Close button for both desktop and mobile */}

    //   <div className="popup-header redesigned-header">
    //     <div className="pin-title-section redesigned-title-section">
    //       <h3 className="pin-title redesigned-title">{pin.name || 'Unnamed Pin'}</h3>
    //       {privacy}
    //     </div>
    //   </div>

    //   {pin.description && (
    //     <div className="pin-description redesigned-description">
    //       <p>{pin.description}</p>
    //     </div>
    //   )}

    //   <div className="pin-metadata redesigned-metadata">
    //     <div className="owner-info redesigned-owner-info">
    //       <span className="metadata-icon">👤</span>
    //       <span className="metadata-label">Created by:</span>
    //       <button
    //         type="button"
    //         className="owner-link redesigned-owner-link"
    //         onClick={() => onViewProfile(pin.owner.toString())}
    //       >
    //         View Profile
    //       </button>
    //     </div>
    //   </div>

    //   <div className="popup-actions redesigned-actions">
    //     {pin.musicLink && musicText && (
    //       <a
    //         href={pin.musicLink}
    //         target="_blank"
    //         rel="noopener noreferrer"
    //         className="action-button music-button redesigned-music-button"
    //       >
    //         <span className="button-icon">🎵</span> {musicText}
    //       </a>
    //     )}

    //     {pin.isOwner && (
    //       <div className="redesigned-owner-actions">
    //         <button
    //           type="button"
    //           className="action-button edit-button redesigned-edit-button"
    //           onClick={() => onEdit(pin)}
    //         >
    //           <span className="button-icon">✏️</span> Edit
    //         </button>
    //         <button
    //           type="button"
    //           className="action-button delete-button redesigned-delete-button"
    //           onClick={() => onDelete(pin)}
    //         >
    //           <span className="button-icon">🗑️</span> Delete
    //         </button>
    //       </div>
    //     )}
    //   </div>

    //   <div className="popup-footer redesigned-footer">
    //     <span className="timestamp redesigned-timestamp">
    //       Added: {new Date(pin.timestamp).toLocaleString()}
    //     </span>
    //   </div>
    // </div>
  );
};

export default PinPopup;
