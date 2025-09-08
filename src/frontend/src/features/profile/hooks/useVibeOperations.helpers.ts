import {
  VIBE_HIGHLIGHT_STYLES,
  VIBE_OPERATION_CONSTANTS,
  SELECTED_INDICATOR_HTML,
  type Vibe,
} from './useVibeOperations.types';

/**
 * Clears all highlight styles from vibe elements
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
      const indicators = element.querySelectorAll('.animate-spin, .selected-vibe-indicator');
      indicators.forEach((indicator) => indicator.remove());
    }
  });
};

/**
 * Applies highlight styles to a vibe element
 */
export const applyHighlightStyles = (element: HTMLElement) => {
  element.style.transform = VIBE_HIGHLIGHT_STYLES.transform;
  element.style.boxShadow = VIBE_HIGHLIGHT_STYLES.boxShadow;
  element.style.borderColor = VIBE_HIGHLIGHT_STYLES.borderColor;
  element.style.borderWidth = VIBE_HIGHLIGHT_STYLES.borderWidth;
  element.style.background = VIBE_HIGHLIGHT_STYLES.background;
  element.style.transition = VIBE_HIGHLIGHT_STYLES.transition;
  element.style.position = 'relative';
};

/**
 * Creates and adds a selected indicator to a vibe element
 */
export const addSelectedIndicator = (element: HTMLElement) => {
  const selectedIndicator = document.createElement('div');
  selectedIndicator.className =
    'selected-vibe-indicator absolute top-2 left-2 flex items-center gap-1 bg-yellow-400 text-gray-800 text-xs px-2 py-1 rounded-full font-medium shadow-lg';
  selectedIndicator.innerHTML = SELECTED_INDICATOR_HTML;
  selectedIndicator.style.zIndex = VIBE_OPERATION_CONSTANTS.HIGHLIGHT_Z_INDEX;
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

  const indicator = element.querySelector('.selected-vibe-indicator');
  if (indicator) {
    indicator.remove();
  }
};

/**
 * Scrolls to a vibe element with appropriate behavior based on screen size
 */
export const scrollToVibeElement = (element: HTMLElement) => {
  const isMobile = window.innerWidth < VIBE_OPERATION_CONSTANTS.MOBILE_BREAKPOINT;
  element.scrollIntoView({
    behavior: 'smooth',
    block: isMobile ? 'start' : 'center',
    inline: 'nearest',
  });
};

/**
 * Tries to find a vibe element using fallback methods
 */
export const findVibeElementFallback = (vibeId: string): HTMLElement | null => {
  const fallbackElement = document.querySelector(`[data-vibe-id="${vibeId}"]`) as HTMLElement;
  return fallbackElement;
};

/**
 * Gets the next vibe index for keyboard navigation
 */
export const getNextVibeIndex = (
  currentIndex: number,
  totalVibes: number,
  direction: 'up' | 'down' | 'home' | 'end'
): number => {
  switch (direction) {
    case 'up':
      return currentIndex > 0 ? currentIndex - 1 : totalVibes - 1;
    case 'down':
      return currentIndex < totalVibes - 1 ? currentIndex + 1 : 0;
    case 'home':
      return 0;
    case 'end':
      return totalVibes - 1;
    default:
      return currentIndex;
  }
};

/**
 * Handles keyboard navigation for vibe selection
 */
export const handleKeyboardNavigation = (
  e: KeyboardEvent,
  visibleVibes: Vibe[],
  selectedVibeId: string | null,
  onVibeClick: (vibeId: string, onRestoreBounds?: () => void) => void
) => {
  if (!visibleVibes.length) return;

  const currentIndex = selectedVibeId
    ? visibleVibes.findIndex((vibe) => vibe.id.toString() === selectedVibeId)
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
    const nextIndex = getNextVibeIndex(currentIndex, visibleVibes.length, direction);
    if (nextIndex !== currentIndex && nextIndex >= 0) {
      onVibeClick(visibleVibes[nextIndex].id.toString());
    }
  }
};
