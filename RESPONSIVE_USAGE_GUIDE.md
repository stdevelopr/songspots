# Enhanced Responsive System - Usage Guide

## Overview

The responsive system now clearly distinguishes between different device types and orientations, solving the confusion between tablet landscape and mobile landscape.

## Quick Start

### 1. Basic Device Detection
```typescript
import { useResponsive } from './features/common/ResponsiveProvider';

function MyComponent() {
  const device = useResponsive();
  
  // Clear layout type (recommended)
  console.log(device.layoutType); // 'desktop' | 'mobile-portrait' | 'mobile-landscape' | 'tablet-portrait' | 'tablet-landscape'
  
  // Boolean flags for specific checks
  console.log(device.isMobilePortrait);  // true only for mobile portrait
  console.log(device.isMobileLandscape); // true only for mobile landscape  
  console.log(device.isTabletLandscape); // true only for tablet landscape (different from mobile!)
  console.log(device.isDesktopAny);      // true for any desktop orientation
}
```

### 2. Your Three Layout System

For your specific use case (desktop, mobile portrait, mobile landscape):

```typescript
// Desktop Design
<ResponsiveComponent showOnLayoutTypes={['desktop']}>
  <YourDesktopLayout />
</ResponsiveComponent>

// Mobile Portrait Design  
<ResponsiveComponent showOnLayoutTypes={['mobile-portrait']}>
  <YourMobilePortraitLayout />
</ResponsiveComponent>

// Mobile Landscape Design
<ResponsiveComponent showOnLayoutTypes={['mobile-landscape']}>
  <YourMobileLandscapeLayout />
</ResponsiveComponent>
```

### 3. Layout-Specific Styling

```typescript
// Different classes for different layouts
<ResponsiveComponent
  layoutDesktopClass="grid-cols-3 p-6 text-lg"
  layoutMobilePortraitClass="grid-cols-1 p-2 text-sm"
  layoutMobileLandscapeClass="grid-cols-2 p-3 text-base"
>
  <YourContent />
</ResponsiveComponent>

// Different inline styles for different layouts
<ResponsiveComponent
  layoutDesktopStyle={{ padding: '24px', fontSize: '18px' }}
  layoutMobilePortraitStyle={{ padding: '8px', fontSize: '14px' }}
  layoutMobileLandscapeStyle={{ padding: '12px', fontSize: '16px' }}
>
  <YourContent />
</ResponsiveComponent>
```

### 4. Conditional Logic in Components

```typescript
function AdaptiveComponent() {
  const device = useResponsive();
  
  return (
    <div>
      {device.layoutType === 'desktop' && (
        <div>Desktop-specific content with sidebar</div>
      )}
      
      {device.layoutType === 'mobile-portrait' && (
        <div>Mobile portrait: vertical stack</div>
      )}
      
      {device.layoutType === 'mobile-landscape' && (
        <div>Mobile landscape: two columns</div>
      )}
    </div>
  );
}
```

## Key Benefits

### ✅ No More Confusion
- `mobile-landscape` = Phone rotated sideways
- `tablet-landscape` = Tablet rotated sideways (completely different!)
- Clear distinction between all layout types

### ✅ Perfect for Your Use Case
- **Desktop**: Full-featured layout with sidebars and detailed UI
- **Mobile Portrait**: Vertical stack, thumb-friendly navigation
- **Mobile Landscape**: Two-column layout for better horizontal space usage

### ✅ Real-Time Updates
- Automatically updates when device is rotated
- Responsive to browser window resizing
- No page refresh needed

## Live Demo

Visit your app with `?demo=responsive` to see all layouts in action:
- Resize browser window to see desktop vs tablet vs mobile
- Rotate device/browser to see portrait vs landscape
- Clear visual examples of each layout type

## Advanced Usage

### Multiple Layout Types
```typescript
// Show on both mobile orientations
<ResponsiveComponent showOnLayoutTypes={['mobile-portrait', 'mobile-landscape']}>

// Show on everything except tablet landscape
<ResponsiveComponent hideOnLayoutTypes={['tablet-landscape']}>

// Custom condition
<ResponsiveComponent 
  renderCondition={device => device.screenWidth > 800 && device.isMobile}
>
```

### Debugging
The development overlay shows current layout type:
```typescript
// Shows in bottom-right corner (development only)
<DeviceInfoDisplay />
```

### Breakpoint Configuration
```typescript
// Custom breakpoints
<ResponsiveProvider 
  mobileBreakpoint={768}    // Default: 600
  tabletBreakpoint={1200}   // Default: 1024
>
  <App />
</ResponsiveProvider>
```

## Migration from Old System

### Before (confusing)
```typescript
const isMobile = useIsMobile();
const isPortrait = window.innerHeight > window.innerWidth;

// Unclear what this means for tablets!
if (isMobile && !isPortrait) {
  // Mobile landscape? Tablet landscape? 
}
```

### After (crystal clear)
```typescript
const device = useResponsive();

if (device.layoutType === 'mobile-landscape') {
  // Definitely mobile landscape, not tablet!
}

if (device.layoutType === 'tablet-landscape') {
  // Definitely tablet landscape, not mobile!
}
```

## Best Practices

1. **Use `layoutType`** for your main layout decisions
2. **Use layout-specific props** on ResponsiveComponent for cleaner code  
3. **Test across real devices** to verify breakpoints work for your content
4. **Keep the DeviceInfoDisplay** visible during development
5. **Use meaningful names** in your layout components (MobilePortraitLayout, etc.)

The system now perfectly handles your three-layout design with zero ambiguity!