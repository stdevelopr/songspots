import React from 'react';

type IconVariantProps = {
  variant: 'icon';
  onProfileClick: () => void;
};

type CtaVariantProps = {
  variant?: 'cta';
  label: string;
  onClick: () => void;
  fullWidth?: boolean;
  className?: string;
};

export type ProfileButtonProps = IconVariantProps | CtaVariantProps;

export const ProfileButton: React.FC<ProfileButtonProps> = (props) => {
  if (props.variant === 'icon') {
    const { onProfileClick } = props;
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
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </span>
      </button>
    );
  }

  const { label, onClick, fullWidth = false, className = '' } = props;
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500/90 text-white font-semibold py-3 px-6 hover:bg-indigo-600/90 active:bg-indigo-700/90 transition-all duration-200 border border-indigo-400/50 shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2';

  return (
    <button
      type="button"
      className={`${base} ${fullWidth ? 'w-full' : ''} ${className}`}
      onClick={onClick}
    >
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
      <span className="text-base">{label}</span>
    </button>
  );
};

export default ProfileButton;

