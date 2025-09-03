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
    <div className="bg-white/95 rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
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
          About
        </h3>
        {isViewingOwnProfile && !isEditing && (
          <button
            onClick={onEdit}
            className="text-xs text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded-full font-medium flex items-center gap-1 transition-colors lg:px-2 lg:py-1 md:px-3 md:py-1.5"
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
            <span className="hidden lg:inline">Edit Profile</span>
            <span className="lg:hidden">Edit</span>
          </button>
        )}
      </div>
      
      {isViewingOwnProfile ? (
        bio?.trim() ? (
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 rounded-lg p-3">
            {bio}
          </p>
        ) : (
          <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3 lg:p-4 text-center border-2 border-dashed border-gray-200">
            <svg
              className="w-6 h-6 text-gray-400 mx-auto mb-2"
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
            <span className="hidden lg:inline">Add a short bio to tell others about yourself</span>
            <span className="lg:hidden">Click Edit to add a bio</span>
          </div>
        )
      ) : bio?.trim() ? (
        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 rounded-lg p-3">
          {bio}
        </p>
      ) : (
        <p className="text-sm text-gray-500 text-center py-4">No bio available</p>
      )}
    </div>
  );
};

export default ProfileAbout;