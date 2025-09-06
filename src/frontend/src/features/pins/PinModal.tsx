import React from 'react';

interface PinModalProps {
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

const PinModal: React.FC<PinModalProps> = ({
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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[2000] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto flex flex-col">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <button
              onClick={onCancel}
              disabled={isSubmitting}
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

          <form onSubmit={onSubmit} className="space-y-3">
            <div>
              <label htmlFor="editPinName" className="block text-sm font-medium text-gray-700 mb-1">
                Name (Optional)
              </label>
              <input
                type="text"
                id="editPinName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter a name for this pin"
                disabled={isSubmitting}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:bg-gray-50"
                maxLength={100}
              />
            </div>

            <div>
              <label
                htmlFor="editPinDescription"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description (Optional)
              </label>
              <textarea
                id="editPinDescription"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description for this pin"
                rows={2}
                disabled={isSubmitting}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none disabled:opacity-50 disabled:bg-gray-50"
                maxLength={500}
              />
              <div className="text-xs text-gray-500 mt-1">{description.length}/500 characters</div>
            </div>

            <div>
              <label
                htmlFor="editMusicLink"
                className="block text-sm font-medium text-gray-700 mb-1"
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
                className={`w-full px-3 py-1.5 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:bg-gray-50 ${error ? 'border-amber-300' : 'border-gray-300'}`}
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Privacy Setting
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="editPrivacy"
                    value="public"
                    checked={!isPrivate}
                    onChange={() => setIsPrivate(false)}
                    disabled={isSubmitting}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 disabled:opacity-50"
                  />
                  <span className="ml-3 text-sm text-gray-700">
                    <span className="font-medium">🌐 Public</span> - Visible to everyone
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="editPrivacy"
                    value="private"
                    checked={isPrivate}
                    onChange={() => setIsPrivate(true)}
                    disabled={isSubmitting}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 disabled:opacity-50"
                  />
                  <span className="ml-3 text-sm text-gray-700">
                    <span className="font-medium">🔒 Private</span> - Only visible to you
                  </span>
                </label>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-50 cursor-pointer"
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

export default PinModal;
