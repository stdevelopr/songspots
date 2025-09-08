import React from 'react';
import { useInternetIdentity } from 'ic-use-internet-identity';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose, onLogin }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs sm:max-w-md md:max-w-lg mx-2 sm:mx-4 overflow-hidden animate-scale-in max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 px-4 py-6 sm:px-8 sm:py-8 text-white text-center">
          <div className="text-4xl sm:text-6xl mb-2 sm:mb-4">🎵</div>
          <h1 className="text-xl sm:text-3xl font-bold mb-1 sm:mb-2">Welcome to Vybers</h1>
          <p className="text-indigo-100 text-sm sm:text-lg">Where music meets memories</p>
        </div>

        {/* Content */}
        <div className="px-4 py-6 sm:px-8 sm:py-8">
          <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
            <div className="flex items-start gap-2 sm:gap-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-0.5 sm:mb-1 text-sm sm:text-base">
                  Pin Your Music Memories
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm">
                  Drop pins on places where you discovered amazing songs or had musical moments
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 sm:gap-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-0.5 sm:mb-1 text-sm sm:text-base">
                  Share Your Soundtrack
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm">
                  Add YouTube or Spotify links to share the exact songs that matter to each place
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 sm:gap-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-0.5 sm:mb-1 text-sm sm:text-base">
                  Discover New Vibes
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm">
                  Explore music memories from others and discover new songs tied to real places
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2 sm:space-y-3">
            <button
              onClick={onLogin}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl cursor-pointer text-sm sm:text-base"
            >
              Get Started - It's Free!
            </button>
            <button
              onClick={onClose}
              className="w-full text-gray-600 hover:text-gray-800 font-medium py-1.5 sm:py-2 px-4 sm:px-6 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer text-xs sm:text-base"
            >
              Explore as Guest
            </button>
          </div>

          <p className="text-[10px] sm:text-xs text-gray-500 text-center mt-2 sm:mt-4">
            Secure login powered by Internet Identity
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;
