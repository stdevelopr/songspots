import LoginButton from './LoginButton';

interface AppHeaderProps {
  onProfileClick: () => void;
  onLogout: () => void;
  currentView: 'map' | 'profile' | 'responsive-demo';
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
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
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
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                      />
                    </svg>
                  </span>
                  <span className="font-bold text-white text-sm drop-shadow-sm">Map</span>
                </button>
              </>
            )}

            <span className="relative flex items-center justify-center h-12 w-12">
              <img
                src="/vibe_spot.png"
                alt="Vibe Spots Logo"
                className="h-12 w-12 object-contain drop-shadow"
                draggable="false"
              />
            </span>

            <div className="hidden md:flex items-center gap-3">
              <div className="h-6 w-px bg-white/25" />
              <h1 className="text-xl tracking-tight">
                <span className="text-white/95 font-medium">Vybers </span>
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
                    {/* Sparkles vibe icon */}
                    <svg
                      className="h-5 w-5 text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                      />
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
