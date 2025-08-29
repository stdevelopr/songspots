import ProfileButton from '../profile/ProfileButton';
import LoginButton from './LoginButton';

interface AppHeaderProps {
  onProfileClick: () => void;
  onLogout: () => void;
  currentView: 'map' | 'profile';
  isAuthenticated: boolean;
  onBackToMap?: () => void;
}

export default function AppHeader({
  onProfileClick,
  onLogout,
  currentView,
  isAuthenticated,
  onBackToMap,
}: AppHeaderProps) {
  return (
    <header
      className="sticky top-0 z-20 bg-gradient-to-r from-black via-zinc-800 to-zinc-900 shadow-lg border-b border-zinc-800"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 relative">
        <div className="flex h-14 items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-4">
            {/* Back/Map in header, consistent position for all breakpoints */}
            {currentView === 'profile' && onBackToMap && (
              <>
                {/* Mobile icon button */}
                <button
                  onClick={onBackToMap}
                  className="md:hidden flex items-center justify-center w-9 h-9 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg hover:bg-white/20 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 transition-all cursor-pointer"
                  aria-label="Map"
                >
                  <svg
                    className="h-5 w-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
                {/* Desktop pill button */}
                <button
                  onClick={onBackToMap}
                  className="hidden md:flex items-center gap-2 mr-1 px-3 h-9 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg hover:bg-white/20 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 transition-all cursor-pointer"
                  aria-label="Map"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-500 border border-blue-100 shadow">
                    <svg
                      className="h-4 w-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                  </span>
                  <span className="font-bold text-white text-sm drop-shadow-sm">Map</span>
                </button>
              </>
            )}

            <span className="relative flex items-center justify-center h-12 w-12">
              <img
                src="/song_spot.png"
                alt="Song Spots Logo"
                className="h-12 w-12 object-contain drop-shadow"
                draggable="false"
              />
            </span>

            <div className="hidden md:flex items-center gap-3">
              <div className="h-6 w-px bg-white/25" />
              <h1 className="text-xl tracking-tight">
                <span className="text-white/95 font-medium">Song </span>
                <span className="font-extrabold bg-gradient-to-r from-yellow-50 to-yellow-50 bg-clip-text text-transparent">
                  Spots
                </span>
              </h1>
            </div>

            {/* Desktop Map pill moved to the far left (above) for consistency */}
          </div>
          {/* Auth area: show login if not authenticated, else profile + logout */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Profile button */}
                <button
                  onClick={onProfileClick}
                  className="flex items-center gap-2 px-3 h-9 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg hover:bg-white/20 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 transition-all cursor-pointer group"
                  aria-label="Profile"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-500 border border-blue-100 shadow">
                    {/* Musical note icon only */}
                    <svg
                      className="h-5 w-5 text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 18V5l12-2v13" />
                      <circle cx="6" cy="18" r="3" />
                      <circle cx="18" cy="16" r="3" />
                    </svg>
                  </span>
                  <span className="font-bold text-white text-sm drop-shadow-sm">My Profile</span>
                </button>

                {/* Logout button — same pill style as Profile */}
                <button
                  onClick={onLogout}
                  className="flex items-center gap-2 px-3 h-9 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg hover:bg-white/20 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 transition-all cursor-pointer"
                  aria-label="Logout"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-red-500 border border-rose-100 shadow">
                    <svg
                      className="h-4 w-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      viewBox="0 0 24 24"
                    >
                      <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
                    </svg>
                  </span>
                  <span className="hidden md:flex font-bold text-white text-sm drop-shadow-sm">
                    Logout
                  </span>
                </button>
              </>
            ) : (
              <LoginButton />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
