import React from 'react';

interface VibeModalProps {
  isOpen: boolean;
  title: string;
  name: string;
  setName: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  musicLink: string;
  setMusicLink: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isPrivate: boolean;
  setIsPrivate: (v: boolean) => void;
  error: string;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
  submitText: string;
  children?: React.ReactNode;
}

const VibeModal: React.FC<VibeModalProps> = ({
  isOpen,
  title,
  name,
  setName,
  description,
  setDescription,
  musicLink,
  setMusicLink,
  isPrivate,
  setIsPrivate,
  error,
  isSubmitting,
  onCancel,
  onSubmit,
  submitText,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-white/10 backdrop-blur-sm z-[2000] flex items-center justify-center p-2 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="vibe-modal-title"
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm sm:max-w-md mx-auto max-h-[95vh] sm:max-h-[90vh] overflow-y-auto flex flex-col"
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.stopPropagation();
            if (!isSubmitting) onCancel();
          }
        }}
      >
        <div className="p-3 sm:p-4">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 id="vibe-modal-title" className="text-lg sm:text-xl font-semibold text-gray-900">{title}</h2>
            <button
              onClick={onCancel}
              disabled={isSubmitting}
              aria-label="Close"
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-2.5 sm:space-y-3">
            <div>
              <label htmlFor="editVibeName" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Name (Optional)
              </label>
              <input
                type="text"
                id="editVibeName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter a name for this vibe"
                disabled={isSubmitting}
                autoFocus
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:bg-gray-50"
                maxLength={100}
              />
            </div>

            <div>
              <label
                htmlFor="editVibeDescription"
                className="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
              >
                Description (Optional)
              </label>
              <textarea
                id="editVibeDescription"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description for this vibe"
                rows={2}
                disabled={isSubmitting}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none disabled:opacity-50 disabled:bg-gray-50"
                maxLength={500}
              />
              <div className="text-xs text-gray-500 mt-1">{description.length}/500 characters</div>
            </div>

            <div>
              <label
                htmlFor="editMusicLink"
                className="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
              >
                Music Link (Optional)
              </label>
              <input
                type="text"
                id="editMusicLink"
                value={musicLink}
                onChange={setMusicLink}
                placeholder="https://youtube.com/... or https://spotify.com/..."
                disabled={isSubmitting}
                className={`w-full px-3 py-2 text-sm border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:bg-gray-50 ${error ? 'border-amber-300' : 'border-gray-300'}`}
              />
              {error && <p className="mt-1 text-sm text-amber-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                Not a valid link - will not be applied
              </p>}
              <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                <details className="cursor-pointer">
                  <summary className="text-xs font-medium text-blue-800 hover:text-blue-900">How to get music links</summary>
                  <div className="text-xs text-blue-700 mt-2 space-y-1.5">
                    <div>
                      <strong>YouTube:</strong> Find song → Share → Copy link
                    </div>
                    <div>
                      <strong>Spotify:</strong> Find song → (...) → Share → Copy song link
                    </div>
                  </div>
                </details>
              </div>
            </div>

            {/* Privacy Toggle */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center flex-1">
                  <div className="text-xl mr-3">
                    {isPrivate ? '🔒' : '🌍'}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      {isPrivate ? 'Private Spot' : 'Public Spot'}
                      {isPrivate && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Private
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {isPrivate 
                        ? 'Only visible to you when logged in' 
                        : 'Visible to everyone on the map'
                      }
                    </div>
                  </div>
                </div>
                
                {/* Enhanced Toggle Switch */}
                <button
                  type="button"
                  onClick={() => setIsPrivate(!isPrivate)}
                  disabled={isSubmitting}
                  className={`
                    relative w-12 h-6 rounded-full transition-all duration-300 ease-in-out
                    focus:outline-none focus:ring-4 focus:ring-opacity-25 disabled:opacity-50
                    ${isPrivate 
                      ? 'bg-gradient-to-r from-purple-500 to-purple-600 shadow-md focus:ring-purple-300' 
                      : 'bg-gray-300 focus:ring-blue-300'
                    }
                  `}
                >
                  <div className={`
                    absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md
                    transition-all duration-300 ease-in-out flex items-center justify-center
                    ${isPrivate ? 'translate-x-6' : 'translate-x-0'}
                  `}>
                    {isPrivate ? (
                      <svg className="w-3 h-3 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2 sm:pt-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 text-white py-2.5 sm:py-2 px-3 sm:px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center text-sm"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-2"></div>
                    {submitText}
                  </>
                ) : (
                  submitText
                )}
              </button>
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                className="flex-1 bg-gray-200 text-gray-800 py-2.5 sm:py-2 px-3 sm:px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-50 cursor-pointer text-sm"
              >
                Cancel
              </button>
            </div>
          </form>

          {children}
        </div>
      </div>
    </div>
  );
};

export default VibeModal;
