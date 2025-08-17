import React, { useState, useEffect } from 'react';
import InteractiveMap from './components/InteractiveMap';
import LoginButton from './components/LoginButton';
import ProfileButton from './components/ProfileButton';
import ProfilePage from './components/ProfilePage';
import { useInternetIdentity } from 'ic-use-internet-identity';
import { useGetAllPins } from './hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';

interface SelectedPin {
  lat: number;
  lng: number;
  id: string;
}

function App() {
  const { identity } = useInternetIdentity();

  console.log({ identity });
  const queryClient = useQueryClient();
  const isAuthenticated = !!identity;

  const [currentView, setCurrentView] = useState<'map' | 'profile'>('map');
  const [profileUserId, setProfileUserId] = useState<string | null>(null);
  const [selectedPin, setSelectedPin] = useState<SelectedPin | null>(null);
  const [isLoadingMapTransition, setIsLoadingMapTransition] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Track individual loading states
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  const [isLocationProcessed, setIsLocationProcessed] = useState(false);
  const [isPinsLoaded, setIsPinsLoaded] = useState(false);
  const [isMapCentered, setIsMapCentered] = useState(false);

  // Get pins data to check if they're loaded
  const { data: pins = [], isLoading: isLoadingPins, isFetching: isFetchingPins } = useGetAllPins();

  // Track when pins are loaded
  useEffect(() => {
    if (!isLoadingPins && !isFetchingPins) {
      setIsPinsLoaded(true);
    } else {
      setIsPinsLoaded(false);
    }
  }, [isLoadingPins, isFetchingPins]);

  // Reset all loading states on component mount to ensure fresh state on every page load
  useEffect(() => {
    // This effect runs on every mount (including first load and reloads)
    setIsInitialLoading(true);
    setIsMapInitialized(false);
    setIsLocationProcessed(false);
    setIsPinsLoaded(false);
    setIsMapCentered(false);
  }, []); // Empty dependency array ensures this runs on every mount

  // Handle initial loading state - only hide when ALL conditions are met
  useEffect(() => {
    // All conditions must be true to dismiss the loading indicator
    const allConditionsMet =
      isMapInitialized && isPinsLoaded && isLocationProcessed && isMapCentered;

    if (allConditionsMet && isInitialLoading) {
      // Add a small delay to ensure everything is rendered and positioned
      const timer = setTimeout(() => {
        setIsInitialLoading(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isMapInitialized, isPinsLoaded, isLocationProcessed, isMapCentered, isInitialLoading]);

  // Fallback timeout to prevent loading indicator from getting stuck
  useEffect(() => {
    if (isInitialLoading) {
      const fallbackTimer = setTimeout(() => {
        console.warn('Loading indicator timeout reached, forcing dismissal');
        setIsInitialLoading(false);
      }, 20000); // 20 second fallback timeout

      return () => clearTimeout(fallbackTimer);
    }
  }, [isInitialLoading]);

  // Clear all cached data when logging out
  useEffect(() => {
    if (!isAuthenticated) {
      queryClient.clear();
    }
  }, [isAuthenticated, queryClient]);

  const handleProfileClick = () => {
    setProfileUserId(null); // View own profile
    setCurrentView('profile');
    // Always dismiss loading indicator when switching to profile
    setIsLoadingMapTransition(false);
  };

  const handleViewUserProfile = (userId: string) => {
    setProfileUserId(userId);
    setCurrentView('profile');
    // Always dismiss loading indicator when switching to profile
    setIsLoadingMapTransition(false);
  };

  const handleBackToMap = () => {
    setCurrentView('map');
    setProfileUserId(null);
    setSelectedPin(null); // Clear selected pin when navigating back normally
    setIsLoadingMapTransition(false); // Ensure loading is dismissed
  };

  const handleViewPinOnMap = (pinId: string, lat: number, lng: number) => {
    setSelectedPin({ id: pinId, lat, lng });
    setIsLoadingMapTransition(true); // Show loading indicator only when navigating to map
    setCurrentView('map');
    setProfileUserId(null);
  };

  const handleMapReady = () => {
    // Hide loading indicator when map is ready and centered
    setIsLoadingMapTransition(false);
  };

  const handleMapInitialized = () => {
    // Called when the map itself is initialized
    setIsMapInitialized(true);
  };

  const handleLocationProcessed = () => {
    // Called when the location request has been completed (either success or failure)
    setIsLocationProcessed(true);
  };

  const handleMapCentered = () => {
    // Called when the map has been properly centered (either on user location or default)
    setIsMapCentered(true);
  };

  // Auto-dismiss loading indicator after timeout for map transitions
  useEffect(() => {
    if (isLoadingMapTransition) {
      const timeout = setTimeout(() => {
        setIsLoadingMapTransition(false);
      }, 15000); // 15 second timeout

      return () => clearTimeout(timeout);
    }
  }, [isLoadingMapTransition]);

  // Always dismiss loading indicator when switching to profile view
  useEffect(() => {
    if (currentView === 'profile') {
      setIsLoadingMapTransition(false);
    }
  }, [currentView]);

  return (
    <div className="h-screen w-screen flex flex-col">
      {/* Initial loading overlay - covers entire app until all conditions are met */}
      {isInitialLoading && (
        <div className="fixed inset-0 bg-white z-[9999] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-6"></div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">Loading Music Memories</h3>
            <p className="text-gray-600 max-w-md mx-auto mb-4">
              Initializing map, loading pins, requesting location, and centering map...
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"
                  style={{ animationDelay: '0.1s' }}
                ></div>
                <div
                  className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                ></div>
              </div>
              <span>Please wait</span>
            </div>

            {/* Debug info in development */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 text-xs text-gray-400 space-y-1">
                <div>Map: {isMapInitialized ? '✓' : '⏳'}</div>
                <div>Pins: {isPinsLoaded ? '✓' : '⏳'}</div>
                <div>Location: {isLocationProcessed ? '✓' : '⏳'}</div>
                <div>Centered: {isMapCentered ? '✓' : '⏳'}</div>
              </div>
            )}
          </div>
        </div>
      )}

      <header className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 shadow-lg border-b border-purple-200 px-6 py-3 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <span className="text-lg">🎵</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent tracking-tight">
                Music Memories
              </h1>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {currentView === 'map' && !isLoadingMapTransition && !isInitialLoading && (
              <p className="text-sm text-purple-100 font-medium bg-white bg-opacity-10 px-3 py-1.5 rounded-full backdrop-blur-sm">
                Click anywhere on the map to add pins
              </p>
            )}
            <div className="flex items-center space-x-2">
              {isAuthenticated && (
                <ProfileButton onProfileClick={handleProfileClick} currentView={currentView} />
              )}
              <LoginButton />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 relative">
        {/* Loading overlay for map transitions - only show when transitioning to map */}
        {isLoadingMapTransition && currentView === 'map' && !isInitialLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Preparing Map</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Centering map on the selected pin location...
              </p>
            </div>
          </div>
        )}

        {currentView === 'map' ? (
          <InteractiveMap
            onViewUserProfile={handleViewUserProfile}
            selectedPin={selectedPin}
            onPinSelected={() => setSelectedPin(null)} // Clear selection after highlighting
            onMapReady={handleMapReady} // Callback for when map is ready
            onMapInitialized={handleMapInitialized} // Callback for when map is initialized
            onLocationProcessed={handleLocationProcessed} // Callback for when location is processed
            onMapCentered={handleMapCentered} // Callback for when map is centered
            isLoadingTransition={isLoadingMapTransition} // Pass loading state
            isInitialLoading={isInitialLoading} // Pass initial loading state
          />
        ) : (
          <ProfilePage
            onBackToMap={handleBackToMap}
            userId={profileUserId}
            onViewPinOnMap={handleViewPinOnMap}
          />
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 px-6 py-3 text-center text-sm text-gray-600">
        © 2025. Built with <span className="text-red-500">♥</span> using{' '}
        <a
          href="https://caffeine.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}

export default App;
