import React from 'react';
import { useInternetIdentity } from 'ic-use-internet-identity';
import { useState } from 'react';

export function LoginButton() {
  const { login, clear, identity } = useInternetIdentity();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Identity might be present even if loginStatus is idle, since is saved in local storage
  const isAuthenticated = !!identity;
  const disabled = isLoggingIn;

  // Determine button text based on both the loginStatus and identity presence
  const text = isLoggingIn ? 'Logging in...' : isAuthenticated ? 'Logout' : 'Login';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
    } else {
      setIsLoggingIn(true);
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        // If we get "already authenticated" but the UI doesn't show it,
        // it's a state inconsistency - clear and try again
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => {
            login();
          }, 300);
        }
      } finally {
        setIsLoggingIn(false);
      }
    }
  };

  return (
    <button
      onClick={handleAuth}
      disabled={disabled}
      className={`flex items-center gap-2 px-3 h-9 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg hover:bg-white/20 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 transition-all cursor-pointer group disabled:opacity-50`}
      aria-label={isAuthenticated ? 'Logout' : 'Login'}
    >
      <span
        className={
          isAuthenticated
            ? 'flex h-7 w-7 items-center justify-center rounded-full'
            : 'flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-500 border border-blue-100 shadow'
        }
      >
        {isAuthenticated ? (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth={2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"
            />
          </svg>
        ) : (
          <svg
            className="h-4 w-4 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
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
        )}
      </span>
      <span className="font-bold text-white text-sm drop-shadow-sm">{text}</span>
    </button>
  );
}

export default LoginButton;
