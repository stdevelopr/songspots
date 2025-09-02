import { useEffect, useState, useRef } from 'react';

export const useProfileHeight = () => {
  const [profileHeight, setProfileHeight] = useState<string>('400px'); // Default fallback
  const profileSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const calculateHeight = () => {
      if (profileSectionRef.current) {
        const height = profileSectionRef.current.offsetHeight;
        setProfileHeight(`${height}px`);
      }
    };

    // Calculate height on mount and when content changes
    calculateHeight();

    // Recalculate on window resize
    const handleResize = () => {
      setTimeout(calculateHeight, 100); // Small delay to ensure layout is stable
    };

    window.addEventListener('resize', handleResize);
    
    // Use ResizeObserver if available for more precise tracking
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && profileSectionRef.current) {
      resizeObserver = new ResizeObserver(() => {
        calculateHeight();
      });
      resizeObserver.observe(profileSectionRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, []);

  return {
    profileHeight,
    profileSectionRef,
  };
};