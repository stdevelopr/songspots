import { useState, useEffect } from 'react';

interface SafeAreaInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export const useSafeArea = (): SafeAreaInsets => {
  const [safeArea, setSafeArea] = useState<SafeAreaInsets>({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });

  useEffect(() => {
    const updateSafeArea = () => {
      // Get safe area insets from CSS environment variables
      const computedStyle = getComputedStyle(document.documentElement);
      
      const top = parseInt(computedStyle.getPropertyValue('env(safe-area-inset-top)').replace('px', '')) || 0;
      const right = parseInt(computedStyle.getPropertyValue('env(safe-area-inset-right)').replace('px', '')) || 0;
      const bottom = parseInt(computedStyle.getPropertyValue('env(safe-area-inset-bottom)').replace('px', '')) || 0;
      const left = parseInt(computedStyle.getPropertyValue('env(safe-area-inset-left)').replace('px', '')) || 0;

      setSafeArea({ top, right, bottom, left });
    };

    // Initial update
    updateSafeArea();

    // Update on orientation change
    window.addEventListener('orientationchange', updateSafeArea);
    
    // Fallback: update after a delay to ensure CSS is loaded
    const timeoutId = setTimeout(updateSafeArea, 100);

    return () => {
      window.removeEventListener('orientationchange', updateSafeArea);
      clearTimeout(timeoutId);
    };
  }, []);

  return safeArea;
};

// Utility function to generate safe area CSS
export const getSafeAreaStyle = (side?: 'top' | 'right' | 'bottom' | 'left') => {
  if (side) {
    return {
      [`padding${side.charAt(0).toUpperCase()}${side.slice(1)}`]: `env(safe-area-inset-${side})`
    };
  }

  return {
    paddingTop: 'env(safe-area-inset-top)',
    paddingRight: 'env(safe-area-inset-right)',
    paddingBottom: 'env(safe-area-inset-bottom)',
    paddingLeft: 'env(safe-area-inset-left)',
  };
};