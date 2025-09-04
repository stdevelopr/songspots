import React from 'react';

interface EmptyStateProps {
  isViewingOwnProfile: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({ isViewingOwnProfile }) => {
  return (
    <div className="text-center py-16">
      <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
        <svg
          className="w-10 h-10 text-gray-400"
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
      <h3 className="text-2xl font-bold text-gray-900 mb-4">
        {isViewingOwnProfile ? 'Your journey starts here' : 'No memories yet'}
      </h3>
      <p className="text-gray-600 mb-8 leading-relaxed max-w-lg mx-auto">
        {isViewingOwnProfile
          ? 'Create your first memory by clicking on the map to mark special places and musical moments that matter to you.'
          : "This user hasn't shared any memories yet. Check back later to discover their musical journey!"}
      </p>
      {isViewingOwnProfile && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100 max-w-md mx-auto">
          <h4 className="text-lg font-semibold text-indigo-900 mb-2">
            Get started
          </h4>
          <p className="text-indigo-700 text-sm">
            Navigate to the map and click anywhere to create your first memory spot!
          </p>
        </div>
      )}
    </div>
  );
};

export default EmptyState;