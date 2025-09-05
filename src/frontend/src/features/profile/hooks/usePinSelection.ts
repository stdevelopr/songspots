import { useState, useRef, useCallback } from 'react';
import {
  clearAllHighlights,
  applyHighlightStyles,
  removeHighlight,
  scrollToPinElement,
  findPinElementFallback,
} from './usePinOperations.helpers';
import { PIN_OPERATION_CONSTANTS } from './usePinOperations.types';

export const usePinSelection = () => {
  const [highlightedPinId, setHighlightedPinId] = useState<string | null>(null);
  const [focusedPinId, setFocusedPinId] = useState<string | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const spotRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const scrollAndHighlightCard = useCallback((pinId: string) => {
    // Clear existing highlights on cards
    clearAllHighlights(spotRefs);
    const element = spotRefs.current[pinId];
    if (element) {
      scrollToPinElement(element);
      applyHighlightStyles(element);
    } else {
      const fallbackElement = findPinElementFallback(pinId);
      if (fallbackElement) {
        scrollToPinElement(fallbackElement);
        applyHighlightStyles(fallbackElement);
      }
    }
  }, []);

  // List item click: first click highlights, second click focuses map
  const handleListItemClick = useCallback(
    (pinId: string, onRestoreBounds?: () => void) => {
      if (highlightedPinId === pinId) {
        // Second click -> focus
        setFocusedPinId(pinId);
        // Keep card visually emphasized
        scrollAndHighlightCard(pinId);
      } else {
        // First click -> highlight
        // If we had a focused pin and are switching to a different pin, restore bounds
        if (focusedPinId && focusedPinId !== pinId && onRestoreBounds) {
          onRestoreBounds();
        }
        setFocusedPinId(null);
        setHighlightedPinId(pinId);
        scrollAndHighlightCard(pinId);
      }
    },
    [highlightedPinId, focusedPinId, scrollAndHighlightCard]
  );

  // Map marker click: just sync list highlight and scroll; do not change focus
  const handleMapMarkerClick = useCallback(
    (pinId: string) => {
      setHighlightedPinId(pinId);
      // Do not modify focused state on map marker click
      scrollAndHighlightCard(pinId);
    },
    [scrollAndHighlightCard]
  );

  const resetSelection = useCallback(() => {
    setHighlightedPinId(null);
    setFocusedPinId(null);
    // Also clear visual highlights in the list
    clearAllHighlights(spotRefs);
  }, []);

  return {
    // States
    highlightedPinId,
    focusedPinId,
    isScrolling,
    setIsScrolling,
    spotRefs,

    // Handlers
    handleListItemClick,
    handleMapMarkerClick,
    resetSelection,
  };
};
