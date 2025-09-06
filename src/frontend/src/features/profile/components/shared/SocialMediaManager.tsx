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
  canEdit?: boolean;
}

const AVAILABLE_PLATFORMS = [
  {
    name: 'Twitter',
    icon: 'M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z',
    color:
      'from-blue-50 to-blue-100 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-blue-200 hover:text-blue-800',
  },
  {
    name: 'Facebook',
    icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
    color:
      'from-blue-600 to-indigo-600 border-blue-400 text-white hover:from-blue-700 hover:to-indigo-700',
  },
  {
    name: 'Instagram',
    icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z',
    color:
      'from-pink-400 to-purple-500 border-pink-300 text-white hover:from-pink-500 hover:to-purple-600',
  },
  {
    name: 'TikTok',
    icon: 'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.48 2.8-1.23 3.99-1.24 2.09-3.5 3.59-5.85 3.96-1.31.22-2.67.04-3.89-.49-2.26-.98-4.07-3.05-4.55-5.49-.25-1.3-.04-2.64.49-3.85.34-.81.88-1.54 1.6-2.06 1.77-1.38 4.31-1.38 6.08 0 .34.21.63.48.85.8.45.64.61 1.43.44 2.18-.08.4-.25.78-.5 1.09-.18.24-.41.45-.67.6-.34.2-.73.3-1.12.27-.26-.02-.51-.1-.72-.24-.13-.08-.24-.19-.32-.32-.04-.07-.06-.15-.06-.23 0-.08.02-.15.06-.21.08-.12.18-.23.3-.31.18-.12.4-.19.62-.19.08 0 .15.01.22.04.04.02.08.04.12.07.02.02.04.04.05.07.01.03.01.06 0 .09-.01.02-.02.04-.04.05-.01.01-.03.02-.04.02-.01 0-.02 0-.03-.01-.01-.01-.02-.02-.02-.03 0-.01 0-.02.01-.03.01-.01.02-.01.03-.01.01 0 .02 0 .03.01.01.01.02.02.02.03 0 .01 0 .02-.01.03-.01.01-.02.01-.03.01-.01 0-.02 0-.03-.01-.01-.01-.02-.02-.02-.03 0-.01 0-.02.01-.03.01-.01.02-.01.03-.01z',
    color:
      'from-pink-50 to-pink-100 border-pink-200 text-pink-700 hover:from-pink-100 hover:to-pink-200 hover:text-pink-800',
  },
  {
    name: 'YouTube',
    icon: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
    color:
      'from-red-50 to-red-100 border-red-200 text-red-700 hover:from-red-100 hover:to-red-200 hover:text-red-800',
  },
  {
    name: 'Website',
    icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z',
    color:
      'from-blue-50 to-blue-100 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-blue-200 hover:text-blue-800',
  },
  {
    name: 'Spotify',
    icon: 'M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z',
    color:
      'from-green-400 to-green-500 border-green-300 text-white hover:from-green-500 hover:to-green-600',
  },
  {
    name: 'GitHub',
    icon: 'M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111 1.093-.261 1.093-.584 0-.286-.011-1.04-.016-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.744.083-.729.083-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.627-5.373-12-12-12',
    color:
      'from-gray-700 to-gray-800 border-gray-600 text-white hover:from-gray-800 hover:to-gray-900',
  },
];

export function getPlatformMeta(platformName: string) {
  const meta = AVAILABLE_PLATFORMS.find((p) => p.name.toLowerCase() === platformName.toLowerCase());
  if (meta) return meta;
  // Fallback generic icon/color
  return {
    name: platformName,
    icon: 'M12 2a10 10 0 100 20 10 10 0 000-20z',
    color:
      'from-gray-50 to-gray-100 border-gray-200 text-gray-700 hover:from-gray-100 hover:to-gray-200 hover:text-gray-800',
  };
}

const SocialMediaManager: React.FC<SocialMediaManagerProps> = ({
  socialLinks,
  onUpdate,
  isEditing,
  onToggleEdit,
  canEdit = true,
}) => {
  const [editingLinks, setEditingLinks] = useState(socialLinks);
  const [showAddDropdown, setShowAddDropdown] = useState(false);

  // Sync editingLinks when socialLinks prop changes
  React.useEffect(() => {
    setEditingLinks(socialLinks);
  }, [socialLinks]);

  const handleSave = () => {
    // Filter out links with empty URLs and provide feedback
    const validLinks = editingLinks.filter((link) => link.url.trim().length > 0);
    const removedCount = editingLinks.length - validLinks.length;

    onUpdate(validLinks);
    onToggleEdit();

    // Optional: Could add toast notification here if needed
    if (removedCount > 0) {
      console.log(`${removedCount} social media link(s) with empty URLs were not saved`);
    }
  };

  const handleCancel = () => {
    setEditingLinks(socialLinks);
    onToggleEdit();
  };

  const handleAddPlatform = (platformName: string) => {
    const platform = AVAILABLE_PLATFORMS.find((p) => p.name === platformName);
    if (!platform) return;

    const newLink: SocialMediaLink = {
      id: Date.now().toString(),
      platform: platform.name,
      url: '',
      icon: platform.icon,
      color: platform.color,
    };
    setEditingLinks([...editingLinks, newLink]);
    setShowAddDropdown(false);
  };

  const handleRemoveLink = (id: string) => {
    setEditingLinks(editingLinks.filter((link) => link.id !== id));
  };

  const handleUrlChange = (id: string, url: string) => {
    setEditingLinks(editingLinks.map((link) => (link.id === id ? { ...link, url } : link)));
  };

  const availablePlatforms = AVAILABLE_PLATFORMS.filter(
    (platform) => !editingLinks.some((link) => link.platform === platform.name)
  );

  if (isEditing) {
    return (
      <div className="bg-white/95 rounded-lg border border-gray-100 shadow-sm p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-gray-800 flex items-center gap-1.5 uppercase tracking-wide">
            <svg
              className="w-3.5 h-3.5 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
            Edit Social Media
          </h3>
        </div>

        <div className="space-y-3">
          {editingLinks.map((link) => {
            const isEmpty = !link.url.trim();
            return (
              <div key={link.id} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d={link.icon} />
                  </svg>
                  <span className="text-sm font-medium text-gray-700 flex-shrink-0">
                    {link.platform}
                  </span>
                  <div className="flex-1 min-w-0">
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => handleUrlChange(link.id, e.target.value)}
                      placeholder={`Your ${link.platform} URL`}
                      className={`w-full text-sm border rounded px-2 py-1 focus:outline-none ${
                        isEmpty
                          ? 'border-red-300 bg-red-50 focus:border-red-500'
                          : 'border-gray-300 focus:border-blue-500'
                      }`}
                    />
                    {isEmpty && (
                      <p className="text-xs text-red-600 mt-1">
                        URL required or this link will be removed
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveLink(link.id)}
                  className="p-1 text-red-500 hover:text-red-700 flex-shrink-0 cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            );
          })}

          {availablePlatforms.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowAddDropdown(!showAddDropdown)}
                className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
              >
                + Add Social Media Platform
              </button>

              {showAddDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  {availablePlatforms.map((platform) => (
                    <button
                      key={platform.name}
                      onClick={() => handleAddPlatform(platform.name)}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
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
            className="px-3 py-1.5 text-sm rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200  cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1.5 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700  cursor-pointer"
          >
            Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/95 rounded-lg border border-gray-100 shadow-sm p-3 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-gray-800 flex items-center gap-1.5 uppercase tracking-wide">
          <svg
            className="w-3.5 h-3.5 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>
          Connect
        </h3>
        {canEdit && (
          <button
            onClick={onToggleEdit}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            title="Edit social media links"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
        )}
      </div>

      {socialLinks.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {socialLinks.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r transition-all duration-200 ${link.color}`}
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d={link.icon} />
              </svg>
              <span className="text-xs font-medium">{link.platform}</span>
            </a>
          ))}
        </div>
      ) : (
        <div className="text-center py-3">
          <p className="text-xs text-gray-500 mb-2">No links added yet</p>
          {canEdit && (
            <button
              onClick={onToggleEdit}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
            >
              Add your first link
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SocialMediaManager;
