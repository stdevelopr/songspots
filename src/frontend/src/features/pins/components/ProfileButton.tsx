import React from 'react';

interface ProfileButtonProps {
  label: string;
  onClick: () => void;
  fullWidth?: boolean;
  className?: string;
}

const ProfileButton: React.FC<ProfileButtonProps> = ({ label, onClick, fullWidth = false, className = '' }) => {
  const base = 'inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500/90 text-white font-semibold py-3 px-6 hover:bg-indigo-600/90 active:bg-indigo-700/90 transition-all duration-200 border border-indigo-400/50 shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2';
  return (
    <button type="button" className={`${base} ${fullWidth ? 'w-full' : ''} ${className}`} onClick={onClick}>
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
      <span className="text-base">{label}</span>
    </button>
  );
};

export default ProfileButton;

