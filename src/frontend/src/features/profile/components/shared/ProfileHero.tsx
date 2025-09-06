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
              className="text-[10px] text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-full px-2 py-0.5 shadow-sm hover:shadow transition-all duration-200 cursor-pointer"
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
            className="md:hidden flex items-center gap-1 text-blue-700 hover:text-blue-800 text-xs font-semibold bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 shadow-sm hover:shadow border border-blue-200 transition-all duration-200 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Map
          </button>
          {isViewingOwnProfile && showEdit && onEdit && (
            <button
              onClick={onEdit}
              className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer flex items-center gap-2 transition-colors duration-200"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
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
