import { useState, useMemo, useCallback } from 'react';
import { MoodType } from '@common/types/moods';

interface PinWithMood {
  mood?: MoodType;
  [key: string]: any;
}

export const useMoodFilter = <T extends PinWithMood>(pins: T[]) => {
  const [selectedMoods, setSelectedMoods] = useState<Set<MoodType>>(new Set());

  const toggleMood = useCallback((mood: MoodType) => {
    setSelectedMoods(prev => {
      const newSet = new Set(prev);
      if (newSet.has(mood)) {
        newSet.delete(mood);
      } else {
        newSet.add(mood);
      }
      return newSet;
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setSelectedMoods(new Set());
  }, []);

  const showAllPins = useCallback(() => {
    setSelectedMoods(new Set());
  }, []);

  const filteredPins = useMemo(() => {
    if (selectedMoods.size === 0) {
      return pins; // Show all pins when no filters are active
    }

    return pins.filter(pin => {
      // Show pins that have a mood matching the selected filters
      if (pin.mood && selectedMoods.has(pin.mood)) {
        return true;
      }
      
      // Optionally, also show pins without a mood when filtering
      // You can comment out this line if you want to hide pins without moods during filtering
      return !pin.mood && selectedMoods.size > 0 ? false : false;
    });
  }, [pins, selectedMoods]);

  const hasActiveFilters = selectedMoods.size > 0;
  
  const moodCounts = useMemo(() => {
    const counts = new Map<MoodType, number>();
    pins.forEach(pin => {
      if (pin.mood) {
        counts.set(pin.mood, (counts.get(pin.mood) || 0) + 1);
      }
    });
    return counts;
  }, [pins]);

  return {
    selectedMoods,
    toggleMood,
    clearAllFilters,
    showAllPins,
    filteredPins,
    hasActiveFilters,
    moodCounts,
    totalPins: pins.length,
    visiblePins: filteredPins.length,
  };
};

export default useMoodFilter;