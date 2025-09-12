import React from 'react';
import { BottomSheet } from './BottomSheet';

interface ActionSheetOption {
  label: string;
  action: () => void;
  style?: 'default' | 'destructive' | 'cancel';
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface ActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  options: ActionSheetOption[];
}

export const ActionSheet: React.FC<ActionSheetProps> = ({
  isOpen,
  onClose,
  title,
  message,
  options,
}) => {
  const handleOptionClick = (option: ActionSheetOption) => {
    if (!option.disabled) {
      option.action();
    }
  };

  const getButtonClass = (style?: string) => {
    const baseClass =
      'w-full touch-target text-mobile-base font-medium transition-colors rounded-lg';

    switch (style) {
      case 'destructive':
        return `${baseClass} bg-red-50 text-red-600 border border-red-200 hover:bg-red-100`;
      case 'cancel':
        return `${baseClass} mobile-button-secondary`;
      default:
        return `${baseClass} mobile-button`;
    }
  };

  const regularOptions = options.filter((option) => option.style !== 'cancel');
  const cancelOptions = options.filter((option) => option.style === 'cancel');

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      snapPoints={[0.9]}
      initialSnapPoint={0}
      showHandle={true}
      closeOnOverlayClick={true}
      className="vibe-animate-scale-in"
    >
      <div className="space-y-4">
        {/* Header */}
        {(title || message) && (
          <div className="text-center space-y-2 px-4 vibe-animate-fade-up">
            {title && <h2 className="text-mobile-lg font-bold text-gray-900">{title}</h2>}
            {message && <p className="text-mobile-base text-gray-600 leading-relaxed">{message}</p>}
          </div>
        )}

        {/* Regular Options */}
        {regularOptions.length > 0 && (
          <div className="space-y-3">
            {regularOptions.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionClick(option)}
                disabled={option.disabled}
                className={`${getButtonClass(option.style)} ${
                  option.disabled ? 'opacity-50 cursor-not-allowed' : ''
                } vibe-animate-fade-up vibe-hover-lift vibe-ripple-container`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center justify-center gap-2">
                  {option.icon && <span className="flex-shrink-0">{option.icon}</span>}
                  <span>{option.label}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Separator */}
        {regularOptions.length > 0 && cancelOptions.length > 0 && (
          <div className="border-t border-gray-200 my-4" />
        )}

        {/* Cancel Options */}
        {cancelOptions.length > 0 && (
          <div className="space-y-3">
            {cancelOptions.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionClick(option)}
                disabled={option.disabled}
                className={`${getButtonClass(option.style)} ${
                  option.disabled ? 'opacity-50 cursor-not-allowed' : ''
                } vibe-animate-fade-up vibe-hover-lift vibe-ripple-container`}
                style={{ animationDelay: `${(regularOptions.length + index) * 50}ms` }}
              >
                <div className="flex items-center justify-center gap-2">
                  {option.icon && <span className="flex-shrink-0">{option.icon}</span>}
                  <span>{option.label}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Bottom spacing for safe area */}
        <div className="pb-safe" />
      </div>
    </BottomSheet>
  );
};

export default ActionSheet;
