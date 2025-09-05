import {
  PIN_HIGHLIGHT_STYLES,
  PIN_OPERATION_CONSTANTS,
  SELECTED_INDICATOR_HTML,
  type Pin,
} from './usePinOperations.types';

/**
 * Clears all highlight styles from pin elements
 */
export const clearAllHighlights = (
  spotRefs: React.MutableRefObject<{ [key: string]: HTMLDivElement | null }>
) => {
  Object.values(spotRefs.current).forEach((element) => {
    if (element) {
      element.style.transform = '';
      element.style.boxShadow = '';
      element.style.borderColor = '';
      element.style.borderWidth = '';
      element.style.background = '';
      element.style.transition = '';

      // Remove any existing indicators
      const indicators = element.querySelectorAll('.animate-spin, .selected-pin-indicator');
      indicators.forEach((indicator) => indicator.remove());
    }
  });
};

/**
 * Applies highlight styles to a pin element
 */
export const applyHighlightStyles = (element: HTMLElement) => {
  element.style.transform = PIN_HIGHLIGHT_STYLES.transform;
  element.style.boxShadow = PIN_HIGHLIGHT_STYLES.boxShadow;
  element.style.borderColor = PIN_HIGHLIGHT_STYLES.borderColor;
  element.style.borderWidth = PIN_HIGHLIGHT_STYLES.borderWidth;
  element.style.background = PIN_HIGHLIGHT_STYLES.background;
  element.style.transition = PIN_HIGHLIGHT_STYLES.transition;
  element.style.position = 'relative';
};

/**
 * Creates and adds a selected indicator to a pin element
 */
export const addSelectedIndicator = (element: HTMLElement) => {
  const selectedIndicator = document.createElement('div');
  selectedIndicator.className =
    'selected-pin-indicator absolute top-2 left-2 flex items-center gap-1 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg';
  selectedIndicator.innerHTML = SELECTED_INDICATOR_HTML;
  selectedIndicator.style.zIndex = PIN_OPERATION_CONSTANTS.HIGHLIGHT_Z_INDEX;
  element.appendChild(selectedIndicator);
};

/**
 * Removes highlight styles and indicators from an element
 */
export const removeHighlight = (element: HTMLElement) => {
  element.style.transform = '';
  element.style.boxShadow = '';
  element.style.borderColor = '';
  element.style.borderWidth = '';
  element.style.background = '';
  element.style.transition = '';

  const indicator = element.querySelector('.selected-pin-indicator');
  if (indicator) {
    indicator.remove();
  }
};

/**
 * Scrolls to a pin element with appropriate behavior based on screen size
 */
export const scrollToPinElement = (element: HTMLElement) => {
  const isMobile = window.innerWidth < PIN_OPERATION_CONSTANTS.MOBILE_BREAKPOINT;
  element.scrollIntoView({
    behavior: 'smooth',
    block: isMobile ? 'start' : 'center',
    inline: 'nearest',
  });
};

/**
 * Tries to find a pin element using fallback methods
 */
export const findPinElementFallback = (pinId: string): HTMLElement | null => {
  const fallbackElement = document.querySelector(`[data-pin-id="${pinId}"]`) as HTMLElement;
  return fallbackElement;
};

/**
 * Gets the next pin index for keyboard navigation
 */
export const getNextPinIndex = (
  currentIndex: number,
  totalPins: number,
  direction: 'up' | 'down' | 'home' | 'end'
): number => {
  switch (direction) {
    case 'up':
      return currentIndex > 0 ? currentIndex - 1 : totalPins - 1;
    case 'down':
      return currentIndex < totalPins - 1 ? currentIndex + 1 : 0;
    case 'home':
      return 0;
    case 'end':
      return totalPins - 1;
    default:
      return currentIndex;
  }
};

/**
 * Handles keyboard navigation for pin selection
 */
export const handleKeyboardNavigation = (
  e: KeyboardEvent,
  visiblePins: Pin[],
  selectedPinId: string | null,
  onPinClick: (pinId: string, onRestoreBounds?: () => void) => void
) => {
  if (!visiblePins.length) return;

  const currentIndex = selectedPinId
    ? visiblePins.findIndex((pin) => pin.id.toString() === selectedPinId)
    : -1;

  let direction: 'up' | 'down' | 'home' | 'end' | null = null;

  switch (e.key) {
    case 'ArrowUp':
      e.preventDefault();
      direction = 'up';
      break;
    case 'ArrowDown':
      e.preventDefault();
      direction = 'down';
      break;
    case 'Home':
      e.preventDefault();
      direction = 'home';
      break;
    case 'End':
      e.preventDefault();
      direction = 'end';
      break;
    default:
      return;
  }

  if (direction) {
    const nextIndex = getNextPinIndex(currentIndex, visiblePins.length, direction);
    if (nextIndex !== currentIndex && nextIndex >= 0) {
      onPinClick(visiblePins[nextIndex].id.toString());
    }
  }
};
