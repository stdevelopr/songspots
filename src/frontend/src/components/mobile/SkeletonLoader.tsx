import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
  rounded?: boolean;
  animate?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width = 'w-full',
  height = 'h-4',
  rounded = true,
  animate = true,
}) => {
  return (
    <div
      className={`
        bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200
        ${rounded ? 'rounded' : ''}
        ${animate ? 'animate-pulse' : ''}
        ${width} ${height}
        ${className}
      `}
      style={{
        backgroundSize: '200% 100%',
        animation: animate 
          ? 'shimmer 1.5s ease-in-out infinite, pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          : undefined,
      }}
    />
  );
};

// Map skeleton for initial loading
export const MapSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header skeleton */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 pt-safe flex items-center justify-between">
        <div className="flex items-center flex-1">
          <div className="w-10" />
          <div className="flex-1 min-w-0">
            <Skeleton width="w-32" height="h-6" className="mb-1" />
          </div>
        </div>
        
        <div className="flex-shrink-0 mx-3">
          <Skeleton width="w-16" height="h-6" rounded className="rounded-full" />
        </div>
        
        <div className="flex items-center flex-1 justify-end">
          <Skeleton width="w-8" height="h-8" className="rounded-full" />
        </div>
      </div>

      {/* Map container skeleton */}
      <div className="flex-1 relative bg-gray-100">
        {/* Map tiles skeleton pattern */}
        <div className="absolute inset-0 grid grid-cols-4 gap-1 p-4">
          {Array.from({ length: 16 }).map((_, i) => (
            <Skeleton 
              key={i} 
              className="aspect-square" 
              animate={false}
              rounded={false}
            />
          ))}
        </div>
        
        {/* Floating pins skeleton */}
        <div className="absolute inset-0">
          {[
            { top: '20%', left: '30%' },
            { top: '40%', left: '60%' },
            { top: '60%', left: '25%' },
            { top: '30%', left: '80%' },
            { top: '70%', left: '70%' },
          ].map((pos, i) => (
            <div 
              key={i}
              className="absolute w-8 h-8 animate-bounce"
              style={{ 
                top: pos.top, 
                left: pos.left,
                animationDelay: `${i * 0.2}s`,
                animationDuration: '2s',
              }}
            >
              <Skeleton className="w-8 h-8 rounded-full shadow-lg" />
            </div>
          ))}
        </div>

        {/* FAB controls skeleton */}
        <div className="absolute bottom-4 right-4 bottom-safe right-safe flex flex-col gap-4">
          <Skeleton className="w-12 h-12 rounded-full shadow-lg" />
          <Skeleton className="w-14 h-14 rounded-full shadow-lg" />
          <Skeleton className="w-16 h-16 rounded-full shadow-lg" />
        </div>

        {/* Filter FAB skeleton */}
        <div className="absolute bottom-4 left-4 bottom-safe left-safe">
          <Skeleton className="w-14 h-14 rounded-full shadow-lg" />
        </div>
      </div>
    </div>
  );
};

// Pin list skeleton for bottom sheets
export const PinListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-start space-x-3 p-4 bg-white rounded-lg border border-gray-200">
          <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton width="w-3/4" height="h-5" />
            <Skeleton width="w-full" height="h-4" />
            <Skeleton width="w-1/2" height="h-3" />
          </div>
          <Skeleton className="w-8 h-8 rounded-full" />
        </div>
      ))}
    </div>
  );
};

// Form skeleton for create/edit modals
export const FormSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <Skeleton width="w-20" height="h-4" />
        <Skeleton width="w-full" height="h-10" className="rounded-lg" />
      </div>
      
      <div className="space-y-2">
        <Skeleton width="w-24" height="h-4" />
        <Skeleton width="w-full" height="h-24" className="rounded-lg" />
      </div>
      
      <div className="space-y-2">
        <Skeleton width="w-16" height="h-4" />
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-xl" />
          ))}
        </div>
      </div>
      
      <div className="flex space-x-3 pt-4">
        <Skeleton width="w-24" height="h-12" className="rounded-lg" />
        <Skeleton width="w-32" height="h-12" className="rounded-lg" />
      </div>
    </div>
  );
};

export default Skeleton;