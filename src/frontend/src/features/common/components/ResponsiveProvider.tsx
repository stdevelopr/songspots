import React, { createContext, useContext, ReactNode } from 'react';
import { useDeviceDetection, DeviceInfo } from '../hooks/useDeviceDetection';

interface ResponsiveContextType extends DeviceInfo {
  // Helper functions for common responsive patterns
  showMobileOnly: boolean;
  showTabletOnly: boolean;
  showDesktopOnly: boolean;
  showMobileAndTablet: boolean;
  showTabletAndDesktop: boolean;
  isMobilePortrait: boolean;
  isMobileLandscape: boolean;
  isTabletPortrait: boolean;
  isTabletLandscape: boolean;
}

const ResponsiveContext = createContext<ResponsiveContextType | undefined>(undefined);

export const useResponsive = (): ResponsiveContextType => {
  const context = useContext(ResponsiveContext);
  if (!context) {
    throw new Error('useResponsive must be used within a ResponsiveProvider');
  }
  return context;
};

interface ResponsiveProviderProps {
  children: ReactNode;
  mobileBreakpoint?: number;
  tabletBreakpoint?: number;
}

export const ResponsiveProvider: React.FC<ResponsiveProviderProps> = ({
  children,
  mobileBreakpoint = 600,
  tabletBreakpoint = 1024
}) => {
  const deviceInfo = useDeviceDetection({ mobileBreakpoint, tabletBreakpoint });

  const contextValue: ResponsiveContextType = {
    ...deviceInfo,
    // Helper computed properties
    showMobileOnly: deviceInfo.isMobile,
    showTabletOnly: deviceInfo.isTablet,
    showDesktopOnly: deviceInfo.isDesktop,
    showMobileAndTablet: deviceInfo.isMobile || deviceInfo.isTablet,
    showTabletAndDesktop: deviceInfo.isTablet || deviceInfo.isDesktop,
    isMobilePortrait: deviceInfo.isMobile && deviceInfo.orientation === 'portrait',
    isMobileLandscape: deviceInfo.isMobile && deviceInfo.orientation === 'landscape',
    isTabletPortrait: deviceInfo.isTablet && deviceInfo.orientation === 'portrait',
    isTabletLandscape: deviceInfo.isTablet && deviceInfo.orientation === 'landscape',
  };

  return (
    <ResponsiveContext.Provider value={contextValue}>
      {children}
    </ResponsiveContext.Provider>
  );
};