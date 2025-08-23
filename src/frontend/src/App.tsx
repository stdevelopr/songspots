import { useState, useEffect } from 'react';

import LoginButton from './features/common/LoginButton';
import ProfileButton from './features/profile/ProfileButton';
import ProfilePage from './features/profile/ProfilePage';
import { useInternetIdentity } from 'ic-use-internet-identity';
import { useGetAllPins } from './features/common/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import InteractiveMap from './features/map/interactive-map';
import { Loader } from './features/common/Loader';

interface SelectedPin {
  lat: number;
  lng: number;
  id: string;
}

function App() {
  const { identity, status, clear } = useInternetIdentity();

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

  // Clear all cached data when logging out
  useEffect(() => {
    if (!isAuthenticated) {
      queryClient.clear();
    }
  }, [isAuthenticated, queryClient]);

  const handleProfileClick = () => {
    setProfileUserId(null); // View own profile
    setCurrentView('profile');
    setIsLoadingMapTransition(false);
  };

  const handleLogout = async () => {
    await clear();
    setCurrentView('map');
    setProfileUserId(null);
    setSelectedPin(null);
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

  const [fromProfile, setFromProfile] = useState(false);
  const handleViewPinOnMap = (
    pinId: string,
    lat: number,
    lng: number,
    fromProfileFlag?: boolean
  ) => {
    setSelectedPin({ id: pinId, lat, lng });
    setIsLoadingMapTransition(true); // Show loading indicator only when navigating to map
    setCurrentView('map');
    setProfileUserId(null);
    setFromProfile(!!fromProfileFlag);
  };

  const handleMapReady = () => {
    // Hide loading indicator when map is ready and centered
    setIsLoadingMapTransition(false);
    setFromProfile(false); // Reset fromProfile so future pin selections fly over
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

  if (status === 'initializing' || isLoadingPins) return <Loader />;

  return (
    <div className="h-screen w-screen flex flex-col">
      {/* Initial loading overlay - covers entire app until all conditions are met */}

      <header className="sticky top-0 z-20 bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500/90 backdrop-blur-sm border-b border-white/10 shadow-lg">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
          <div className="flex h-14 items-center justify-between">
            {/* Brand */}
            <div className="flex items-center gap-4">
              <button
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 border border-white/20 backdrop-blur-md shadow-sm hover:bg-white/20 active:scale-[0.98] transition-all"
                aria-label="Home"
              >
                <span className="relative flex items-center justify-center h-5 w-5">
                  {/* Music note */}
                  <svg className="h-4 w-4 text-white/90" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 17V5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v12a4 4 0 1 1-2-3.465V7h-4v10a4 4 0 1 1-2-3.465z" />
                  </svg>
                  {/* Pin */}
                  <svg
                    className="absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 text-sky-200"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 2a6 6 0 016 6c0 4.418-6 10-6 10S4 12.418 4 8a6 6 0 016-6zm0 8a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              </button>

              <div className="hidden md:flex items-center gap-3">
                <div className="h-6 w-px bg-white/25" />
                <h1 className="text-xl tracking-tight">
                  <span className="text-white/95 font-medium">Music </span>
                  <span className="font-extrabold bg-gradient-to-r from-white to-pink-200 bg-clip-text text-transparent">
                    Memories
                  </span>
                </h1>
              </div>
            </div>

            {/* Account area */}
            <div className="flex items-center">
              <div className="flex items-center gap-2 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md px-2.5 py-1.5 shadow-md">
                <ProfileButton onProfileClick={handleProfileClick} currentView={currentView} />
                <button
                  className="inline-flex items-center justify-center rounded-full px-4 py-1.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 shadow hover:shadow-lg hover:brightness-110 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 transition-all"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 relative">
        {/* Loading overlay for map transitions - only show when transitioning to map */}
        {isLoadingMapTransition && currentView === 'map' && !isInitialLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-95 flex items-center justify-center z-40 pointer-events-none">
            <div className="absolute inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50">
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
            backendPins={pins}
            onViewUserProfile={handleViewUserProfile}
            selectedPin={selectedPin}
            setSelectedPin={setSelectedPin}
            onPinSelected={(pin: { id: string; lat: number; lng: number }) => setSelectedPin(pin)}
            onMapReady={handleMapReady}
            onMapInitialized={handleMapInitialized}
            onLocationProcessed={handleLocationProcessed}
            onMapCentered={handleMapCentered}
            isLoadingTransition={isLoadingMapTransition}
            isInitialLoading={isInitialLoading}
            fromProfile={fromProfile}
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
