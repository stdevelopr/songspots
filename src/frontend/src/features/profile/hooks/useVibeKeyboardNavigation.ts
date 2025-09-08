import { useEffect } from 'react';
import { handleKeyboardNavigation } from './useVibeOperations.helpers';
import type { Vibe } from './useVibeOperations.types';

interface UseVibeKeyboardNavigationProps {
  visibleVibes: Vibe[];
  selectedVibeId: string | null;
  onVibeClick: (vibeId: string, onRestoreBounds?: () => void) => void;
}

export const useVibeKeyboardNavigation = ({
  visibleVibes,
  selectedVibeId,
  onVibeClick
}: UseVibeKeyboardNavigationProps) => {
  useEffect(() => {
    if (visibleVibes.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      handleKeyboardNavigation(e, visibleVibes, selectedVibeId, onVibeClick);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedVibeId, visibleVibes, onVibeClick]);
};