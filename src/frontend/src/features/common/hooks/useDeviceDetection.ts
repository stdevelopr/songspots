import { useEffect, useState } from 'react';

export interface DeviceInfo {
  isMobile: boolean;
  isDesktop: boolean;
  isTablet: boolean;
  orientation: 'portrait' | 'landscape';
  screenWidth: number;
  screenHeight: number;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  
  // More specific device + orientation combinations
  isMobilePortrait: boolean;
  isMobileLandscape: boolean;
  isTabletPortrait: boolean;
  isTabletLandscape: boolean;
  isDesktopAny: boolean; // desktop regardless of orientation
  
  // Layout categories for your specific use case
  layoutType: 'desktop' | 'mobile-portrait' | 'mobile-landscape' | 'tablet-portrait' | 'tablet-landscape';
}

interface UseDeviceDetectionOptions {
  mobileBreakpoint?: number;
  tabletBreakpoint?: number;
}

export function useDeviceDetection(options: UseDeviceDetectionOptions = {}) {
  const { mobileBreakpoint = 600, tabletBreakpoint = 1024 } = options;
  
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => {
    if (typeof window === 'undefined') {
      return {
        isMobile: false,
        isDesktop: true,
        isTablet: false,
        orientation: 'landscape',
        screenWidth: 1920,
        screenHeight: 1080,
        deviceType: 'desktop',
        isMobilePortrait: false,
        isMobileLandscape: false,
        isTabletPortrait: false,
        isTabletLandscape: false,
        isDesktopAny: true,
        layoutType: 'desktop'
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const isMobile = width <= mobileBreakpoint;
    const isTablet = width > mobileBreakpoint && width <= tabletBreakpoint;
    const isDesktop = width > tabletBreakpoint;
    const orientation = width > height ? 'landscape' : 'portrait';

    let deviceType: 'mobile' | 'tablet' | 'desktop';
    if (isMobile) deviceType = 'mobile';
    else if (isTablet) deviceType = 'tablet';
    else deviceType = 'desktop';

    // Calculate specific combinations
    const isMobilePortrait = isMobile && orientation === 'portrait';
    const isMobileLandscape = isMobile && orientation === 'landscape';
    const isTabletPortrait = isTablet && orientation === 'portrait';
    const isTabletLandscape = isTablet && orientation === 'landscape';
    const isDesktopAny = isDesktop;

    // Determine layout type for your specific use case
    let layoutType: 'desktop' | 'mobile-portrait' | 'mobile-landscape' | 'tablet-portrait' | 'tablet-landscape';
    if (isDesktop) {
      layoutType = 'desktop';
    } else if (isMobilePortrait) {
      layoutType = 'mobile-portrait';
    } else if (isMobileLandscape) {
      layoutType = 'mobile-landscape';
    } else if (isTabletPortrait) {
      layoutType = 'tablet-portrait';
    } else {
      layoutType = 'tablet-landscape';
    }

    return {
      isMobile,
      isDesktop,
      isTablet,
      orientation,
      screenWidth: width,
      screenHeight: height,
      deviceType,
      isMobilePortrait,
      isMobileLandscape,
      isTabletPortrait,
      isTabletLandscape,
      isDesktopAny,
      layoutType
    };
  });

  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isMobile = width <= mobileBreakpoint;
      const isTablet = width > mobileBreakpoint && width <= tabletBreakpoint;
      const isDesktop = width > tabletBreakpoint;
      const orientation = width > height ? 'landscape' : 'portrait';

      let deviceType: 'mobile' | 'tablet' | 'desktop';
      if (isMobile) deviceType = 'mobile';
      else if (isTablet) deviceType = 'tablet';
      else deviceType = 'desktop';

      // Calculate specific combinations
      const isMobilePortrait = isMobile && orientation === 'portrait';
      const isMobileLandscape = isMobile && orientation === 'landscape';
      const isTabletPortrait = isTablet && orientation === 'portrait';
      const isTabletLandscape = isTablet && orientation === 'landscape';
      const isDesktopAny = isDesktop;

      // Determine layout type
      let layoutType: 'desktop' | 'mobile-portrait' | 'mobile-landscape' | 'tablet-portrait' | 'tablet-landscape';
      if (isDesktop) {
        layoutType = 'desktop';
      } else if (isMobilePortrait) {
        layoutType = 'mobile-portrait';
      } else if (isMobileLandscape) {
        layoutType = 'mobile-landscape';
      } else if (isTabletPortrait) {
        layoutType = 'tablet-portrait';
      } else {
        layoutType = 'tablet-landscape';
      }

      setDeviceInfo({
        isMobile,
        isDesktop,
        isTablet,
        orientation,
        screenWidth: width,
        screenHeight: height,
        deviceType,
        isMobilePortrait,
        isMobileLandscape,
        isTabletPortrait,
        isTabletLandscape,
        isDesktopAny,
        layoutType
      });
    };

    // Listen for resize events
    window.addEventListener('resize', updateDeviceInfo);
    
    // Listen for orientation change events (mobile devices)
    window.addEventListener('orientationchange', updateDeviceInfo);

    // Cleanup
    return () => {
      window.removeEventListener('resize', updateDeviceInfo);
      window.removeEventListener('orientationchange', updateDeviceInfo);
    };
  }, [mobileBreakpoint, tabletBreakpoint]);

  return deviceInfo;
}