import React from 'react';

interface HeaderProps {
  title: string;
  onClose?: () => void;
  size?: 'sm' | 'md';
}

const Header: React.FC<HeaderProps> = ({ title, onClose, size = 'md' }) => {
  const isSmall = size === 'sm';
  return (
    <div
      className={
        isSmall
          ? 'h-14 w-full relative rounded-t-2xl flex items-center justify-between px-4 py-3 bg-gradient-to-r from-white/30 via-white/20 to-white/10 border-b border-white/30 flex-shrink-0'
          : 'h-12 w-full relative rounded-t-2xl flex items-center justify-between px-6 py-3 bg-gradient-to-r from-white/30 via-white/20 to-white/10 border-b border-white/30'
      }
    >
      <h3 className={isSmall ? 'text-base font-semibold text-gray-900 truncate flex-1 pr-2' : 'text-lg font-semibold text-gray-900 truncate flex-1 pr-3'}>
        {title}
      </h3>
      {onClose && (
        <button
          className={
            isSmall
              ? 'cursor-pointer bg-white text-gray-700 hover:bg-gray-50 transition-all duration-200 rounded-full w-8 h-8 flex items-center justify-center shadow-md border border-gray-200 focus:outline-none flex-shrink-0 ml-2'
              : 'cursor-pointer bg-white text-gray-700 hover:bg-gray-50 transition-colors rounded-full w-9 h-9 flex items-center justify-center shadow-md border border-gray-200 focus:outline-none flex-shrink-0 ml-3'
          }
          onClick={onClose}
          aria-label="Close"
          title="Close"
        >
          <svg className={isSmall ? 'h-4 w-4' : 'h-5 w-5'} viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M6 6L18 18M6 18L18 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default Header;

