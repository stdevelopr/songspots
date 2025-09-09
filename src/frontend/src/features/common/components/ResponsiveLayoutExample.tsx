import React from 'react';
import { useResponsive } from './ResponsiveProvider';
import { ResponsiveComponent } from './ResponsiveComponent';

export const ResponsiveLayoutExample: React.FC = () => {
  const device = useResponsive();

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Responsive Layout Examples</h2>
      
      {/* Example 1: Different layouts for mobile portrait vs landscape */}
      <div className="border rounded-lg p-4">
        <h3 className="font-semibold mb-2">Mobile Layout Adaptation</h3>
        
        <ResponsiveComponent
          renderCondition={device => device.isMobilePortrait}
          className="grid grid-cols-1 gap-4"
        >
          <div className="bg-blue-100 p-3 rounded">Portrait Layout</div>
          <div className="bg-green-100 p-3 rounded">Items stacked vertically</div>
          <div className="bg-purple-100 p-3 rounded">Better for scrolling</div>
        </ResponsiveComponent>

        <ResponsiveComponent
          renderCondition={device => device.isMobileLandscape}
          className="grid grid-cols-2 gap-4"
        >
          <div className="bg-blue-100 p-3 rounded">Landscape Layout</div>
          <div className="bg-green-100 p-3 rounded">Two columns</div>
          <div className="bg-purple-100 p-3 rounded">Better space usage</div>
          <div className="bg-yellow-100 p-3 rounded">Side by side</div>
        </ResponsiveComponent>
      </div>

      {/* Example 2: Device-specific styling */}
      <div className="border rounded-lg p-4">
        <h3 className="font-semibold mb-2">Device-Specific Styling</h3>
        
        <ResponsiveComponent
          className="p-4 rounded text-white font-semibold"
          mobileClass="bg-red-500 text-sm"
          tabletClass="bg-yellow-500 text-base"
          desktopClass="bg-green-500 text-lg"
        >
          This box changes color and size based on device type!
        </ResponsiveComponent>
      </div>

      {/* Example 3: Orientation-specific content */}
      <div className="border rounded-lg p-4">
        <h3 className="font-semibold mb-2">Orientation-Specific Content</h3>
        
        <ResponsiveComponent showOnPortrait>
          <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
            📱 This content only shows in portrait mode
          </div>
        </ResponsiveComponent>

        <ResponsiveComponent showOnLandscape>
          <div className="bg-orange-50 p-3 rounded border-l-4 border-orange-400">
            🖥️ This content only shows in landscape mode
          </div>
        </ResponsiveComponent>
      </div>

      {/* Example 4: Dynamic styles based on screen dimensions */}
      <div className="border rounded-lg p-4">
        <h3 className="font-semibold mb-2">Dynamic Styles</h3>
        
        <ResponsiveComponent
          mobileStyle={{
            fontSize: '14px',
            padding: '8px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fca5a5'
          }}
          tabletStyle={{
            fontSize: '16px',
            padding: '12px',
            backgroundColor: '#fffbeb',
            border: '1px solid #fbbf24'
          }}
          desktopStyle={{
            fontSize: '18px',
            padding: '16px',
            backgroundColor: '#f0fdf4',
            border: '1px solid #4ade80'
          }}
        >
          This text adapts its styling based on device type using inline styles!
        </ResponsiveComponent>
      </div>

      {/* Example 5: Current device info display */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <h3 className="font-semibold mb-2">Current Device Information</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>Device Type: <span className="font-mono text-blue-600">{device.deviceType}</span></div>
          <div>Orientation: <span className="font-mono text-purple-600">{device.orientation}</span></div>
          <div>Screen Width: <span className="font-mono text-green-600">{device.screenWidth}px</span></div>
          <div>Screen Height: <span className="font-mono text-orange-600">{device.screenHeight}px</span></div>
        </div>
        <div className="mt-2 text-xs text-gray-600">
          Try resizing your browser or rotating your device to see changes!
        </div>
      </div>
    </div>
  );
};