import React, { useState, useEffect } from 'react';

interface PinData {
  name: string;
  description: string;
  musicLink: string;
  isPrivate: boolean;
}

interface MusicLinkModalProps {
  isOpen: boolean;
  onSubmit: (pinData: PinData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const MusicLinkModal: React.FC<MusicLinkModalProps> = ({ isOpen, onSubmit, onCancel, isSubmitting = false }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [musicLink, setMusicLink] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName('');
      setDescription('');
      setMusicLink('');
      setIsPrivate(false);
      setError('');
    }
  }, [isOpen]);

  const validateMusicLink = (link: string): boolean => {
    if (!link.trim()) return true; // Empty link is allowed
    
    const youtubeRegex = /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+/;
    const spotifyRegex = /^https?:\/\/(open\.)?spotify\.com\/.+/;
    
    return youtubeRegex.test(link) || spotifyRegex.test(link);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateMusicLink(musicLink)) {
      setError('Please enter a valid YouTube or Spotify link');
      return;
    }
    
    onSubmit({
      name: name.trim(),
      description: description.trim(),
      musicLink: musicLink.trim(),
      isPrivate
    });
  };

  const handleMusicLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMusicLink(value);
    
    if (error && (value === '' || validateMusicLink(value))) {
      setError('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2000]">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Add New Pin</h2>
            <button
              onClick={onCancel}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="pinName" className="block text-sm font-medium text-gray-700 mb-2">
                Pin Name (Optional)
              </label>
              <input
                type="text"
                id="pinName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter a name for this pin"
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:bg-gray-50"
                maxLength={100}
              />
            </div>

            <div>
              <label htmlFor="pinDescription" className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                id="pinDescription"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description for this pin"
                rows={3}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none disabled:opacity-50 disabled:bg-gray-50"
                maxLength={500}
              />
              <div className="text-xs text-gray-500 mt-1">
                {description.length}/500 characters
              </div>
            </div>
            
            <div>
              <label htmlFor="musicLink" className="block text-sm font-medium text-gray-700 mb-2">
                Music Link (Optional)
              </label>
              <input
                type="url"
                id="musicLink"
                value={musicLink}
                onChange={handleMusicLinkChange}
                placeholder="https://youtube.com/... or https://spotify.com/..."
                disabled={isSubmitting}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:bg-gray-50 ${
                  error ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Supported: YouTube and Spotify links
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Privacy Setting
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="privacy"
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
                    name="privacy"
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
            
            <div className="flex items-center space-x-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  'Add Pin'
                )}
              </button>
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
          
          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Examples:</h3>
            <div className="text-xs text-gray-600 space-y-1">
              <div>YouTube: https://youtube.com/watch?v=...</div>
              <div>Spotify: https://open.spotify.com/track/...</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicLinkModal;
