import { DeviceInfo } from '../hooks/useDeviceDetection';

// Conditional class names based on device type
export const responsiveClasses = {
  // Layout utilities
  mobileOnly: (classes: string) => ({ mobile: classes, tablet: '', desktop: '' }),
  tabletOnly: (classes: string) => ({ mobile: '', tablet: classes, desktop: '' }),
  desktopOnly: (classes: string) => ({ mobile: '', tablet: '', desktop: classes }),
  
  // Responsive variants
  responsive: (mobile: string, tablet?: string, desktop?: string) => ({
    mobile,
    tablet: tablet || mobile,
    desktop: desktop || tablet || mobile
  }),

  // Orientation-specific
  portraitOnly: (classes: string) => ({ portrait: classes, landscape: '' }),
  landscapeOnly: (classes: string) => ({ portrait: '', landscape: classes }),
  
  // Combined device + orientation
  mobilePortrait: (classes: string) => ({ mobilePortrait: classes, other: '' }),
  mobileLandscape: (classes: string) => ({ mobileLandscape: classes, other: '' }),
  tabletPortrait: (classes: string) => ({ tabletPortrait: classes, other: '' }),
  tabletLandscape: (classes: string) => ({ tabletLandscape: classes, other: '' }),
};

// Function to get appropriate classes based on current device info
export const getResponsiveClasses = (
  deviceInfo: DeviceInfo,
  classMap: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
    portrait?: string;
    landscape?: string;
    mobilePortrait?: string;
    mobileLandscape?: string;
    tabletPortrait?: string;
    tabletLandscape?: string;
    other?: string;
  }
): string => {
  const classes: string[] = [];

  // Device-based classes
  if (deviceInfo.isMobile && classMap.mobile) {
    classes.push(classMap.mobile);
  }
  if (deviceInfo.isTablet && classMap.tablet) {
    classes.push(classMap.tablet);
  }
  if (deviceInfo.isDesktop && classMap.desktop) {
    classes.push(classMap.desktop);
  }

  // Orientation-based classes
  if (deviceInfo.orientation === 'portrait' && classMap.portrait) {
    classes.push(classMap.portrait);
  }
  if (deviceInfo.orientation === 'landscape' && classMap.landscape) {
    classes.push(classMap.landscape);
  }

  // Combined classes
  if (deviceInfo.isMobile && deviceInfo.orientation === 'portrait' && classMap.mobilePortrait) {
    classes.push(classMap.mobilePortrait);
  }
  if (deviceInfo.isMobile && deviceInfo.orientation === 'landscape' && classMap.mobileLandscape) {
    classes.push(classMap.mobileLandscape);
  }
  if (deviceInfo.isTablet && deviceInfo.orientation === 'portrait' && classMap.tabletPortrait) {
    classes.push(classMap.tabletPortrait);
  }
  if (deviceInfo.isTablet && deviceInfo.orientation === 'landscape' && classMap.tabletLandscape) {
    classes.push(classMap.tabletLandscape);
  }

  // Fallback
  if (classes.length === 0 && classMap.other) {
    classes.push(classMap.other);
  }

  return classes.join(' ');
};

// Hook for getting responsive styles
export const useResponsiveStyles = (deviceInfo: DeviceInfo) => {
  return {
    // Get classes based on device info
    getClasses: (classMap: Parameters<typeof getResponsiveClasses>[1]) => 
      getResponsiveClasses(deviceInfo, classMap),
    
    // Conditional rendering helpers
    renderIf: (condition: keyof DeviceInfo | ((info: DeviceInfo) => boolean), component: React.ReactNode) => {
      const shouldRender = typeof condition === 'function' 
        ? condition(deviceInfo) 
        : deviceInfo[condition];
      return shouldRender ? component : null;
    },

    // Dynamic style object generation
    getStyles: (styleMap: {
      mobile?: React.CSSProperties;
      tablet?: React.CSSProperties;
      desktop?: React.CSSProperties;
      portrait?: React.CSSProperties;
      landscape?: React.CSSProperties;
    }): React.CSSProperties => {
      let styles: React.CSSProperties = {};
      
      if (deviceInfo.isMobile && styleMap.mobile) {
        styles = { ...styles, ...styleMap.mobile };
      }
      if (deviceInfo.isTablet && styleMap.tablet) {
        styles = { ...styles, ...styleMap.tablet };
      }
      if (deviceInfo.isDesktop && styleMap.desktop) {
        styles = { ...styles, ...styleMap.desktop };
      }
      
      if (deviceInfo.orientation === 'portrait' && styleMap.portrait) {
        styles = { ...styles, ...styleMap.portrait };
      }
      if (deviceInfo.orientation === 'landscape' && styleMap.landscape) {
        styles = { ...styles, ...styleMap.landscape };
      }
      
      return styles;
    }
  };
};

// Responsive breakpoints constants
export const BREAKPOINTS = {
  MOBILE: 600,
  TABLET: 1024,
  DESKTOP: 1200,
  LARGE_DESKTOP: 1440,
} as const;