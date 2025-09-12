import React, { useState, useRef } from 'react';
import { MoodType, getAllMoods } from '../../common/types/moods';
import { BottomSheet } from '../../../components/mobile/BottomSheet';
import { FloatingActionButton } from '../../../components/mobile/FloatingActionButton';
import { haptics } from '../../../utils/haptics';

interface FilterDrawerProps {
  selectedMoods: Set<MoodType>;
  onMoodToggle: (mood: MoodType) => void;
  onClearAll: () => void;
  onShowAll: () => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  selectedMoods,
  onMoodToggle,
  onClearAll,
  onShowAll,
  isOpen: externalIsOpen,
  onOpenChange,
  className = '',
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [interactionsDisabled, setInteractionsDisabled] = useState(false);
  const openTimeRef = React.useRef<number>(0);
  
  // Prevent accidental clicks using a time-based approach
  React.useEffect(() => {
    const isCurrentlyOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
    
    if (isCurrentlyOpen) {
      openTimeRef.current = Date.now();
      setInteractionsDisabled(true);
      
      // Allow interactions after sufficient delay
      const timer = setTimeout(() => {
        setInteractionsDisabled(false);
      }, 800); // Longer delay to ensure all animations and events settle
      
      return () => clearTimeout(timer);
    } else {
      setInteractionsDisabled(false);
      openTimeRef.current = 0;
    }
  }, [externalIsOpen, internalIsOpen]);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = onOpenChange || setInternalIsOpen;
  const moods = getAllMoods();
  const hasFilters = selectedMoods.size > 0;

  const handleToggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  const handleMoodToggle = (mood: MoodType) => {
    const wasSelected = selectedMoods.has(mood);
    onMoodToggle(mood);
    
    // Provide haptic feedback based on action
    if (wasSelected) {
      haptics.tap(); // Light feedback when deselecting
    } else {
      haptics.buttonPress(); // Stronger feedback when selecting
    }
  };

  const handleClearAll = () => {
    onClearAll();
    setIsOpen(false);
  };

  const handleShowAll = () => {
    onShowAll();
    setIsOpen(false);
  };

  const handleClose = () => {
    // Close without applying any filter actions
    setIsOpen(false);
  };

  return (
    <>
      {/* Filter FAB - only show when not controlled externally */}
      {externalIsOpen === undefined && (
        <FloatingActionButton
          icon={
            <div className="relative">
              <span className="text-xl">🎭</span>
              {hasFilters && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
              )}
            </div>
          }
          onClick={handleToggleDrawer}
          label="Mood Filters"
          variant="secondary"
          position="bottom-left"
          badge={hasFilters ? selectedMoods.size : undefined}
          className={`pb-safe pl-safe ${className}`}
        />
      )}

      {/* Filter Drawer */}
      <BottomSheet
        isOpen={isOpen}
        onClose={handleClose}
        title="Filter by Mood"
        snapPoints={[0.9]}
        initialSnapPoint={0}
        showHandle={true}
        closeOnOverlayClick={true}
        aria-describedby="filter-instructions"
      >
        <div className="space-y-6 max-h-full overflow-y-auto px-1">
          {/* Screen reader instructions */}
          <div id="filter-instructions" className="sr-only">
            Use the following buttons to filter vibe spots by mood. Selected moods will highlight in color with a checkmark.
          </div>
          
          {/* Active filters summary */}
          {hasFilters && (
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-mobile-base font-medium text-blue-900">Active Filters</h4>
                <button
                  onClick={handleClearAll}
                  className="text-mobile-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Clear All
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {Array.from(selectedMoods).map((moodId) => {
                  const mood = moods.find((m) => m.id === moodId);
                  if (!mood) return null;

                  return (
                    <button
                      key={moodId}
                      onClick={() => handleMoodToggle(moodId)}
                      className="flex items-center gap-1 px-3 py-1 rounded-full text-white text-mobile-sm font-medium"
                      style={{ backgroundColor: mood.colors.primary }}
                    >
                      <span>{mood.emoji}</span>
                      <span>{mood.name}</span>
                      <span className="text-white/80">×</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Mood selection grid */}
          <div className="space-y-4">
            <h4 className="text-mobile-lg font-semibold text-gray-900">Choose Moods</h4>

            <div className="grid grid-cols-2 gap-3 px-1">
              {moods.map((mood) => {
                const isSelected = selectedMoods.has(mood.id);

                return (
                  <button
                    key={mood.id}
                    onClick={(e) => {
                      const timeSinceOpen = Date.now() - openTimeRef.current;
                      
                      // Prevent clicks if interactions are disabled OR if it's too soon after opening
                      if (interactionsDisabled || timeSinceOpen < 800) {
                        e.preventDefault();
                        e.stopPropagation();
                        return;
                      }
                      
                      handleMoodToggle(mood.id);
                    }}
                    className={`
                      touch-target p-4 rounded-xl border-2 transition-all duration-200
                      active:scale-95 transform-gpu
                      ${interactionsDisabled ? 'pointer-events-none' : ''}
                      ${
                        isSelected
                          ? 'border-2 shadow-md ring-2 ring-opacity-30 ring-inset'
                          : 'border border-gray-200 hover:border-gray-300 hover:shadow-md active:shadow-lg'
                      }
                    `}
                    style={{
                      borderColor: isSelected ? mood.colors.primary : undefined,
                      backgroundColor: isSelected ? `${mood.colors.primary}15` : 'white',
                      ...(isSelected && {
                        '--tw-ring-color': mood.colors.primary,
                      } as React.CSSProperties),
                    }}
                    role="checkbox"
                    aria-checked={isSelected}
                    aria-label={`${mood.name} mood filter. ${mood.description}${isSelected ? '. Currently selected' : '. Not selected'}`}
                  >
                    <div className="text-center space-y-2">
                      <div className="text-3xl">{mood.emoji}</div>
                      <div className="text-mobile-base font-medium text-gray-900">{mood.name}</div>
                      <div className="text-mobile-sm text-gray-600">{mood.description}</div>

                      {/* Selection indicator */}
                      {isSelected && (
                        <div className="flex justify-center">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: mood.colors.primary }}
                          >
                            <svg
                              className="w-4 h-4 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleShowAll}
              className="w-full mobile-button-secondary touch-target text-mobile-base font-medium"
            >
              <span className="mr-2">🎯</span>
              Show All Spots
            </button>

            {hasFilters && (
              <button
                onClick={handleClearAll}
                className="w-full mobile-button touch-target text-mobile-base font-medium"
              >
                Clear All Filters
              </button>
            )}
          </div>

          {/* Filter statistics */}
          <div className="text-center pt-4 border-t border-gray-100">
            <p className="text-mobile-sm text-gray-500">
              {hasFilters
                ? `Filtering by ${selectedMoods.size} mood${selectedMoods.size !== 1 ? 's' : ''}`
                : 'No filters active - showing all spots'}
            </p>
          </div>
        </div>
      </BottomSheet>
    </>
  );
};

export default FilterDrawer;
