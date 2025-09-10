// Performance optimization utilities for mobile map rendering

export interface PerformanceConfig {
  // Throttling and debouncing
  mapMoveThrottle: number;
  resizeDebounce: number;
  searchDebounce: number;
  
  // Mobile optimizations
  reducedAnimations: boolean;
  lowQualityMode: boolean;
  maxVisiblePins: number;
  clusterDistance: number;
  
  // Memory management
  enableVirtualization: boolean;
  maxCachedLayers: number;
  preloadDistance: number;
}

// Device capability detection
export const getDeviceCapabilities = () => {
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isLowEndDevice = 'connection' in navigator && 
    (navigator as any).connection?.effectiveType?.includes('2g');
  
  // Estimate device memory (experimental API)
  const deviceMemory = 'deviceMemory' in navigator ? 
    (navigator as any).deviceMemory : 4; // Default to 4GB
  
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  return {
    isMobile,
    isLowEndDevice,
    deviceMemory,
    prefersReducedMotion,
    isHighPerformance: deviceMemory >= 8 && !isLowEndDevice,
  };
};

// Get optimal performance configuration based on device
export const getOptimalPerformanceConfig = (): PerformanceConfig => {
  const capabilities = getDeviceCapabilities();
  
  if (capabilities.isLowEndDevice || capabilities.deviceMemory < 4) {
    // Low-end device configuration
    return {
      mapMoveThrottle: 100,
      resizeDebounce: 300,
      searchDebounce: 500,
      reducedAnimations: true,
      lowQualityMode: true,
      maxVisiblePins: 50,
      clusterDistance: 80,
      enableVirtualization: true,
      maxCachedLayers: 3,
      preloadDistance: 500,
    };
  } else if (capabilities.isMobile) {
    // Mobile device configuration
    return {
      mapMoveThrottle: 50,
      resizeDebounce: 200,
      searchDebounce: 300,
      reducedAnimations: capabilities.prefersReducedMotion,
      lowQualityMode: false,
      maxVisiblePins: 100,
      clusterDistance: 60,
      enableVirtualization: true,
      maxCachedLayers: 5,
      preloadDistance: 1000,
    };
  } else {
    // Desktop configuration
    return {
      mapMoveThrottle: 16, // 60fps
      resizeDebounce: 100,
      searchDebounce: 200,
      reducedAnimations: capabilities.prefersReducedMotion,
      lowQualityMode: false,
      maxVisiblePins: 200,
      clusterDistance: 40,
      enableVirtualization: false,
      maxCachedLayers: 10,
      preloadDistance: 2000,
    };
  }
};

// Throttle function for high-frequency events
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): T => {
  let inThrottle: boolean;
  return ((...args: any[]) => {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }) as T;
};

// Debounce function for events that should only fire after settling
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T => {
  let timeoutId: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  }) as T;
};

// Request animation frame with fallback
export const requestAnimationFrame = window.requestAnimationFrame || 
  window.webkitRequestAnimationFrame || 
  ((callback: FrameRequestCallback) => setTimeout(callback, 16));

// Cancel animation frame with fallback
export const cancelAnimationFrame = window.cancelAnimationFrame || 
  window.webkitCancelAnimationFrame || 
  clearTimeout;

// Performance monitoring
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();
  
  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }
  
  // Start timing an operation
  public startTiming(name: string): number {
    return performance.now();
  }
  
  // End timing and record
  public endTiming(name: string, startTime: number): number {
    const duration = performance.now() - startTime;
    
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const measurements = this.metrics.get(name)!;
    measurements.push(duration);
    
    // Keep only last 100 measurements
    if (measurements.length > 100) {
      measurements.shift();
    }
    
    return duration;
  }
  
  // Get average performance for an operation
  public getAverage(name: string): number {
    const measurements = this.metrics.get(name);
    if (!measurements || measurements.length === 0) return 0;
    
    return measurements.reduce((sum, val) => sum + val, 0) / measurements.length;
  }
  
  // Get performance summary
  public getSummary(): Record<string, { average: number; samples: number }> {
    const summary: Record<string, { average: number; samples: number }> = {};
    
    for (const [name, measurements] of this.metrics.entries()) {
      summary[name] = {
        average: this.getAverage(name),
        samples: measurements.length,
      };
    }
    
    return summary;
  }
  
  // Clear all metrics
  public clear(): void {
    this.metrics.clear();
  }
}

// Lazy loading utilities
export const createIntersectionObserver = (
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
): IntersectionObserver => {
  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  };
  
  return new IntersectionObserver(callback, defaultOptions);
};

// Memory management
export const createMemoryManager = () => {
  const cache = new Map<string, any>();
  const maxSize = getOptimalPerformanceConfig().maxCachedLayers;
  
  return {
    set: (key: string, value: any) => {
      if (cache.size >= maxSize) {
        // Remove oldest entry
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
      }
      cache.set(key, value);
    },
    
    get: (key: string) => cache.get(key),
    
    has: (key: string) => cache.has(key),
    
    delete: (key: string) => cache.delete(key),
    
    clear: () => cache.clear(),
    
    size: () => cache.size,
  };
};