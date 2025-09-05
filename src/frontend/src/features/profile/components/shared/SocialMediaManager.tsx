import React, { useState } from 'react';

export interface SocialMediaLink {
  id: string;
  platform: string;
  url: string;
  icon: string;
  color: string;
}

interface SocialMediaManagerProps {
  socialLinks: SocialMediaLink[];
  onUpdate: (links: SocialMediaLink[]) => void;
  isEditing: boolean;
  onToggleEdit: () => void;
}

const AVAILABLE_PLATFORMS = [
  { 
    name: 'Twitter', 
    icon: 'M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z',
    color: 'from-blue-50 to-blue-100 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-blue-200 hover:text-blue-800'
  },
  { 
    name: 'Facebook', 
    icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
    color: 'from-blue-600 to-indigo-600 border-blue-400 text-white hover:from-blue-700 hover:to-indigo-700'
  },
  { 
    name: 'Instagram', 
    icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z',
    color: 'from-pink-400 to-purple-500 border-pink-300 text-white hover:from-pink-500 hover:to-purple-600'
  },
  { 
    name: 'Spotify', 
    icon: 'M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z',
    color: 'from-green-50 to-green-100 border-green-200 text-green-700 hover:from-green-100 hover:to-green-200 hover:text-green-800'
  },
  { 
    name: 'Pinterest', 
    icon: 'M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.097.116.112.219.085.338-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.162-1.499-.698-2.436-2.888-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.357-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z',
    color: 'from-pink-50 to-pink-100 border-pink-200 text-pink-700 hover:from-pink-100 hover:to-pink-200 hover:text-pink-800'
  },
  { 
    name: 'GitHub', 
    icon: 'M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599-.043-.166-1.458-.166-1.458l-1.591-5.55s-.404-.811-.404-2.019c0-1.89 1.094-3.301 2.456-3.301 1.158 0 1.718.869 1.718 1.909 0 1.163-.741 2.9-1.124 4.51-.32 1.35.677 2.447 2.009 2.447 2.412 0 4.267-2.544 4.267-6.217 0-3.249-2.337-5.521-5.668-5.521-3.86 0-6.127 2.895-6.127 5.89 0 1.167.45 2.421 1.013 3.102.111.136.127.255.094.394-.103.433-.332 1.354-.377 1.544-.058.244-.188.295-.433.178-1.506-.701-2.449-2.901-2.449-4.671 0-3.808 2.765-7.304 7.984-7.304 4.188 0 7.438 2.982 7.438 6.973 0 4.159-2.622 7.508-6.261 7.508-1.222 0-2.373-.636-2.766-1.392l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.348 2.317.535 3.554.535 6.626 0 12-5.373 12-12s-5.374-12-12-12z',
    color: 'from-gray-700 to-gray-800 border-gray-600 text-white hover:from-gray-800 hover:to-gray-900'
  }
];

const SocialMediaManager: React.FC<SocialMediaManagerProps> = ({
  socialLinks,
  onUpdate,
  isEditing,
  onToggleEdit
}) => {
  const [editingLinks, setEditingLinks] = useState(socialLinks);
  const [showAddDropdown, setShowAddDropdown] = useState(false);

  const handleSave = () => {
    onUpdate(editingLinks);
    onToggleEdit();
  };

  const handleCancel = () => {
    setEditingLinks(socialLinks);
    onToggleEdit();
  };

  const handleAddPlatform = (platformName: string) => {
    const platform = AVAILABLE_PLATFORMS.find(p => p.name === platformName);
    if (!platform) return;

    const newLink: SocialMediaLink = {
      id: Date.now().toString(),
      platform: platform.name,
      url: '',
      icon: platform.icon,
      color: platform.color
    };
    setEditingLinks([...editingLinks, newLink]);
    setShowAddDropdown(false);
  };

  const handleRemoveLink = (id: string) => {
    setEditingLinks(editingLinks.filter(link => link.id !== id));
  };

  const handleUrlChange = (id: string, url: string) => {
    setEditingLinks(editingLinks.map(link => 
      link.id === id ? { ...link, url } : link
    ));
  };

  const availablePlatforms = AVAILABLE_PLATFORMS.filter(
    platform => !editingLinks.some(link => link.platform === platform.name)
  );

  if (isEditing) {
    return (
      <div className="bg-white/95 rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Edit Social Media
          </h3>
        </div>

        <div className="space-y-3">
          {editingLinks.map((link) => (
            <div key={link.id} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d={link.icon} />
                </svg>
                <span className="text-sm font-medium text-gray-700 flex-shrink-0">{link.platform}</span>
                <input
                  type="url"
                  value={link.url}
                  onChange={(e) => handleUrlChange(link.id, e.target.value)}
                  placeholder={`Your ${link.platform} URL`}
                  className="flex-1 min-w-0 text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
                />
              </div>
              <button
                onClick={() => handleRemoveLink(link.id)}
                className="p-1 text-red-500 hover:text-red-700 flex-shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}

          {availablePlatforms.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowAddDropdown(!showAddDropdown)}
                className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
              >
                + Add Social Media Platform
              </button>
              
              {showAddDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  {availablePlatforms.map((platform) => (
                    <button
                      key={platform.name}
                      onClick={() => handleAddPlatform(platform.name)}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d={platform.icon} />
                      </svg>
                      {platform.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={handleCancel}
            className="px-3 py-1.5 text-sm rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1.5 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/95 rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          Connect
        </h3>
        <button
          onClick={onToggleEdit}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          title="Edit social media links"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
      </div>

      {socialLinks.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {socialLinks.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2 p-2 rounded-lg bg-gradient-to-r transition-all duration-200 ${link.color}`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d={link.icon} />
              </svg>
              <span className="text-sm font-medium">{link.platform}</span>
            </a>
          ))}
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500 mb-2">No social media links added yet</p>
          <button
            onClick={onToggleEdit}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Add your first link
          </button>
        </div>
      )}
    </div>
  );
};

export default SocialMediaManager;