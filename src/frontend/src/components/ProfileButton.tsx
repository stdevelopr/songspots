import React from 'react';

interface ProfileButtonProps {
  onProfileClick: () => void;
  currentView: 'map' | 'profile';
}

const ProfileButton: React.FC<ProfileButtonProps> = ({ onProfileClick, currentView }) => {
  return (
    <button
      onClick={onProfileClick}
      className={`flex items-center space-x-2 px-4 py-1.5 rounded-full transition-colors text-sm font-medium ${
        currentView === 'profile'
          ? 'bg-white bg-opacity-30 text-white backdrop-blur-sm'
          : 'bg-white bg-opacity-20 hover:bg-opacity-30 text-white backdrop-blur-sm'
      }`}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
      <span>Profile</span>
    </button>
  );
};

export default ProfileButton;
