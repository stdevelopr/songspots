export const Loader = () => {
  return (
    <div className="fixed inset-0 bg-white z-[9999] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-6"></div>
        <h3 className="text-2xl font-semibold text-gray-900 mb-3">Loading Vibe Spots</h3>
        <p className="text-gray-600 max-w-md mx-auto mb-4">
          Initializing map, loading vibes, requesting location, and centering map...
        </p>
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"
              style={{ animationDelay: '0.1s' }}
            ></div>
            <div
              className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"
              style={{ animationDelay: '0.2s' }}
            ></div>
          </div>
          <span>Please wait</span>
        </div>

        {/* Debug info in development */}
        {/* {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 text-xs text-gray-400 space-y-1">
            <div>Map: {isMapInitialized ? '✓' : '⏳'}</div>
            <div>Pins: {isPinsLoaded ? '✓' : '⏳'}</div>
            <div>Location: {isLocationProcessed ? '✓' : '⏳'}</div>
            <div>Centered: {isMapCentered ? '✓' : '⏳'}</div>
          </div>
        )} */}
      </div>
    </div>
  );
};
