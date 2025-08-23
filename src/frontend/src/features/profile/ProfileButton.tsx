interface ProfileButtonProps {
  onProfileClick: () => void;
  currentView: 'map' | 'profile';
}

const ProfileButton: React.FC<ProfileButtonProps> = ({ onProfileClick }) => {
  return (
    <button
      onClick={onProfileClick}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full
                 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900
                 border border-white/20 shadow-md
                 hover:shadow-lg hover:brightness-110 active:scale-[0.98]
                 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 transition-all"
      aria-label="Profile"
    >
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/95 border border-zinc-200">
        <svg
          className="h-4 w-4 text-indigo-700"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0z" />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      </span>
    </button>
  );
};

export default ProfileButton;
