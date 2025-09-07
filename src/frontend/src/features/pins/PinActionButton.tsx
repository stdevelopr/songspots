import React from 'react';

interface PinActionButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  color?: 'edit' | 'delete';
  className?: string;
  variant?: 'solid' | 'icon';
  ariaLabel?: string;
  title?: string;
}

const solidColors = {
  edit:
    'w-full px-4 py-2 rounded-lg font-semibold shadow transition text-base bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 cursor-pointer',
  delete:
    'w-full px-4 py-2 rounded-lg font-semibold shadow transition text-base bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 cursor-pointer',
};

const iconColors = {
  edit:
    'w-9 h-9 rounded-full flex items-center justify-center shadow transition bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 cursor-pointer',
  delete:
    'w-9 h-9 rounded-full flex items-center justify-center shadow transition bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 cursor-pointer',
};

const PinActionButton: React.FC<PinActionButtonProps> = ({
  onClick,
  children,
  color = 'edit',
  className = '',
  variant = 'solid',
  ariaLabel,
  title,
}) => {
  const base = variant === 'icon' ? iconColors[color] : solidColors[color];
  return (
    <button
      type="button"
      className={`${base} ${className}`}
      onClick={onClick}
      aria-label={ariaLabel}
      title={title}
    >
      {children}
    </button>
  );
};

export default PinActionButton;
