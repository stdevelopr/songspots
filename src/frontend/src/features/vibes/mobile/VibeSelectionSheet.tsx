import React from 'react';
import { BottomSheet } from '../../../components/mobile/BottomSheet';
import { getMoodById } from '@common/types/moods';
import type { Pin, Vibe } from '../../map/types/map';

interface VibeSelectionSheetProps {
  vibes: (Pin | Vibe)[];
  isOpen: boolean;
  onClose: () => void;
  onVibeSelect: (vibe: Pin | Vibe) => void;
  title?: string;
}

export const VibeSelectionSheet: React.FC<VibeSelectionSheetProps> = ({
  vibes,
  isOpen,
  onClose,
  onVibeSelect,
  title = "Multiple spots at this location"
}) => {
  if (!vibes.length) return null;

  const handleVibeClick = (vibe: Pin | Vibe) => {
    onVibeSelect(vibe);
    onClose();
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      snapPoints={[0.7]}
      initialSnapPoint={0}
      showHandle={true}
      closeOnOverlayClick={true}
    >
      <div className="space-y-3">
        <p className="text-mobile-sm text-gray-600 mb-4">
          Choose which spot you want to view:
        </p>
        
        {vibes.map((vibe, index) => {
          const mood = vibe.mood ? getMoodById(vibe.mood) : null;
          const displayName = vibe.name || `Unnamed Spot ${index + 1}`;
          
          return (
            <button
              key={vibe.id}
              onClick={() => handleVibeClick(vibe)}
              className="w-full p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-left touch-target"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {mood && (
                      <div className="flex items-center gap-1">
                        <span className="text-lg">{mood.emoji}</span>
                        <span className="text-mobile-xs text-gray-500">{mood.name}</span>
                      </div>
                    )}
                    {vibe.isPrivate && (
                      <div className="flex items-center justify-center w-6 h-6 bg-yellow-100 rounded-full">
                        <svg className="w-3 h-3 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 616 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-mobile-base font-semibold text-gray-900 mb-1">
                    {displayName}
                  </h3>
                  {('address' in vibe) && (vibe as any).address && (
                    <p className="text-mobile-xs text-gray-600 truncate mb-1">{(vibe as any).address}</p>
                  )}
                  
                  {vibe.description && (
                    <p className="text-mobile-sm text-gray-600 line-clamp-2">
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
        
        {/* Bottom spacing for safe area */}
        <div className="pb-safe" />
      </div>
    </BottomSheet>
  );
};

export default VibeSelectionSheet;
