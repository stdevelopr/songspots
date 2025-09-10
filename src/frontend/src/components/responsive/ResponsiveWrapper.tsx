import React from 'react';
import { useResponsive } from '../../hooks/useResponsive';

export interface ResponsiveWrapperProps {
  mobile: React.ComponentType<any>;
  desktop: React.ComponentType<any>;
  tablet?: React.ComponentType<any>; // Optional tablet-specific component
  props?: any; // Props to pass to the rendered component
  children?: React.ReactNode;
}

/**
 * ResponsiveWrapper component that renders different components based on device type
 * 
 * @example
 * <ResponsiveWrapper
 *   mobile={MobileInteractiveMap}
 *   desktop={DesktopInteractiveMap}
 *   props={{ pins, onPinClick }}
 * />
 */
export const ResponsiveWrapper: React.FC<ResponsiveWrapperProps> = ({
  mobile: MobileComponent,
  desktop: DesktopComponent,
  tablet: TabletComponent,
  props = {},
  children,
}) => {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  // Render tablet component if provided and we're on tablet
  if (isTablet && TabletComponent) {
    return <TabletComponent {...props}>{children}</TabletComponent>;
  }

  // Render mobile component for mobile and tablet (if no tablet component)
  if (isMobile || (isTablet && !TabletComponent)) {
    return <MobileComponent {...props}>{children}</MobileComponent>;
  }

  // Render desktop component for desktop
  if (isDesktop) {
    return <DesktopComponent {...props}>{children}</DesktopComponent>;
  }

  // Fallback to desktop component
  return <DesktopComponent {...props}>{children}</DesktopComponent>;
};

/**
 * Higher-order component factory for creating responsive components
 * 
 * @example
 * export const InteractiveMap = withResponsive({
 *   mobile: MobileInteractiveMap,
 *   desktop: DesktopInteractiveMap,
 * });
 */
export const withResponsive = <P extends object>({
  mobile: MobileComponent,
  desktop: DesktopComponent,
  tablet: TabletComponent,
}: {
  mobile: React.ComponentType<P>;
  desktop: React.ComponentType<P>;
  tablet?: React.ComponentType<P>;
}) => {
  const ResponsiveComponent = (props: P) => (
    <ResponsiveWrapper
      mobile={MobileComponent}
      desktop={DesktopComponent}
      tablet={TabletComponent}
      props={props}
    />
  );

  ResponsiveComponent.displayName = `Responsive(${MobileComponent.displayName || MobileComponent.name})`;
  
  return ResponsiveComponent;
};

/**
 * Hook for conditional rendering based on device type
 * 
 * @example
 * const renderContent = useResponsiveContent({
 *   mobile: () => <MobileContent />,
 *   desktop: () => <DesktopContent />,
 * });
 */
export const useResponsiveContent = <T = React.ReactNode>({
  mobile,
  desktop,
  tablet,
}: {
  mobile: () => T;
  desktop: () => T;
  tablet?: () => T;
}): T => {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  if (isTablet && tablet) {
    return tablet();
  }

  if (isMobile || (isTablet && !tablet)) {
    return mobile();
  }

  if (isDesktop) {
    return desktop();
  }

  return desktop(); // Fallback
};

export default ResponsiveWrapper;