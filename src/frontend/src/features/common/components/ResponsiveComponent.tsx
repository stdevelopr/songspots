import React from 'react';
import { useResponsive } from './ResponsiveProvider';
import { getResponsiveClasses, useResponsiveStyles } from '../utils/responsiveUtils';

interface ResponsiveComponentProps {
  children?: React.ReactNode;
  className?: string;

  // Responsive class mappings
  mobileClass?: string;
  tabletClass?: string;
  desktopClass?: string;
  portraitClass?: string;
  landscapeClass?: string;
  mobilePortraitClass?: string;
  mobileLandscapeClass?: string;
  tabletPortraitClass?: string;
  tabletLandscapeClass?: string;

  // Responsive style mappings
  mobileStyle?: React.CSSProperties;
  tabletStyle?: React.CSSProperties;
  desktopStyle?: React.CSSProperties;
  portraitStyle?: React.CSSProperties;
  landscapeStyle?: React.CSSProperties;

  // Conditional rendering
  showOnMobile?: boolean;
  showOnTablet?: boolean;
  showOnDesktop?: boolean;
  showOnPortrait?: boolean;
  showOnLandscape?: boolean;
  hideOnMobile?: boolean;
  hideOnTablet?: boolean;
  hideOnDesktop?: boolean;

  // Custom render conditions
  renderCondition?: (deviceInfo: ReturnType<typeof useResponsive>) => boolean;

  // Layout-based rendering (clearer for your use case)
  showOnLayoutTypes?: Array<
    'desktop' | 'mobile-portrait' | 'mobile-landscape' | 'tablet-portrait' | 'tablet-landscape'
  >;
  hideOnLayoutTypes?: Array<
    'desktop' | 'mobile-portrait' | 'mobile-landscape' | 'tablet-portrait' | 'tablet-landscape'
  >;

  // Layout-specific classes (clearer naming)
  layoutDesktopClass?: string;
  layoutMobilePortraitClass?: string;
  layoutMobileLandscapeClass?: string;
  layoutTabletPortraitClass?: string;
  layoutTabletLandscapeClass?: string;

  // Layout-specific styles
  layoutDesktopStyle?: React.CSSProperties;
  layoutMobilePortraitStyle?: React.CSSProperties;
  layoutMobileLandscapeStyle?: React.CSSProperties;
  layoutTabletPortraitStyle?: React.CSSProperties;
  layoutTabletLandscapeStyle?: React.CSSProperties;

  // HTML element to render
  as?: keyof JSX.IntrinsicElements;
}

export const ResponsiveComponent: React.FC<ResponsiveComponentProps> = ({
  children,
  className = '',
  mobileClass,
  tabletClass,
  desktopClass,
  portraitClass,
  landscapeClass,
  mobilePortraitClass,
  mobileLandscapeClass,
  tabletPortraitClass,
  tabletLandscapeClass,
  mobileStyle,
  tabletStyle,
  desktopStyle,
  portraitStyle,
  landscapeStyle,
  showOnMobile = true,
  showOnTablet = true,
  showOnDesktop = true,
  showOnPortrait = true,
  showOnLandscape = true,
  hideOnMobile = false,
  hideOnTablet = false,
  hideOnDesktop = false,
  renderCondition,
  showOnLayoutTypes,
  hideOnLayoutTypes,
  layoutDesktopClass,
  layoutMobilePortraitClass,
  layoutMobileLandscapeClass,
  layoutTabletPortraitClass,
  layoutTabletLandscapeClass,
  layoutDesktopStyle,
  layoutMobilePortraitStyle,
  layoutMobileLandscapeStyle,
  layoutTabletPortraitStyle,
  layoutTabletLandscapeStyle,
  as: Element = 'div',
  ...props
}) => {
  const deviceInfo = useResponsive();
  const responsiveStyles = useResponsiveStyles(deviceInfo);

  // Check render conditions
  const shouldRender = (() => {
    if (renderCondition) {
      return renderCondition(deviceInfo);
    }

    // Layout-based conditions (clearer and more specific)
    if (hideOnLayoutTypes && hideOnLayoutTypes.includes(deviceInfo.layoutType)) {
      return false;
    }

    if (showOnLayoutTypes && !showOnLayoutTypes.includes(deviceInfo.layoutType)) {
      return false;
    }

    // Fallback to original conditions if layout-based conditions aren't used
    if (!showOnLayoutTypes && !hideOnLayoutTypes) {
      // Hide conditions take precedence
      if (hideOnMobile && deviceInfo.isMobile) return false;
      if (hideOnTablet && deviceInfo.isTablet) return false;
      if (hideOnDesktop && deviceInfo.isDesktop) return false;

      // Show conditions
      if (!showOnMobile && deviceInfo.isMobile) return false;
      if (!showOnTablet && deviceInfo.isTablet) return false;
      if (!showOnDesktop && deviceInfo.isDesktop) return false;
      if (!showOnPortrait && deviceInfo.orientation === 'portrait') return false;
      if (!showOnLandscape && deviceInfo.orientation === 'landscape') return false;
    }

    return true;
  })();

  if (!shouldRender) {
    return null;
  }

  // Generate responsive classes
  const responsiveClasses = getResponsiveClasses(deviceInfo, {
    mobile: mobileClass,
    tablet: tabletClass,
    desktop: desktopClass,
    portrait: portraitClass,
    landscape: landscapeClass,
    mobilePortrait: mobilePortraitClass,
    mobileLandscape: mobileLandscapeClass,
    tabletPortrait: tabletPortraitClass,
    tabletLandscape: tabletLandscapeClass,
  });

  // Add layout-specific classes (these take precedence and are clearer)
  const layoutSpecificClass = (() => {
    switch (deviceInfo.layoutType) {
      case 'desktop':
        return layoutDesktopClass;
      case 'mobile-portrait':
        return layoutMobilePortraitClass;
      case 'mobile-landscape':
        return layoutMobileLandscapeClass;
      case 'tablet-portrait':
        return layoutTabletPortraitClass;
      case 'tablet-landscape':
        return layoutTabletLandscapeClass;
      default:
        return '';
    }
  })();

  // Generate responsive styles
  const responsiveInlineStyles = responsiveStyles.getStyles({
    mobile: mobileStyle,
    tablet: tabletStyle,
    desktop: desktopStyle,
    portrait: portraitStyle,
    landscape: landscapeStyle,
  });

  // Add layout-specific styles (these take precedence and are clearer)
  const layoutSpecificStyle = (() => {
    switch (deviceInfo.layoutType) {
      case 'desktop':
        return layoutDesktopStyle || {};
      case 'mobile-portrait':
        return layoutMobilePortraitStyle || {};
      case 'mobile-landscape':
        return layoutMobileLandscapeStyle || {};
      case 'tablet-portrait':
        return layoutTabletPortraitStyle || {};
      case 'tablet-landscape':
        return layoutTabletLandscapeStyle || {};
      default:
        return {};
    }
  })();

  const finalClassName = [className, responsiveClasses, layoutSpecificClass]
    .filter(Boolean)
    .join(' ');
  const finalStyles = { ...responsiveInlineStyles, ...layoutSpecificStyle };

  return React.createElement(
    Element,
    {
      ...props,
      className: finalClassName,
      style: finalStyles,
    },
    children
  );
};
