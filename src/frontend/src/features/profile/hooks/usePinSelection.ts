import { useState, useRef, useCallback } from 'react';
import {
  clearAllHighlights,
  applyHighlightStyles,
  addSelectedIndicator,
  removeHighlight,
  scrollToPinElement,
  findPinElementFallback
} from './usePinOperations.helpers';
import { PIN_OPERATION_CONSTANTS } from './usePinOperations.types';

export const usePinSelection = () => {
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const spotRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const handlePinClick = useCallback((pinId: string) => {
    console.log('Pin clicked, scrolling to:', pinId);
    
    setSelectedPinId(pinId);
    
    // Clear existing highlights
    clearAllHighlights(spotRefs);
    
    // Find the target element
    const element = spotRefs.current[pinId];
    
    if (element) {
      console.log('Found element, scrolling to:', element);
      
      // Scroll to element
      scrollToPinElement(element);
      
      // Apply highlight styles
      applyHighlightStyles(element);
      
      // Add selected indicator
      addSelectedIndicator(element);
      
      // Remove highlight after duration
      setTimeout(() => {
        if (element) {
          removeHighlight(element);
        }
      }, PIN_OPERATION_CONSTANTS.HIGHLIGHT_DURATION);
      
    } else {
      console.warn('No element ref found for pinId:', pinId);
      
      // Try fallback method
      const fallbackElement = findPinElementFallback(pinId);
      if (fallbackElement) {
        scrollToPinElement(fallbackElement);
      }
    }
  }, []);

  return {
    selectedPinId,
    setSelectedPinId,
    isScrolling,
    setIsScrolling,
    spotRefs,
    handlePinClick,
  };
};