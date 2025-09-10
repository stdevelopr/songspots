import React, { Suspense, lazy, useState, useEffect } from 'react';
import { createIntersectionObserver } from '../../utils/performance';

interface LazyBottomSheetContentProps {
  isOpen: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  preload?: boolean;
  className?: string;
}

// Loading skeleton for bottom sheet content
const ContentSkeleton: React.FC = () => (
  <div className="animate-pulse space-y-4 p-4">
    {/* Header skeleton */}
    <div className="flex items-start justify-between">
      <div className="flex-1 space-y-2">
        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
      <div className="flex gap-2">
        <div className="h-8 w-16 bg-gray-200 rounded-full"></div>
        <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
      </div>
    </div>
    
    {/* Content skeleton */}
    <div className="space-y-3">
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-16 bg-gray-200 rounded"></div>
      </div>
      
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
      </div>
    </div>
    
    {/* Action buttons skeleton */}
    <div className="space-y-3 pt-4 border-t border-gray-200">
      <div className="h-12 bg-gray-200 rounded"></div>
      <div className="h-12 bg-gray-200 rounded"></div>
    </div>
  </div>
);

export const LazyBottomSheetContent: React.FC<LazyBottomSheetContentProps> = ({
  isOpen,
  children,
  fallback,
  preload = false,
  className = '',
}) => {
  const [shouldRender, setShouldRender] = useState(preload || isOpen);
  const [isIntersecting, setIsIntersecting] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
    }
  }, [isOpen]);
  
  // Intersection observer for lazy loading
  useEffect(() => {
    if (!shouldRender) return;
    
    const observer = createIntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsIntersecting(entry.isIntersecting);
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );
    
    const contentElement = document.querySelector('.bottom-sheet-content');
    if (contentElement) {
      observer.observe(contentElement);
    }
    
    return () => {
      observer.disconnect();
    };
  }, [shouldRender]);
  
  // Don't render anything if not needed
  if (!shouldRender) {
    return null;
  }
  
  return (
    <div className={`lazy-content ${className}`}>
      <Suspense fallback={fallback || <ContentSkeleton />}>
        {isOpen || isIntersecting ? children : fallback || <ContentSkeleton />}
      </Suspense>
    </div>
  );
};

// Higher-order component for lazy loading bottom sheet components
export const withLazyBottomSheet = <P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    fallback?: React.ReactNode;
    preload?: boolean;
  }
) => {
  const LazyComponent = lazy(() => Promise.resolve({ default: Component }));
  
  return React.forwardRef<any, P & { isOpen?: boolean }>((props, ref) => {
    const { isOpen = false, ...componentProps } = props;
    
    return (
      <LazyBottomSheetContent
        isOpen={isOpen}
        fallback={options?.fallback}
        preload={options?.preload}
      >
        <LazyComponent ref={ref} {...(componentProps as P)} />
      </LazyBottomSheetContent>
    );
  });
};

// Lazy loading wrapper for form components
export const LazyFormContent: React.FC<{
  isOpen: boolean;
  children: React.ReactNode;
}> = ({ isOpen, children }) => {
  const [shouldRender, setShouldRender] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      // Delay form rendering slightly to improve sheet animation performance
      const timer = setTimeout(() => {
        setShouldRender(true);
      }, 150);
      
      return () => clearTimeout(timer);
    } else {
      // Keep form rendered for a bit after closing to maintain smooth animation
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen]);
  
  if (!shouldRender && !isOpen) {
    return <ContentSkeleton />;
  }
  
  return (
    <div className={`transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
      {children}
    </div>
  );
};

export default LazyBottomSheetContent;