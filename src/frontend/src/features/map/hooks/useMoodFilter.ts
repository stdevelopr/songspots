import { useState, useMemo, useCallback } from 'react';
import { MoodType } from '../../common/types/moods';

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

  const dominantMood = useMemo(() => {
    if (hasActiveFilters && selectedMoods.size === 1) {
      // If only one mood is selected, use that
      return Array.from(selectedMoods)[0];
    } else if (hasActiveFilters && selectedMoods.size > 1) {
      // If multiple moods selected, find the one with most filtered pins
      let maxCount = 0;
      let dominant: MoodType | undefined;
      Array.from(selectedMoods).forEach(mood => {
        const count = filteredPins.filter(pin => pin.mood === mood).length;
        if (count > maxCount) {
          maxCount = count;
          dominant = mood;
        }
      });
      return dominant;
    } else {
      // No filters active, find overall dominant mood
      let maxCount = 0;
      let dominant: MoodType | undefined;
      moodCounts.forEach((count, mood) => {
        if (count > maxCount) {
          maxCount = count;
          dominant = mood;
        }
      });
      return maxCount > 0 ? dominant : undefined;
    }
  }, [hasActiveFilters, selectedMoods, filteredPins, moodCounts]);

  return {
    selectedMoods,
    toggleMood,
    clearAllFilters,
    showAllPins,
    filteredPins,
    hasActiveFilters,
    moodCounts,
    dominantMood,
    totalPins: pins.length,
    visiblePins: filteredPins.length,
  };
};

export default useMoodFilter;