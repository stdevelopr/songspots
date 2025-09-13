import React from 'react';

interface ActionButtonProps {
  type: 'edit' | 'delete';
  onClick: () => void;
  ariaLabel: string;
  title: string;
  className?: string;
  children?: React.ReactNode;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  type,
  onClick,
  ariaLabel,
  title,
  className = '',
  children,
}) => {
  // cleaned logs
  
  const baseStyles = "inline-flex items-center justify-center rounded-xl text-white font-medium transition-all duration-200 border shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const typeStyles = {
    edit: "bg-blue-500/90 hover:bg-blue-600/90 active:bg-blue-700/90 border-blue-400/50 focus:ring-blue-400",
    delete: "bg-red-500/90 hover:bg-red-600/90 active:bg-red-700/90 border-red-400/50 focus:ring-red-400"
  };

  const defaultIcon = type === 'edit' ? (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ) : (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m-3 0h14" />
    </svg>
  );

  const finalClassName = `${baseStyles} ${typeStyles[type]} ${className}`;
  // cleaned logs

  return (
    <button
      type="button"
      className={finalClassName}
      onClick={onClick}
      aria-label={ariaLabel}
      title={title}
    >
      {children || defaultIcon}
    </button>
  );
};

export default ActionButton;
