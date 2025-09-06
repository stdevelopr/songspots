import React from 'react';

interface PinActionButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  color?: 'edit' | 'delete';
  className?: string;
}

const colorMap = {
  edit: 'w-full px-4 py-2 rounded-lg font-semibold shadow transition text-base bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 cursor-pointer',
  delete:
    'w-full px-4 py-2 rounded-lg font-semibold shadow transition text-base bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 cursor-pointer',
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
