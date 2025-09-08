import { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate, useParams, Navigate } from 'react-router-dom';

import LoginButton from './features/common/LoginButton';
import AppHeader from './features/common/AppHeader';
import ProfilePage from './features/profile/ProfilePage';
import WelcomeModal from './features/common/WelcomeModal';
import LoginPromptModal from './features/common/LoginPromptModal';
import { DeviceInfoDisplay } from './features/common/DeviceInfoDisplay';
import { ThreeLayoutExample } from './features/common/ThreeLayoutExample';
import { useInternetIdentity } from 'ic-use-internet-identity';
import { useGetAllPins } from './features/common/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import InteractiveMap from './features/map/interactive-map';
import { Loader } from './features/common/Loader';
import VibeInfoPopupDemo from './features/vibes/demo/VibeInfoPopupDemo';
import ComponentLab from './features/dev/ComponentLab';
import AdminPage from './features/admin/AdminPage';

interface SelectedVibe {
  lat: number;
  lng: number;
  id: string;
}

function ProfileRoute({ onBackToMap }: { onBackToMap: () => void }) {
  const { userId } = useParams();
  return <ProfilePage onBackToMap={onBackToMap} userId={userId ?? null} />;
}

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const isDevPopupDemo = typeof window !== 'undefined' && window.location.pathname === '/dev/vibe-popup-demo';
  if (isDevPopupDemo) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <VibeInfoPopupDemo />
      </div>
    );
  }
  const { identity, status, clear, login } = useInternetIdentity();

  const queryClient = useQueryClient();
  const isAuthenticated = !!identity;

  const [currentView, setCurrentView] = useState<'map' | 'profile' | 'responsive-demo'>(() => 'map');
  const [profileUserId, setProfileUserId] = useState<string | null>(null);
  const [selectedVibe, setSelectedVibe] = useState<SelectedVibe | null>(null);

  // Modal states
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showLoginPromptModal, setShowLoginPromptModal] = useState(false);
  const [loginPromptAction, setLoginPromptAction] = useState(
    'start creating and tracking your vibes'
  );

  console.log('selectedVibe in App.tsx:', selectedVibe);
  const [isLoadingMapTransition, setIsLoadingMapTransition] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Track individual loading states
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  const [isLocationProcessed, setIsLocationProcessed] = useState(false);
  const [isVibesLoaded, setIsVibesLoaded] = useState(false);
  const [isMapCentered, setIsMapCentered] = useState(false);

  // Get vibes data to check if they're loaded
  const { data: vibes = [], isLoading: isLoadingVibes, isFetching: isFetchingVibes } = useGetAllPins();

  // Track when vibes are loaded
  useEffect(() => {
    if (!isLoadingVibes && !isFetchingVibes) {
      setIsVibesLoaded(true);
    } else {
      setIsVibesLoaded(false);
    }
  }, [isLoadingVibes, isFetchingVibes]);

  // Reset all loading states on component mount to ensure fresh state on every page load
  useEffect(() => {
    // This effect runs on every mount (including first load and reloads)
    setIsInitialLoading(true);
    setIsMapInitialized(false);
    setIsLocationProcessed(false);
    setIsVibesLoaded(false);
    setIsMapCentered(false);
  }, []); // Empty dependency array ensures this runs on every mount

  // Handle initial loading state - only hide when ALL conditions are met
  useEffect(() => {
    // All conditions must be true to dismiss the loading indicator
    const allConditionsMet =
      isMapInitialized && isVibesLoaded && isLocationProcessed && isMapCentered;

    if (allConditionsMet && isInitialLoading) {
      // Add a small delay to ensure everything is rendered and positioned
      const timer = setTimeout(() => {
        setIsInitialLoading(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isMapInitialized, isVibesLoaded, isLocationProcessed, isMapCentered, isInitialLoading]);

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
    setProfileUserId(null);
    setIsLoadingMapTransition(false);
    navigate('/profile');
  };

  const handleLogout = async () => {
    await clear();
    navigate('/');
    setProfileUserId(null);
    setSelectedVibe(null);
    setIsLoadingMapTransition(false);
  };

  const handleViewUserProfile = (userId: string | null) => {
    setProfileUserId(userId);
    setIsLoadingMapTransition(false);
    if (userId) {
      navigate(`/profile/${encodeURIComponent(userId)}`);
    } else {
      navigate('/profile');
    }
  };

  const handleBackToMap = () => {
    navigate('/');
    setProfileUserId(null);
    setSelectedVibe(null); // Clear selected vibe when navigating back normally
    setIsLoadingMapTransition(false); // Ensure loading is dismissed
  };

  const [fromProfile, setFromProfile] = useState(false);
  const handleViewVibeOnMap = (
    vibeId: string,
    lat: number,
    lng: number,
    fromProfileFlag?: boolean
  ) => {
    setSelectedVibe({ id: vibeId, lat, lng });
    setIsLoadingMapTransition(true); // Show loading indicator only when navigating to map
    navigate('/');
    setProfileUserId(null);
    setFromProfile(!!fromProfileFlag);
  };

  const handleMapReady = () => {
    // Hide loading indicator when map is ready and centered
    setIsLoadingMapTransition(false);
    setFromProfile(false); // Reset fromProfile so future vibe selections fly over
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
  // Track currentView based on the URL
  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/profile')) {
      setCurrentView('profile');
    } else if (path.startsWith('/dev/responsive-demo')) {
      setCurrentView('responsive-demo');
    } else {
      setCurrentView('map');
    }
    if (path.startsWith('/profile')) setIsLoadingMapTransition(false);
  }, [location.pathname]);

  if (status === 'initializing' || isLoadingVibes) return <Loader />;

  return (
    <div className="h-screen w-screen flex flex-col touch-manipulation">
      {/* Initial loading overlay - covers entire app until all conditions are met */}

      <AppHeader
        onProfileClick={handleProfileClick}
        onLogout={handleLogout}
        currentView={currentView}
        isAuthenticated={isAuthenticated}
        onBackToMap={handleBackToMap}
      />

      <main className="flex-1 relative overflow-hidden min-h-0 w-full">
        {/* Loading overlay for map transitions - only show when transitioning to map */}
        {isLoadingMapTransition && currentView === 'map' && !isInitialLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-95 flex items-center justify-center z-40 pointer-events-none">
            <div className="absolute inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Preparing Map</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Centering map on the selected vibe location...
              </p>
            </div>
          </div>
        )}

        <Routes>
          <Route
            path="/"
            element={
              <InteractiveMap
                backendPins={vibes}
                onViewUserProfile={handleViewUserProfile}
                selectedPin={selectedVibe}
                setSelectedPin={setSelectedVibe}
                onPinSelected={(pin: { id: string; lat: number; lng: number }) => setSelectedVibe(pin)}
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
            }
          />
          <Route path="/profile" element={<ProfilePage onBackToMap={handleBackToMap} userId={null} />} />
          <Route path="/profile/:userId" element={<ProfileRoute onBackToMap={handleBackToMap} />} />
          <Route path="/dev/vibe-popup-demo" element={<VibeInfoPopupDemo />} />
          <Route path="/dev/lab" element={<ComponentLab />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/dev/responsive-demo" element={<ThreeLayoutExample />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
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

      {/* Device info display - only shows in development */}
      {/* <DeviceInfoDisplay /> */}
    </div>
  );
}

export default App;
