import React from 'react';
import { getMoodById } from '@common/types/moods';
import type { Pin, Vibe } from '../../../map/types/map';

interface VibeSelectionModalProps {
  vibes: (Pin | Vibe)[];
  isOpen: boolean;
  onClose: () => void;
  onVibeSelect: (vibe: Pin | Vibe) => void;
  title?: string;
}

export const VibeSelectionModal: React.FC<VibeSelectionModalProps> = ({
  vibes,
  isOpen,
  onClose,
  onVibeSelect,
  title = "Multiple spots at this location"
}) => {
  if (!isOpen || !vibes.length) return null;

  const handleVibeClick = (vibe: Pin | Vibe) => {
    onVibeSelect(vibe);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      onClick={onClose}
      onKeyDown={handleKeyDown}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Choose which spot you want to view:
          </p>
        </div>

        {/* Content */}
        <div className="max-h-96 overflow-y-auto">
          <div className="p-4 space-y-3">
            {vibes.map((vibe, index) => {
              const mood = vibe.mood ? getMoodById(vibe.mood) : null;
              const displayName = vibe.name || `Unnamed Spot ${index + 1}`;
              
              return (
                <button
                  key={vibe.id}
                  onClick={() => handleVibeClick(vibe)}
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 hover:border-gray-300 transition-all duration-200 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {mood && (
                          <div className="flex items-center gap-1">
                            <span className="text-lg">{mood.emoji}</span>
                            <span className="text-xs text-gray-500">{mood.name}</span>
                          </div>
                        )}
                        {vibe.isPrivate && (
                          <div className="flex items-center justify-center w-6 h-6 bg-yellow-100 rounded-full">
                            <svg className="w-3 h-3 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                      
                      <h3 className="text-base font-semibold text-gray-900 mb-1">
                        {displayName}
                      </h3>
                      
                      {vibe.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {vibe.description}
                        </p>
                      )}
                    </div>
                    
                    <div className="ml-3 flex-shrink-0">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VibeSelectionModal;