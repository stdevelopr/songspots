import React, { useState } from 'react';

interface ProfileCardProps {
  name: string;
  principalId: string;
  photoUrl?: string | null;
  headerGradient?: string; // e.g., 'from-purple-600 via-blue-600 to-indigo-700'
  totalCount: number;
  visiblePins: any[];
  userPins: any[];
  isViewingOwnProfile: boolean;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  name,
  principalId,
  photoUrl,
  headerGradient = 'from-purple-600 via-blue-600 to-indigo-700',
  totalCount,
  visiblePins,
  userPins,
  isViewingOwnProfile,
}) => {
  const [showAccountInfo, setShowAccountInfo] = useState(false);

  return (
    <div className="group bg-white/95 rounded-xl shadow-md hover:shadow-lg overflow-hidden border border-gray-100 transition-all duration-300">
      <div
        className={`relative bg-gradient-to-br ${headerGradient} px-4 overflow-hidden flex items-center justify-center`}
        style={{ height: '270px' }}
      >
        {/* Simplified background effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(255,255,255,0.08),transparent_60%)]" />

        <div className="text-center relative z-10 w-full px-4">
          {/* Enhanced profile photo */}
          <div className="mb-4">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt="Profile"
                className="w-32 h-32 rounded-full border-4 border-white/80 shadow-2xl object-cover mx-auto transition-transform duration-200 group-hover:scale-105 ring-4 ring-white/20"
              />
            ) : (
              <div className="w-32 h-32 bg-white/25 rounded-full border-4 border-white/80 shadow-2xl flex items-center justify-center backdrop-blur-sm mx-auto transition-transform duration-200 group-hover:scale-105 ring-4 ring-white/20">
                <svg
                  className="w-16 h-16 text-white drop-shadow"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Clean typography with better spacing */}
          <h1 className="text-xl font-bold text-white drop-shadow-sm mb-4 tracking-tight truncate max-w-full leading-tight">
            {name}
          </h1>

          {/* Pin-themed stats with improved spacing */}
          <div className="text-center text-white/80">
            {isViewingOwnProfile ? (
              <div>
                {/* Total spots with icon */}
                <div className="flex items-center justify-center gap-2 mb-2">
                  <svg
                    className="w-4 h-4 text-white/70"
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
                  <span className="text-lg font-bold text-white">{totalCount}</span>
                  <span className="text-sm text-white/70 font-medium">spots</span>
                </div>
                {/* Public/Private split */}
                <div className="flex items-center justify-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-emerald-300 rounded-full"></div>
                    <span className="text-white/70 font-medium">
                      {(userPins || []).filter((p) => !p.isPrivate).length} public
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full"></div>
                    <span className="text-white/70 font-medium">
                      {(userPins || []).filter((p) => p.isPrivate).length} private
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <svg
                  className="w-4 h-4 text-white/70"
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
                    d="M15 11a3 3 0 11-6 0 3 3 0 616 0z"
                  />
                </svg>
                <span className="text-lg font-bold text-white">{totalCount}</span>
                <span className="text-sm text-white/70 font-medium">spots</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Simplified account section - only if needed */}
      {showAccountInfo && (
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <svg
              className="w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V4a2 2 0 114 0v2m-4 0a2 2 0 104 0m-4 0v2m4-2v2"
              />
            </svg>
            <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              Account ID
            </span>
          </div>
          <p className="text-xs text-gray-700 break-all font-mono bg-gray-50 rounded-lg p-2.5 border border-gray-200 leading-relaxed select-all">
            {principalId}
          </p>
        </div>
      )}

      {/* Toggle button moved to bottom */}
      <button
        onClick={() => setShowAccountInfo(!showAccountInfo)}
        className="w-full p-2 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors duration-200 border-t border-gray-100"
      >
        {showAccountInfo ? 'Hide Account Info' : 'Show Account Info'}
      </button>
    </div>
  );
};

export default ProfileCard;
