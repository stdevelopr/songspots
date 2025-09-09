import React from 'react';
import { useResponsive } from './ResponsiveProvider';
import { ResponsiveComponent } from './ResponsiveComponent';

export const ThreeLayoutExample: React.FC = () => {
  const device = useResponsive();

  return (
    <div className="p-4 min-h-screen bg-gray-100">
      {/* Header showing current layout */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-2">Three Layout System Example</h1>
        <div className="text-lg">
          Current Layout: <span className="font-semibold text-blue-600">{device.layoutType}</span>
        </div>
        <div className="text-sm text-gray-600 mt-1">
          Resize your browser or rotate your device to see different layouts
        </div>
      </div>

      {/* Desktop Layout */}
      <ResponsiveComponent showOnLayoutTypes={['desktop']}>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-green-600">🖥️ Desktop Layout</h2>
            <div className="text-sm text-gray-500">
              {device.screenWidth}x{device.screenHeight}
            </div>
          </div>
          
          {/* Desktop: 3-column layout with sidebar */}
          <div className="grid grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="col-span-1 space-y-4">
              <div className="bg-green-50 p-4 rounded border-l-4 border-green-400">
                <h3 className="font-semibold mb-2">Navigation</h3>
                <ul className="space-y-2 text-sm">
                  <li>Dashboard</li>
                  <li>Profile</li>
                  <li>Settings</li>
                  <li>Help</li>
                </ul>
              </div>
              
              <div className="bg-green-50 p-4 rounded border-l-4 border-green-400">
                <h3 className="font-semibold mb-2">Quick Stats</h3>
                <div className="text-sm space-y-1">
                  <div>Active Users: 1,234</div>
                  <div>New Posts: 56</div>
                  <div>Messages: 12</div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="col-span-2 space-y-4">
              <div className="bg-green-50 p-6 rounded border-l-4 border-green-400">
                <h3 className="font-semibold text-lg mb-3">Main Content Area</h3>
                <p className="mb-4">
                  This is the primary content area for desktop users. It has plenty of space
                  for detailed information, forms, and complex interactions.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded shadow">
                    <h4 className="font-medium">Feature 1</h4>
                    <p className="text-sm text-gray-600">Detailed description</p>
                  </div>
                  <div className="bg-white p-3 rounded shadow">
                    <h4 className="font-medium">Feature 2</h4>
                    <p className="text-sm text-gray-600">More information</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded border-l-4 border-green-400">
                <h3 className="font-semibold mb-2">Recent Activity</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>User logged in</span>
                    <span className="text-gray-500">2 min ago</span>
                  </div>
                  <div className="flex justify-between">
                    <span>New message received</span>
                    <span className="text-gray-500">5 min ago</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="col-span-1 space-y-4">
              <div className="bg-green-50 p-4 rounded border-l-4 border-green-400">
                <h3 className="font-semibold mb-2">Notifications</h3>
                <div className="text-sm space-y-2">
                  <div className="bg-yellow-100 p-2 rounded">System update available</div>
                  <div className="bg-blue-100 p-2 rounded">New feature released</div>
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded border-l-4 border-green-400">
                <h3 className="font-semibold mb-2">Tools</h3>
                <div className="space-y-2">
                  <button className="w-full bg-green-600 text-white p-2 rounded text-sm">
                    Export Data
                  </button>
                  <button className="w-full bg-gray-600 text-white p-2 rounded text-sm">
                    Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ResponsiveComponent>

      {/* Mobile Portrait Layout */}
      <ResponsiveComponent showOnLayoutTypes={['mobile-portrait']}>
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-blue-600">📱 Mobile Portrait Layout</h2>
            <div className="text-xs text-gray-500">
              {device.screenWidth}x{device.screenHeight}
            </div>
          </div>

          {/* Mobile Portrait: Single column, card-based layout */}
          <div className="space-y-4">
            {/* Main action card */}
            <div className="bg-blue-50 p-4 rounded border-l-4 border-blue-400">
              <h3 className="font-semibold mb-2">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-2">
                <button className="bg-blue-600 text-white p-3 rounded text-sm font-medium">
                  New Post
                </button>
                <button className="bg-gray-600 text-white p-3 rounded text-sm font-medium">
                  Messages
                </button>
              </div>
            </div>

            {/* Stats card - simplified for mobile */}
            <div className="bg-blue-50 p-4 rounded border-l-4 border-blue-400">
              <h3 className="font-semibold mb-2">Today's Stats</h3>
              <div className="flex justify-between text-sm">
                <span>Posts: 5</span>
                <span>Views: 123</span>
                <span>Likes: 34</span>
              </div>
            </div>

            {/* Recent activity - compact */}
            <div className="bg-blue-50 p-4 rounded border-l-4 border-blue-400">
              <h3 className="font-semibold mb-2">Recent</h3>
              <div className="space-y-2">
                <div className="text-sm bg-white p-2 rounded shadow-sm">
                  <div className="font-medium">New notification</div>
                  <div className="text-gray-600 text-xs">2 minutes ago</div>
                </div>
                <div className="text-sm bg-white p-2 rounded shadow-sm">
                  <div className="font-medium">Message from John</div>
                  <div className="text-gray-600 text-xs">5 minutes ago</div>
                </div>
              </div>
            </div>

            {/* Navigation - mobile style */}
            <div className="bg-blue-50 p-4 rounded border-l-4 border-blue-400">
              <h3 className="font-semibold mb-2">Menu</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-white p-2 rounded text-center">Profile</div>
                <div className="bg-white p-2 rounded text-center">Settings</div>
                <div className="bg-white p-2 rounded text-center">Help</div>
                <div className="bg-white p-2 rounded text-center">About</div>
              </div>
            </div>
          </div>
        </div>
      </ResponsiveComponent>

      {/* Mobile Landscape Layout */}
      <ResponsiveComponent showOnLayoutTypes={['mobile-landscape']}>
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-purple-600">📱 Mobile Landscape Layout</h2>
            <div className="text-xs text-gray-500">
              {device.screenWidth}x{device.screenHeight}
            </div>
          </div>

          {/* Mobile Landscape: Two columns to use horizontal space better */}
          <div className="grid grid-cols-2 gap-4">
            {/* Left Column */}
            <div className="space-y-3">
              <div className="bg-purple-50 p-3 rounded border-l-4 border-purple-400">
                <h3 className="font-semibold mb-2 text-sm">Quick Actions</h3>
                <div className="space-y-2">
                  <button className="w-full bg-purple-600 text-white p-2 rounded text-sm">
                    New Post
                  </button>
                  <button className="w-full bg-gray-600 text-white p-2 rounded text-sm">
                    Messages
                  </button>
                </div>
              </div>

              <div className="bg-purple-50 p-3 rounded border-l-4 border-purple-400">
                <h3 className="font-semibold mb-2 text-sm">Stats</h3>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Posts:</span>
                    <span>5</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Views:</span>
                    <span>123</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Likes:</span>
                    <span>34</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-3">
              <div className="bg-purple-50 p-3 rounded border-l-4 border-purple-400">
                <h3 className="font-semibold mb-2 text-sm">Recent Activity</h3>
                <div className="space-y-2">
                  <div className="text-xs bg-white p-2 rounded shadow-sm">
                    <div className="font-medium">New notification</div>
                    <div className="text-gray-600">2 min ago</div>
                  </div>
                  <div className="text-xs bg-white p-2 rounded shadow-sm">
                    <div className="font-medium">Message received</div>
                    <div className="text-gray-600">5 min ago</div>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 p-3 rounded border-l-4 border-purple-400">
                <h3 className="font-semibold mb-2 text-sm">Navigation</h3>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <div className="bg-white p-2 rounded text-center">Profile</div>
                  <div className="bg-white p-2 rounded text-center">Settings</div>
                  <div className="bg-white p-2 rounded text-center">Help</div>
                  <div className="bg-white p-2 rounded text-center">About</div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional info for landscape */}
          <div className="mt-4 p-3 bg-purple-50 rounded border-l-4 border-purple-400">
            <div className="text-xs text-gray-600">
              💡 Landscape mode optimizes for horizontal space usage while keeping content accessible
            </div>
          </div>
        </div>
      </ResponsiveComponent>

      {/* Tablet layouts for reference */}
      <ResponsiveComponent showOnLayoutTypes={['tablet-portrait', 'tablet-landscape']}>
        <div className="bg-white rounded-lg shadow-lg p-4 mt-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-orange-600">
              📟 Tablet Layout ({device.orientation})
            </h2>
            <div className="text-xs text-gray-500">
              {device.screenWidth}x{device.screenHeight}
            </div>
          </div>
          
          <div className="bg-orange-50 p-4 rounded border-l-4 border-orange-400">
            <p className="text-sm">
              This is a tablet layout - different from mobile landscape! 
              Notice how it's clearly distinguished from mobile landscape mode.
            </p>
          </div>
        </div>
      </ResponsiveComponent>

      {/* Debug info */}
      <div className="mt-6 p-4 bg-gray-800 text-white rounded-lg text-sm font-mono">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-yellow-300 font-bold">Current Device Info:</div>
            <div>Layout Type: <span className="text-green-300">{device.layoutType}</span></div>
            <div>Device Type: <span className="text-blue-300">{device.deviceType}</span></div>
            <div>Orientation: <span className="text-purple-300">{device.orientation}</span></div>
          </div>
          <div>
            <div className="text-yellow-300 font-bold">Boolean Flags:</div>
            <div>isMobilePortrait: <span className="text-green-300">{device.isMobilePortrait ? 'true' : 'false'}</span></div>
            <div>isMobileLandscape: <span className="text-green-300">{device.isMobileLandscape ? 'true' : 'false'}</span></div>
            <div>isDesktopAny: <span className="text-green-300">{device.isDesktopAny ? 'true' : 'false'}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};