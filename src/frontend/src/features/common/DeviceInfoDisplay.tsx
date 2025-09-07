import React from 'react';
import { useResponsive } from './ResponsiveProvider';
import { ResponsiveComponent } from './ResponsiveComponent';

interface DeviceInfoDisplayProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  showOnlyInDev?: boolean;
}

export const DeviceInfoDisplay: React.FC<DeviceInfoDisplayProps> = ({ 
  position = 'bottom-right',
  showOnlyInDev = true
}) => {
  const device = useResponsive();

  if (showOnlyInDev && process.env.NODE_ENV === 'production') {
    return null;
  }

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  return (
    <div 
      className={`fixed ${positionClasses[position]} z-50 bg-black/80 text-white text-xs px-3 py-2 rounded-lg shadow-lg font-mono max-w-xs`}
    >
      <div className="space-y-1">
        <div className="font-bold text-yellow-300">Device Info</div>
        <div>Layout: <span className="text-orange-300 font-semibold">{device.layoutType}</span></div>
        <div>Type: <span className="text-green-300">{device.deviceType}</span></div>
        <div>Size: <span className="text-blue-300">{device.screenWidth}x{device.screenHeight}</span></div>
        <div>Orientation: <span className="text-purple-300">{device.orientation}</span></div>
        <div className="text-gray-300 text-[10px] mt-2 space-y-0.5">
          <div>Mobile: {device.isMobile ? '✓' : '✗'}</div>
          <div>Tablet: {device.isTablet ? '✓' : '✗'}</div>
          <div>Desktop: {device.isDesktop ? '✓' : '✗'}</div>
        </div>
      </div>
      
      {/* Example of responsive styling within the component */}
      <ResponsiveComponent
        className="mt-2 pt-2 border-t border-gray-600"
        layoutMobilePortraitClass="text-red-300"
        layoutTabletPortraitClass="text-yellow-300" 
        layoutDesktopClass="text-green-300"
      >
        <div className="text-[10px]">
          This text color changes based on device type!
        </div>
      </ResponsiveComponent>
    </div>
  );
};