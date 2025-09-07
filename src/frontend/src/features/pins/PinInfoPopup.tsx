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
  modalLayout?: boolean;
}

const PinInfoPopup: React.FC<PinInfoPopupProps> = ({
  pin,
  onViewProfile,
  onEdit,
  onDelete,
  onClose,
  showPrivacy = true,
  showTimestamp = true,
  modalLayout = false,
}) => {
  const privacy = pin.isPrivate ? (
    <span className="privacy-badge private">
      <span className="privacy-icon">🔒</span> Private
    </span>
  ) : (
    <span className="privacy-badge public">Public</span>
  );

  const containerClasses = modalLayout
    ? 'w-[92vw] max-w-5xl rounded-2xl bg-white/20 shadow-2xl backdrop-blur-md border border-white/20 flex flex-col animate-fade-in max-h-screen overflow-y-auto'
    : 'w-[300px] max-w-[92vw] rounded-xl bg-white/20 shadow-xl backdrop-blur-md border border-white/20 flex flex-col animate-fade-in max-h-[90vh] overflow-y-auto';

  return (
    <div className={containerClasses}>
      <div className="h-12 w-full relative rounded-t-xl flex items-center justify-between px-4 py-2 bg-gradient-to-r from-white/30 via-white/20 to-white/10 border-b border-white/30">
        <h3 className="text-base font-semibold text-gray-900 truncate flex-1 pr-2">
          {pin.name || 'Unnamed Memory'}
        </h3>
        {onClose && (
          <button
            className="cursor-pointer bg-white text-gray-700 hover:bg-gray-50 transition-colors rounded-full w-8 h-8 flex items-center justify-center shadow-md border border-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-0 flex-shrink-0 ml-2"
            onClick={onClose}
            aria-label="Close"
            title="Close"
          >
            <svg
              className="h-4 w-4"
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

      {modalLayout ? (
        <>
          <div className="p-4 flex-1 min-h-0 overflow-y-auto sm:overflow-hidden">
            <div className="h-full min-h-0 sm:grid sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 flex items-center justify-center min-w-0">
                {pin.musicLink && (
                  <div className="w-full h-[42vh] sm:h-[50vh]">
                    <MusicEmbed musicLink={pin.musicLink} className="h-full" />
                  </div>
                )}
              </div>
              <div className="sm:col-span-1 flex flex-col gap-3 overflow-auto min-h-0">
                {pin.description && (
                  <div className="border border-gray-100 rounded-lg p-3 bg-white/30">
                    <p className="text-sm text-gray-700 leading-relaxed break-words">
                      {pin.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="px-3 pb-3 pt-2 border-t border-white/20 bg-white/10 backdrop-blur-sm rounded-b-2xl">
            <div className="grid grid-cols-2 gap-2 items-center">
              <PinActionButton
                color="edit"
                className="py-2 px-2 text-sm"
                onClick={() => {
                  if (pin.isOwner) {
                    onViewProfile(null);
                  } else {
                    onViewProfile(pin.owner.toString());
                  }
                }}
              >
                <span className="text-sm flex items-center justify-center w-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                  </svg>
                  View Profile
                </span>
              </PinActionButton>
              {pin.isOwner && (
                <div className="flex items-center justify-end gap-2">
                  {onEdit && (
                    <PinActionButton
                      color="edit"
                      variant="icon"
                      onClick={() => onEdit(pin)}
                      ariaLabel="Edit pin"
                      title="Edit"
                      className="ml-auto"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </PinActionButton>
                  )}
                  {onDelete && (
                    <PinActionButton
                      color="delete"
                      variant="icon"
                      onClick={() => onDelete(pin)}
                      ariaLabel="Delete pin"
                      title="Delete"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m-3 0h14"
                        />
                      </svg>
                    </PinActionButton>
                  )}
                </div>
              )}
            </div>
            {showTimestamp && pin.timestamp && (
              <div className="mt-2 text-right">
                <span className="timestamp text-xs font-medium text-gray-600">
                  Spot added: {new Date(pin.timestamp).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Compact stack layout */}
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
                  <PinActionButton
                    color="edit"
                    variant="icon"
                    onClick={() => onEdit(pin)}
                    ariaLabel="Edit pin"
                    title="Edit"
                    className="shrink-0"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </PinActionButton>
                )}
                {onDelete && (
                  <PinActionButton
                    color="delete"
                    variant="icon"
                    onClick={() => onDelete(pin)}
                    ariaLabel="Delete pin"
                    title="Delete"
                    className="shrink-0"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m-3 0h14"
                      />
                    </svg>
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
        </>
      )}
    </div>
  );
};

export default PinInfoPopup;
