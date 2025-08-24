import ProfileButton from '../profile/ProfileButton';
import LoginButton from './LoginButton';

interface AppHeaderProps {
  onProfileClick: () => void;
  onLogout: () => void;
  currentView: 'map' | 'profile';
  isAuthenticated: boolean;
}

export default function AppHeader({
  onProfileClick,
  onLogout,
  currentView,
  isAuthenticated,
}: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-20 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 shadow-lg border-b border-purple-200">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 relative">
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
                    <svg
                      className="h-4 w-4 text-white block group-hover:hidden"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <svg
                      className="h-4 w-4 text-white hidden group-hover:block"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 3v10.15A4 4 0 1 0 14 17V7h4V3h-6z" />
                    </svg>
                  </span>
                  <span className="font-bold text-white text-sm drop-shadow-sm">Profile</span>
                </button>

                {/* Logout button — same pill style as Profile */}
                <button
                  onClick={onLogout}
                  className="flex items-center gap-2 px-3 h-9 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg hover:bg-white/20 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 transition-all cursor-pointer"
                  aria-label="Logout"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-pink-400 border border-rose-100 shadow">
                    <svg
                      className="h-4 w-4 text-white "
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"
                      />
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
