import { useEffect, useState } from 'react';
import { useDeviceDetection } from './useDeviceDetection';

export function useIsMobile(breakpoint = 600) {
  // Try to use the new device detection system if available
  try {
    const deviceInfo = useDeviceDetection({ mobileBreakpoint: breakpoint });
    return deviceInfo.isMobile;
  } catch {
    // Fallback to the original implementation if not in ResponsiveProvider context
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
      const checkMobile = () => setIsMobile(window.innerWidth <= breakpoint);
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }, [breakpoint]);

    return isMobile;
  }
}
