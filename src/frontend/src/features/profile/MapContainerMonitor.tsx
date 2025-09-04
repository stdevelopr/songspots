import { useEffect } from 'react';

interface UseMapContainerMonitorProps {
  mapRef: React.RefObject<HTMLDivElement>;
  isCollapsed: boolean;
  containerReady: boolean;
  setContainerReady: (ready: boolean) => void;
}

export const useMapContainerMonitor = ({
  mapRef,
  isCollapsed,
  containerReady,
  setContainerReady,
}: UseMapContainerMonitorProps) => {
  // Monitor when container is ready
  useEffect(() => {
    if (isCollapsed || containerReady) return;

    const checkContainer = (): boolean => {
      if (mapRef.current) {
        const rect = mapRef.current.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setContainerReady(true);
          return true;
        }
      }
      return false;
    };

    if (checkContainer()) return;

    const frameId = requestAnimationFrame(() => {
      if (checkContainer()) return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.boundingClientRect.width > 0) {
            setContainerReady(true);
            observer.disconnect();
          }
        });
      });

      if (mapRef.current) {
        observer.observe(mapRef.current);
      }

      return () => observer.disconnect();
    });

    return () => cancelAnimationFrame(frameId);
  }, [isCollapsed, containerReady, setContainerReady, mapRef]);
};