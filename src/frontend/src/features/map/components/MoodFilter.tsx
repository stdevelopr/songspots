import React from 'react';
import { MoodType, getAllMoods } from '@common/types/moods';

interface MoodFilterProps {
  selectedMoods: Set<MoodType>;
  onMoodToggle: (mood: MoodType) => void;
  onClearAll: () => void;
  onShowAll: () => void;
  className?: string;
}

export const MoodFilter: React.FC<MoodFilterProps> = ({
  selectedMoods,
  onMoodToggle,
  onClearAll,
  onShowAll,
  className = '',
}) => {
  const moods = getAllMoods();
  const hasFilters = selectedMoods.size > 0;

  return (
    <div className={`mood-filter bg-white border-b border-gray-200 ${className}`}>
      {/* Mobile-first horizontal scrollable filter bar */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
          {/* Filter indicator */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-lg">🎭</span>
            <span className="text-sm font-medium text-gray-700 hidden sm:block">
              Filter:
            </span>
          </div>

          {/* Mood filter chips */}
          <div className="flex gap-2 flex-shrink-0">
            {moods.map((mood) => {
              const isSelected = selectedMoods.has(mood.id);
              return (
                <button
                  key={mood.id}
                  onClick={() => onMoodToggle(mood.id)}
                  className={`mood-chip flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    isSelected
                      ? 'text-white shadow-md transform scale-105'
                      : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                  }`}
                  style={{
                    backgroundColor: isSelected ? mood.colors.primary : undefined,
                  }}
                  title={mood.description}
                >
                  <span className="text-base">{mood.emoji}</span>
                  <span className="text-xs sm:text-sm">{mood.name}</span>
                </button>
              );
            })}
          </div>

          {/* Clear filters chip - only show when filters are active */}
          {hasFilters && (
            <>
              <div className="w-px h-6 bg-gray-300 flex-shrink-0" />
              <button
                onClick={onClearAll}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors whitespace-nowrap flex-shrink-0"
              >
                <span className="text-base">✕</span>
                <span className="text-xs sm:text-sm">Clear</span>
                <span className="bg-gray-500 text-white text-xs rounded-full px-1.5 py-0.5 ml-1">
                  {selectedMoods.size}
                </span>
              </button>
            </>
          )}

          {/* Show all chip - always visible as a reset option */}
          <button
            onClick={onShowAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors whitespace-nowrap flex-shrink-0"
          >
            <span className="text-base">🎯</span>
            <span className="text-xs sm:text-sm">All</span>
          </button>
        </div>
      </div>

      {/* Active filter indicator for mobile */}
      {hasFilters && (
        <div className="px-4 pb-2">
          <div className="text-xs text-gray-500">
            Showing {selectedMoods.size} mood filter{selectedMoods.size !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  );
};

export default MoodFilter;