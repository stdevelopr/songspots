import React from 'react';

interface ProfileCardProps {
  name: string;
  principalId: string;
  photoUrl?: string | null;
  headerGradient?: string; // e.g., 'from-purple-600 via-blue-600 to-indigo-700'
  totalCount?: number;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  name,
  principalId,
  photoUrl,
  headerGradient = 'from-purple-600 via-blue-600 to-indigo-700',
  totalCount,
}) => {
  return (
    <div className="bg-white/95 rounded-2xl shadow-md overflow-hidden border border-gray-100 ring-1 ring-gray-100/50">
      <div className={`relative bg-gradient-to-br ${headerGradient} px-6 py-10`}> 
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(255,255,255,0.08),transparent_60%)]" />

        <div className="text-center relative z-10">
          <div className="mb-6">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt="Profile"
                className="w-24 h-24 rounded-full mx-auto border-4 border-white shadow-xl object-cover ring-4 ring-white/30"
              />
            ) : (
              <div className="w-24 h-24 bg-white/20 rounded-full mx-auto border-4 border-white shadow-xl flex items-center justify-center backdrop-blur-sm ring-4 ring-white/30">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
          </div>

          <h1 className="text-2xl font-extrabold text-white drop-shadow-sm mb-1 tracking-tight">{name}</h1>

          <div className="flex items-center justify-center gap-4 text-white/90 text-sm">
            {typeof totalCount === 'number' && (
              <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-white/15 backdrop-blur border border-white/20">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-medium">{totalCount} memor{totalCount === 1 ? 'y' : 'ies'}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V4a2 2 0 114 0v2m-4 0a2 2 0 104 0m-4 0v2m4-2v2" />
            </svg>
            Account Information
          </h3>
          <p className="text-xs text-gray-700 break-all font-mono bg-white rounded-lg p-3 border border-gray-200">
            {principalId}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
