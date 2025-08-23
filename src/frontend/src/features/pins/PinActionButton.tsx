import React from 'react';

interface PinActionButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  color?: 'edit' | 'delete';
  className?: string;
}

const colorMap = {
  edit: 'w-full px-4 py-2 rounded-lg font-semibold shadow transition text-base bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800',
  delete:
    'w-full px-4 py-2 rounded-lg font-semibold shadow transition text-base bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200 hover:bg-rose-200 dark:hover:bg-rose-800',
};

const PinActionButton: React.FC<PinActionButtonProps> = ({
  onClick,
  children,
  color = 'edit',
  className = '',
}) => (
  <button type="button" className={`${colorMap[color]} ${className}`} onClick={onClick}>
    {children}
  </button>
);

export default PinActionButton;
