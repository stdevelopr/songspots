import { useState, useEffect } from 'react';

import LoginButton from './features/common/LoginButton';
import AppHeader from './features/common/AppHeader';
import ProfilePage from './features/profile/ProfilePage';
import WelcomeModal from './features/common/WelcomeModal';
import LoginPromptModal from './features/common/LoginPromptModal';
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
  const { identity, status, clear, login } = useInternetIdentity();

  const queryClient = useQueryClient();
  const isAuthenticated = !!identity;

  const [currentView, setCurrentView] = useState<'map' | 'profile'>('map');
  const [profileUserId, setProfileUserId] = useState<string | null>(null);
  const [selectedPin, setSelectedPin] = useState<SelectedPin | null>(null);

  // Modal states
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showLoginPromptModal, setShowLoginPromptModal] = useState(false);
  const [loginPromptAction, setLoginPromptAction] = useState('start creating and tracking your vibes');

  console.log('selectedPin in App.tsx:', selectedPin);
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

  // Show welcome modal for first-time visitors
  useEffect(() => {
    if (!isAuthenticated && !localStorage.getItem('hasSeenWelcome')) {
      setShowWelcomeModal(true);
    }
  }, [isAuthenticated]);

  // Debug function to show welcome modal (remove in production)
  useEffect(() => {
    const showModal = () => {
      if (window.location.hash === '#welcome') {
        setShowWelcomeModal(true);
      }
    };
    showModal();
    window.addEventListener('hashchange', showModal);
    return () => window.removeEventListener('hashchange', showModal);
  }, []);

  // Handle login from modals
  const handleLoginFromModal = async () => {
    try {
      await login();
      setShowWelcomeModal(false);
      setShowLoginPromptModal(false);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  // Handle welcome modal close
  const handleWelcomeModalClose = () => {
    setShowWelcomeModal(false);
    localStorage.setItem('hasSeenWelcome', 'true');
  };

  // Handle showing login prompt for actions
  const handleShowLoginPrompt = (action?: string) => {
    if (!isAuthenticated) {
      setLoginPromptAction(action || 'start creating and tracking your vibes');
      setShowLoginPromptModal(true);
    }
  };

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

  const handleViewUserProfile = (userId: string | null) => {
    setProfileUserId(userId);
    setCurrentView('profile');
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

      <AppHeader
        onProfileClick={handleProfileClick}
        onLogout={handleLogout}
        currentView={currentView}
        isAuthenticated={isAuthenticated}
        onBackToMap={handleBackToMap}
      />

      <main className="flex-1 relative overflow-hidden min-h-0">
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
            onShowLoginPrompt={handleShowLoginPrompt}
            isAuthenticated={isAuthenticated}
          />
        ) : (
          <ProfilePage onBackToMap={handleBackToMap} userId={profileUserId} />
        )}
      </main>

      {/* Modals */}
      <WelcomeModal
        isOpen={showWelcomeModal}
        onClose={handleWelcomeModalClose}
        onLogin={handleLoginFromModal}
      />
      
      <LoginPromptModal
        isOpen={showLoginPromptModal}
        onClose={() => setShowLoginPromptModal(false)}
        onLogin={handleLoginFromModal}
        action={loginPromptAction}
      />
    </div>
  );
}

export default App;
