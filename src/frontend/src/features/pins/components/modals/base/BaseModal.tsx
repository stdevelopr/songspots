import React from 'react';

interface BaseModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg';
  className?: string;
}

const BaseModal: React.FC<BaseModalProps> = ({
  isOpen,
  title,
  onClose,
  children,
  maxWidth = 'md',
  className = '',
}) => {
  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-sm sm:max-w-md',
    lg: 'max-w-sm sm:max-w-lg',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[2000] flex items-center justify-center p-2 sm:p-4">
      <div
        className={`bg-white rounded-lg shadow-xl w-full ${maxWidthClasses[maxWidth]} mx-auto max-h-[95vh] sm:max-h-[90vh] overflow-y-auto flex flex-col ${className}`}
      >
        <div className="p-3 sm:p-4">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default BaseModal;