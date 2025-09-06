import React from 'react';

interface ProfileStatsProps {
  visiblePins: any[];
  userPins: any[];
  isViewingOwnProfile: boolean;
  isMobile?: boolean;
}

const ProfileStats: React.FC<ProfileStatsProps> = ({
  visiblePins,
  userPins,
  isViewingOwnProfile,
  isMobile = false,
}) => {
  if (isMobile) {
    return (
      <div className="bg-white/95 rounded-xl border border-gray-100 shadow-sm p-4">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Stats</h3>
        <div className="flex flex-wrap gap-2">
          {isViewingOwnProfile ? (
            <>
              <span className="text-[12px] px-2.5 py-1 rounded-full bg-gray-50 text-gray-800 border border-gray-200">
                Total: {visiblePins?.length || 0}
              </span>
              <span className="text-[12px] px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                Public: {(userPins || []).filter((p) => !p.isPrivate).length}
              </span>
              <span className="text-[12px] px-2.5 py-1 rounded-full bg-slate-50 text-slate-700 border border-slate-200">
                Private (only you): {(userPins || []).filter((p) => p.isPrivate).length}
              </span>
            </>
          ) : (
            <span className="text-[12px] px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Spots: {visiblePins?.length || 0}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/95 rounded-lg border border-gray-100 shadow-sm p-3 hover:shadow-md transition-shadow duration-200">
      <h3 className="text-xs font-semibold text-gray-800 mb-2 flex items-center gap-1.5 uppercase tracking-wide">
        <svg
          className="w-3.5 h-3.5 text-emerald-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        Stats
      </h3>
      <div className="flex gap-1.5">
        {isViewingOwnProfile ? (
          <>
            <div className="flex-1 text-center p-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
              <div className="text-lg font-bold text-blue-700 leading-none">
                {visiblePins?.length || 0}
              </div>
              <div className="text-xs text-blue-900 mt-1">Total</div>
            </div>
            <div className="flex-1 text-center p-2 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-100">
              <div className="text-lg font-bold text-emerald-700 leading-none">
                {(userPins || []).filter((p) => !p.isPrivate).length}
              </div>
              <div className="text-xs text-emerald-900 mt-1">Public</div>
            </div>
            <div className="flex-1 text-center p-2 bg-gradient-to-r from-slate-50 to-gray-50 rounded-lg border border-slate-100">
              <div className="text-lg font-bold text-slate-700 leading-none">
                {(userPins || []).filter((p) => p.isPrivate).length}
              </div>
              <div className="text-xs text-slate-900 mt-1">Private</div>
            </div>
          </>
        ) : (
          <div className="flex-1 text-center p-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
            <div className="text-lg font-bold text-indigo-700 leading-none">
              {visiblePins?.length || 0}
            </div>
            <div className="text-xs text-indigo-900 mt-1">Memories</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileStats;