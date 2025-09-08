import React from 'react';
import { MoodType, getAllMoods } from '../../common/types/moods';

interface MoodSelectorProps {
  selectedMood?: MoodType;
  onMoodSelect: (mood: MoodType | undefined) => void;
}

const MoodSelector: React.FC<MoodSelectorProps> = ({ selectedMood, onMoodSelect }) => {
  const moods = getAllMoods();

  return (
    <div className="mood-selector">
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Choose a mood for your vibe
      </label>
      
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
        {/* Clear selection option */}
        <button
          type="button"
          onClick={() => onMoodSelect(undefined)}
          className={`mood-option ${
            !selectedMood ? 'selected' : ''
          } relative p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105`}
          style={{
            borderColor: !selectedMood ? '#4A90E2' : '#E5E7EB',
            backgroundColor: !selectedMood ? '#F0F9FF' : 'white',
          }}
        >
          <div className="text-center">
            <div className="text-2xl mb-1">🎯</div>
            <div className="text-xs font-medium text-gray-600">Default</div>
          </div>
        </button>

        {/* Mood options */}
        {moods.map((mood) => (
          <button
            key={mood.id}
            type="button"
            onClick={() => onMoodSelect(mood.id)}
            className={`mood-option ${
              selectedMood === mood.id ? 'selected' : ''
            } relative p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105`}
            style={{
              borderColor: selectedMood === mood.id ? mood.colors.primary : '#E5E7EB',
              backgroundColor: selectedMood === mood.id ? `${mood.colors.primary}15` : 'white',
            }}
            title={mood.description}
          >
            <div className="text-center">
              <div className="text-2xl mb-1">{mood.emoji}</div>
              <div className="text-xs font-medium text-gray-600">{mood.name}</div>
            </div>
            
            {/* Pin preview */}
            <div className="absolute -top-1 -right-1 opacity-75">
              <div 
                className="w-4 h-4 rounded-full border border-white shadow-sm"
                style={{ background: mood.colors.gradient }}
              />
            </div>
          </button>
        ))}
      </div>
      
      {selectedMood && (
        <div className="text-sm text-gray-600 italic">
          {getAllMoods().find(m => m.id === selectedMood)?.description}
        </div>
      )}
    </div>
  );
};

export default MoodSelector;