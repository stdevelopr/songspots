import React from 'react';

interface ProfileHeroProps {
  name: string;
  principalId: string;
  photoUrl?: string | null;
  onCopyPrincipal: () => void;
  copied: boolean;
  isViewingOwnProfile: boolean;
  onBackToMap: () => void;
  onEdit?: () => void;
  showEdit?: boolean;
  totalCount: number;
  publicCount?: number;
  privateCount?: number;
}

const ProfileHero: React.FC<ProfileHeroProps> = ({
  name,
  principalId,
  photoUrl,
  onCopyPrincipal,
  copied,
  isViewingOwnProfile,
  onBackToMap,
  onEdit,
  showEdit = false,
  totalCount,
  publicCount,
  privateCount,
}) => {
  return (
    <div className="bg-white/70 rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Cover banner */}
      <div className="h-24 bg-gradient-to-r from-blue-100 via-purple-100 to-indigo-100" />

      {/* Avatar */}
      <div className="-mt-8 px-4 flex flex-col items-center">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt="Profile"
            className="w-20 h-20 rounded-full border-4 border-white shadow-md object-cover"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-white border-4 border-white shadow-md flex items-center justify-center">
            <svg className="w-10 h-10 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
        )}

        {/* Name */}
        <div className="mt-2 text-center">
          <div className="font-bold text-xl text-gray-900 truncate max-w-[240px]" title={name}>
            {name}
          </div>
          <div className="mt-1 flex items-center gap-2 justify-center">
            <span className="text-xs text-gray-500 break-all font-mono truncate max-w-[220px]" title={principalId}>
              {principalId}
            </span>
            <button
              onClick={onCopyPrincipal}
              className="text-[10px] text-blue-700 hover:text-blue-900 bg-white border border-blue-100 rounded-full px-2 py-0.5 shadow"
              title="Copy ID"
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-3 flex gap-2">
          <button
            onClick={onBackToMap}
            className="md:hidden flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium bg-white rounded-full px-3 py-1 shadow border border-blue-100"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Map
          </button>
          {isViewingOwnProfile && showEdit && onEdit && (
            <button
              onClick={onEdit}
              className="text-purple-700 hover:text-purple-900 text-xs font-medium px-3 py-1 rounded-full bg-white border border-purple-100 shadow"
            >
              Edit Profile
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="mt-3 mb-4 flex flex-wrap gap-2 justify-center text-[11px]">
          <span className="px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-700">Total: {totalCount}</span>
          {typeof publicCount === 'number' && (
            <span className="px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-700">Public: {publicCount}</span>
          )}
          {typeof privateCount === 'number' && (
            <span className="px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-700">Private: {privateCount}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileHero;
