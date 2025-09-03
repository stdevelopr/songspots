import React from 'react';

interface ProfileQuickActionsProps {
  onCopyPrincipal: () => void;
  copied: boolean;
}

const ProfileQuickActions: React.FC<ProfileQuickActionsProps> = ({
  onCopyPrincipal,
  copied,
}) => {
  return (
    <div className="bg-white/95 rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-lg transition-shadow duration-200">
      <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <svg
          className="w-4 h-4 text-purple-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
        Quick Actions
      </h3>
      <div className="space-y-2">
        <button
          onClick={onCopyPrincipal}
          className="w-full flex items-center gap-3 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-left"
        >
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg
              className="w-4 h-4 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-800">Copy Profile ID</p>
            <p className="text-xs text-gray-500">Share your profile with others</p>
          </div>
          {copied && <div className="text-xs text-green-600 font-medium">Copied!</div>}
        </button>
      </div>
    </div>
  );
};

export default ProfileQuickActions;