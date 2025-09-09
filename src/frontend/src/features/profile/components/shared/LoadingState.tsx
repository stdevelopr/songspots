import React from 'react';

const LoadingState: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full mb-4">
          <div className="w-8 h-8 border-[3px] border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Loading memories...
        </h3>
        <p className="text-gray-500">Gathering your special moments</p>
      </div>
      <div className="grid gap-6">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-2xl p-6 border border-gray-100 bg-white/90 shadow-sm"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-6 w-32 bg-gradient-to-r from-gray-200 to-gray-100 rounded-lg" />
                  <div className="h-5 w-16 bg-gray-100 rounded-full" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-gray-100 rounded" />
                  <div className="h-4 w-4/5 bg-gray-100 rounded" />
                  <div className="h-4 w-3/5 bg-gray-100 rounded" />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="h-8 w-8 bg-gray-100 rounded-lg" />
                <div className="h-8 w-8 bg-gray-100 rounded-lg" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="h-16 bg-gradient-to-r from-gray-100 to-gray-50 rounded-lg border border-gray-100" />
              <div className="h-16 bg-gradient-to-r from-gray-100 to-gray-50 rounded-lg border border-gray-100" />
            </div>
            <div className="h-10 w-36 bg-gray-100 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoadingState;
