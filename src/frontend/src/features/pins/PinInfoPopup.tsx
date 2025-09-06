import React from 'react';
import MusicEmbed from '../common/MusicEmbed';
import PinActionButton from './PinActionButton';
import { Pin } from '../map/types/map';

interface PinInfoPopupProps {
  pin: Pin;
  onViewProfile: (userId: string | null) => void;
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
    <span className="privacy-badge public">Public</span>
  );

  return (
    <div className="w-[300px] max-w-[92vw] rounded-xl bg-white/95 shadow-xl backdrop-blur-md border border-gray-200 flex flex-col animate-fade-in max-h-[90vh] overflow-y-auto">
      <div className="h-10 w-full relative rounded-t-xl flex items-center justify-between px-4 py-2 bg-gradient-to-r from-white/80 via-gray-50/80 to-white/60 border-b border-gray-200">
        <h3 className="text-base font-semibold text-gray-900 truncate flex-1 pr-2">
          {pin.name || 'Unnamed Memory'}
        </h3>
        {onClose && (
          <button
            className="cursor-pointer bg-gray-200/70 hover:bg-gray-300 transition-colors rounded-full w-6 h-6 flex items-center justify-center shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 flex-shrink-0"
            onClick={onClose}
            aria-label="Close"
            title="Close"
          >
            <svg
              className="h-4 w-4 text-gray-600"
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
        <div className="px-4 py-2 border-b border-gray-100 max-h-32 overflow-y-auto">
          <p className="text-sm text-gray-700 leading-relaxed break-words">
            {pin.description}
          </p>
        </div>
      )}
      {pin.musicLink && (
        <div className="px-4 py-2 border-b border-gray-100">
          <MusicEmbed musicLink={pin.musicLink} />
        </div>
      )}
      <div className="px-4 py-2 flex flex-col gap-1.5">
        <button
          type="button"
          className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-50 text-indigo-700 font-medium py-1.5 px-3 hover:bg-indigo-100 transition border border-indigo-200 cursor-pointer"
          onClick={() => {
            if (pin.isOwner) {
              onViewProfile(null);
            } else {
              onViewProfile(pin.owner.toString());
            }
          }}
        >
          <span className="text-sm flex items-center">
            View Profile
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 ml-1 inline"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
          </span>
        </button>
        {pin.isOwner && (
          <div className="flex gap-1.5">
            {onEdit && (
              <PinActionButton color="edit" onClick={() => onEdit(pin)}>
                <span className="text-sm flex items-center justify-center w-full">
                  <svg
                    className="w-4 h-4 mr-1.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit
                </span>
              </PinActionButton>
            )}
            {onDelete && (
              <PinActionButton color="delete" onClick={() => onDelete(pin)}>
                <span className="text-sm flex items-center justify-center w-full">
                  <svg
                    className="w-4 h-4 mr-1.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6m0 12L6 6"
                    />
                  </svg>
                  Delete
                </span>
              </PinActionButton>
            )}
          </div>
        )}
      </div>
      {showTimestamp && pin.timestamp && (
        <div className="px-4 py-1.5 text-right">
          <span className="timestamp text-xs font-medium text-gray-600">
            Spot added: {new Date(pin.timestamp).toLocaleDateString()}
          </span>
        </div>
      )}
    </div>
  );
};

export default PinInfoPopup;
