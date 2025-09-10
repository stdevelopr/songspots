// Haptic feedback utilities for iOS devices
// These provide native-like tactile feedback for touch interactions

export type HapticType = 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'warning' | 'error';

// Check if haptic feedback is supported
export const isHapticSupported = (): boolean => {
  return 'vibrate' in navigator || 'hapticFeedback' in navigator;
};

// Check if we're on iOS (for native haptic patterns)
export const isIOS = (): boolean => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

// Trigger haptic feedback
export const triggerHaptic = (type: HapticType = 'light'): void => {
  // Don't trigger haptics if not supported or user has reduced motion preference
  if (!isHapticSupported() || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  try {
    // iOS WebKit haptic feedback (Safari on iOS 10+)
    if (isIOS() && 'webkitTapHighlightColor' in document.documentElement.style) {
      // Use iOS-specific haptic patterns when available
      const hapticPatterns = {
        light: [10],
        medium: [20],
        heavy: [40],
        selection: [5],
        success: [10, 50, 10],
        warning: [20, 100, 20],
        error: [50, 100, 50, 100, 50],
      };

      const pattern = hapticPatterns[type] || hapticPatterns.light;
      navigator.vibrate(pattern);
      return;
    }

    // Android/other devices - use basic vibration patterns
    const vibrationPatterns = {
      light: 25,
      medium: 50,
      heavy: 75,
      selection: 10,
      success: [25, 25, 25],
      warning: [50, 50, 50],
      error: [100, 50, 100],
    };

    const pattern = vibrationPatterns[type] || vibrationPatterns.light;
    navigator.vibrate(pattern);
  } catch (error) {
    // Silently fail if haptics aren't supported
    console.debug('Haptic feedback not available:', error);
  }
};

// Convenience functions for common interactions
export const haptics = {
  // UI interactions
  tap: () => triggerHaptic('light'),
  buttonPress: () => triggerHaptic('medium'),
  toggle: () => triggerHaptic('selection'),
  
  // Navigation
  swipe: () => triggerHaptic('light'),
  snapToPosition: () => triggerHaptic('medium'),
  dismiss: () => triggerHaptic('light'),
  
  // Feedback
  success: () => triggerHaptic('success'),
  warning: () => triggerHaptic('warning'),
  error: () => triggerHaptic('error'),
  
  // Long interactions
  longPress: () => triggerHaptic('heavy'),
  contextMenu: () => triggerHaptic('heavy'),
};

// Hook for using haptics in React components
export const useHaptics = () => {
  const isSupported = isHapticSupported();
  
  return {
    isSupported,
    trigger: triggerHaptic,
    ...haptics,
  };
};