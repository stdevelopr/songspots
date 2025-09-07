# Responsive System Documentation

This document describes the responsive system implemented in the Music Memories application that provides device detection, orientation monitoring, and dynamic styling capabilities.

## Overview

The responsive system consists of several components that work together to provide:

- **Device Detection**: Automatically detect mobile, tablet, and desktop devices
- **Orientation Monitoring**: Track portrait and landscape orientations with real-time updates
- **Dynamic Styling**: Apply different styles based on device type and orientation
- **Conditional Rendering**: Show/hide components based on device characteristics

## Core Components

### 1. Device Detection Hook (`useDeviceDetection`)

**Location**: `src/frontend/src/features/common/useDeviceDetection.ts`

Provides detailed device information with configurable breakpoints:

```typescript
const deviceInfo = useDeviceDetection({
  mobileBreakpoint: 600,  // Default: 600px
  tabletBreakpoint: 1024  // Default: 1024px
});

// Returns:
// {
//   isMobile: boolean,
//   isTablet: boolean,
//   isDesktop: boolean,
//   orientation: 'portrait' | 'landscape',
//   screenWidth: number,
//   screenHeight: number,
//   deviceType: 'mobile' | 'tablet' | 'desktop'
// }
```

### 2. Responsive Provider (`ResponsiveProvider`)

**Location**: `src/frontend/src/features/common/ResponsiveProvider.tsx`

Context provider that makes device information available throughout the app:

```typescript
// In main.tsx or app root
<ResponsiveProvider mobileBreakpoint={600} tabletBreakpoint={1024}>
  <App />
</ResponsiveProvider>
```

### 3. Responsive Hook (`useResponsive`)

Access device information and helper functions from anywhere in the component tree:

```typescript
const device = useResponsive();

// Available properties:
device.isMobile          // true if mobile
device.isTablet          // true if tablet  
device.isDesktop         // true if desktop
device.orientation       // 'portrait' | 'landscape'
device.deviceType        // 'mobile' | 'tablet' | 'desktop'

// Helper properties:
device.showMobileOnly    // true only on mobile
device.showTabletOnly    // true only on tablet
device.showDesktopOnly   // true only on desktop
device.isMobilePortrait  // true if mobile in portrait
device.isMobileLandscape // true if mobile in landscape
// ... etc
```

### 4. Responsive Component (`ResponsiveComponent`)

**Location**: `src/frontend/src/features/common/ResponsiveComponent.tsx`

A flexible component for conditional rendering and responsive styling:

```typescript
// Conditional rendering
<ResponsiveComponent showOnMobile hideOnDesktop>
  <MobileSpecificContent />
</ResponsiveComponent>

// Responsive classes
<ResponsiveComponent
  mobileClass="text-sm p-2"
  tabletClass="text-base p-4"
  desktopClass="text-lg p-6"
>
  <Content />
</ResponsiveComponent>

// Responsive inline styles
<ResponsiveComponent
  mobileStyle={{ fontSize: '14px', padding: '8px' }}
  desktopStyle={{ fontSize: '18px', padding: '16px' }}
>
  <Content />
</ResponsiveComponent>

// Custom render conditions
<ResponsiveComponent
  renderCondition={device => device.isMobile && device.orientation === 'landscape'}
>
  <LandscapeMobileContent />
</ResponsiveComponent>
```

### 5. Responsive Utilities

**Location**: `src/frontend/src/features/common/utils/responsiveUtils.ts`

Utility functions for advanced responsive styling:

```typescript
import { getResponsiveClasses, useResponsiveStyles } from './utils/responsiveUtils';

// Get classes based on current device
const classes = getResponsiveClasses(deviceInfo, {
  mobile: 'grid-cols-1',
  tablet: 'grid-cols-2', 
  desktop: 'grid-cols-3'
});

// In a component
const device = useResponsive();
const responsiveStyles = useResponsiveStyles(device);

const dynamicStyles = responsiveStyles.getStyles({
  mobile: { flexDirection: 'column' },
  desktop: { flexDirection: 'row' }
});
```

## Usage Examples

### Basic Device Detection

```typescript
import { useResponsive } from '../common/ResponsiveProvider';

function MyComponent() {
  const device = useResponsive();
  
  return (
    <div>
      <h1>Current Device: {device.deviceType}</h1>
      <p>Orientation: {device.orientation}</p>
      <p>Screen: {device.screenWidth}x{device.screenHeight}</p>
    </div>
  );
}
```

### Responsive Layout

```typescript
function ResponsiveLayout() {
  return (
    <div>
      {/* Show different layouts based on device */}
      <ResponsiveComponent showOnMobile>
        <MobileLayout />
      </ResponsiveComponent>
      
      <ResponsiveComponent showOnTablet showOnDesktop>
        <DesktopLayout />
      </ResponsiveComponent>
    </div>
  );
}
```

### Orientation-Specific Content

```typescript
function OrientationAware() {
  const device = useResponsive();
  
  return (
    <div>
      {device.isMobilePortrait && (
        <div className="grid grid-cols-1 gap-4">
          <p>Portrait: Items stacked vertically</p>
        </div>
      )}
      
      {device.isMobileLandscape && (
        <div className="grid grid-cols-2 gap-4">
          <p>Landscape: Items side by side</p>
        </div>
      )}
    </div>
  );
}
```

### Dynamic Styling

```typescript
function DynamicStyling() {
  return (
    <ResponsiveComponent
      className="rounded border"
      mobileClass="p-2 text-sm bg-red-50"
      tabletClass="p-4 text-base bg-blue-50"
      desktopClass="p-6 text-lg bg-green-50"
    >
      <p>This content adapts its styling based on device type!</p>
    </ResponsiveComponent>
  );
}
```

## Integration with Existing Code

### Updated `useIsMobile` Hook

The existing `useIsMobile` hook has been updated to use the new system while maintaining backward compatibility:

```typescript
// Still works the same way
const isMobile = useIsMobile(600);

// But now uses the new responsive system internally when available
```

### Profile Page Integration

The ProfilePage component now uses ResponsiveComponent to show different layouts:

```typescript
// Desktop Layout
<ResponsiveComponent showOnDesktop showOnTablet hideOnMobile>
  <ProfileDesktopLayout {...props} />
</ResponsiveComponent>

// Mobile Layout  
<ResponsiveComponent showOnMobile hideOnTablet hideOnDesktop>
  <ProfileMobileLayout {...props} />
</ResponsiveComponent>
```

## Development Tools

### Device Info Display

A development-only component that shows current device information:

```typescript
import { DeviceInfoDisplay } from './features/common/DeviceInfoDisplay';

// Shows device info overlay (only in development)
<DeviceInfoDisplay position="bottom-right" />
```

### Example Component

A comprehensive example showing all responsive features:

```typescript
import { ResponsiveLayoutExample } from './features/common/ResponsiveLayoutExample';

// Demonstrates all responsive capabilities
<ResponsiveLayoutExample />
```

## Configuration

### Breakpoints

Default breakpoints can be customized:

```typescript
<ResponsiveProvider 
  mobileBreakpoint={768}    // Default: 600
  tabletBreakpoint={1200}   // Default: 1024
>
  <App />
</ResponsiveProvider>
```

### Constants

Predefined breakpoint constants are available:

```typescript
import { BREAKPOINTS } from './utils/responsiveUtils';

// BREAKPOINTS.MOBILE = 600
// BREAKPOINTS.TABLET = 1024
// BREAKPOINTS.DESKTOP = 1200
// BREAKPOINTS.LARGE_DESKTOP = 1440
```

## Real-Time Updates

The system automatically updates when:
- Window is resized
- Device orientation changes
- Screen dimensions change

All components using the responsive system will re-render with updated device information.

## Performance

- Uses efficient event listeners with cleanup
- Minimal re-renders with optimized state updates
- Lazy evaluation of responsive properties
- No unnecessary DOM queries

## Browser Support

- Modern browsers with `window.innerWidth/innerHeight` support
- Graceful fallback for older browsers
- SSR-safe with proper hydration handling

## Migration Guide

### From Tailwind Responsive Classes

```typescript
// Before
<div className="block md:hidden">Mobile only</div>
<div className="hidden md:block">Desktop only</div>

// After  
<ResponsiveComponent showOnMobile hideOnTablet hideOnDesktop>
  <div>Mobile only</div>
</ResponsiveComponent>
<ResponsiveComponent hideOnMobile showOnTablet showOnDesktop>
  <div>Desktop only</div>
</ResponsiveComponent>
```

### From Media Queries

```typescript
// Before
const isMobile = window.innerWidth <= 768;

// After
const device = useResponsive();
const isMobile = device.isMobile;
```

## Best Practices

1. **Use ResponsiveComponent** for conditional rendering instead of CSS classes
2. **Leverage orientation detection** for mobile-specific layouts
3. **Combine device type and orientation** for precise targeting
4. **Use the DeviceInfoDisplay** during development for debugging
5. **Test across different devices and orientations** thoroughly
6. **Keep responsive logic in components** rather than global state
7. **Use meaningful breakpoints** based on your content, not device categories

## Troubleshooting

### Component not updating on resize
- Ensure the component is wrapped in ResponsiveProvider
- Check that useResponsive() is called inside a React component

### Incorrect device detection
- Verify breakpoint configuration
- Test with different screen sizes
- Check browser developer tools device emulation

### Performance issues
- Avoid excessive responsive components in loops
- Use CSS for simple responsive styling when possible
- Consider memoizing expensive responsive calculations