import React from 'react';

interface ProfileAboutProps {
  bio: string;
  isViewingOwnProfile: boolean;
  isEditing: boolean;
  onEdit: () => void;
}

const ProfileAbout: React.FC<ProfileAboutProps> = ({
  bio,
  isViewingOwnProfile,
  isEditing,
  onEdit,
}) => {
  return (
    <div className="bg-white/95 rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all duration-300">
      {/* Simple header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-xl">
            <svg
              className="w-4 h-4 text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h3 className="text-base font-bold text-gray-800">About</h3>
        </div>
        {isViewingOwnProfile && !isEditing && (
          <button
            onClick={onEdit}
            className="text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 px-3 py-2 rounded-lg font-medium flex items-center gap-1.5 transition-colors duration-200 cursor-pointer"
          >
            <svg
              className="w-3 h-3"
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
            Edit Profile
          </button>
        )}
      </div>
      
      {/* Bio content with improved typography */}
      {isViewingOwnProfile ? (
        bio?.trim() ? (
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-loose bg-gray-50 rounded-xl p-4 break-words overflow-wrap-anywhere border border-gray-100">
            {bio}
          </p>
        ) : (
          <div className="text-sm text-gray-500 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-5 text-center border-2 border-dashed border-gray-200">
            <svg
              className="w-8 h-8 text-gray-400 mx-auto mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <div className="font-semibold mb-2 text-gray-700">Tell your story</div>
            <div className="text-xs text-gray-500 leading-relaxed">Share your music journey and favorite vibe spots with others</div>
          </div>
        )
      ) : bio?.trim() ? (
        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-loose bg-gray-50 rounded-xl p-4 break-words overflow-wrap-anywhere border border-gray-100">
          {bio}
        </p>
      ) : (
        <div className="text-center py-8 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl border border-gray-100">
          <svg
            className="w-10 h-10 text-gray-300 mx-auto mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <p className="text-sm text-gray-500 font-medium">This user hasn't shared their story yet</p>
        </div>
      )}
    </div>
  );
};

export default ProfileAbout;