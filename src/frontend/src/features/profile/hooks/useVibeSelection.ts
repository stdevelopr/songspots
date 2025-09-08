import { useState, useRef, useCallback } from 'react';
import {
  clearAllHighlights,
  applyHighlightStyles,
  removeHighlight,
  scrollToVibeElement,
  findVibeElementFallback,
} from './useVibeOperations.helpers';
import { VIBE_OPERATION_CONSTANTS } from './useVibeOperations.types';

export const useVibeSelection = () => {
  const [highlightedVibeId, setHighlightedVibeId] = useState<string | null>(null);
  const [focusedVibeId, setFocusedVibeId] = useState<string | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const spotRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const scrollAndHighlightCard = useCallback((vibeId: string) => {
    // Clear existing highlights on cards
    clearAllHighlights(spotRefs);
    const element = spotRefs.current[vibeId];
    if (element) {
      scrollToVibeElement(element);
      applyHighlightStyles(element);
    } else {
      const fallbackElement = findVibeElementFallback(vibeId);
      if (fallbackElement) {
        scrollToVibeElement(fallbackElement);
        applyHighlightStyles(fallbackElement);
      }
    }
  }, []);

  // List item click: first click highlights, second click focuses map
  const handleListItemClick = useCallback(
    (vibeId: string, onRestoreBounds?: () => void) => {
      if (highlightedVibeId === vibeId) {
        // Second click -> focus
        setFocusedVibeId(vibeId);
        // Keep card visually emphasized
        scrollAndHighlightCard(vibeId);
      } else {
        // First click -> highlight
        // If we had a focused vibe and are switching to a different vibe, restore bounds
        if (focusedVibeId && focusedVibeId !== vibeId && onRestoreBounds) {
          onRestoreBounds();
        }
        setFocusedVibeId(null);
        setHighlightedVibeId(vibeId);
        scrollAndHighlightCard(vibeId);
      }
    },
    [highlightedVibeId, focusedVibeId, scrollAndHighlightCard]
  );

  // Map marker click: just sync list highlight and scroll; do not change focus
  const handleMapMarkerClick = useCallback(
    (vibeId: string) => {
      setHighlightedVibeId(vibeId);
      // Do not modify focused state on map marker click
      scrollAndHighlightCard(vibeId);
    },
    [scrollAndHighlightCard]
  );

  const resetSelection = useCallback(() => {
    setHighlightedVibeId(null);
    setFocusedVibeId(null);
    // Also clear visual highlights in the list
    clearAllHighlights(spotRefs);
  }, []);

  return {
    // States
    highlightedVibeId,
    focusedVibeId,
    isScrolling,
    setIsScrolling,
    spotRefs,

    // Handlers
    handleListItemClick,
    handleMapMarkerClick,
    resetSelection,
  };
};
