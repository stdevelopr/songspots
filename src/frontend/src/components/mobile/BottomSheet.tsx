import React, { useState, useEffect, useRef, useCallback, useId } from 'react';
import { createPortal } from 'react-dom';
import { haptics } from '../../utils/haptics';

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  snapPoints?: number[]; // [0.3, 0.6, 0.9] for 30%, 60%, 90% height
  initialSnapPoint?: number; // Index of initial snap point
  isDragEnabled?: boolean;
  showHandle?: boolean;
  closeOnOverlayClick?: boolean;
  className?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  children,
  title,
  snapPoints = [0.9],
  initialSnapPoint = 0,
  isDragEnabled = true,
  showHandle = true,
  closeOnOverlayClick = true,
  className = '',
}) => {
  const [currentSnapPoint, setCurrentSnapPoint] = useState(initialSnapPoint);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const sheetRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const startPosRef = useRef<number>(0);
  const lastPosRef = useRef<number>(0);
  const prevFocusedRef = useRef<HTMLElement | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const titleId = useId();

  // Calculate sheet height based on snap point
  const getSheetHeight = useCallback((snapIndex: number) => {
    const snapPoint = snapPoints[snapIndex];
    return `${snapPoint * 100}vh`;
  }, [snapPoints]);

  // Handle drag start
  const handleDragStart = useCallback((clientY: number) => {
    if (!isDragEnabled) return;
    
    setIsDragging(true);
    startPosRef.current = clientY;
    lastPosRef.current = clientY;
    document.body.style.userSelect = 'none';
    haptics.tap(); // Light feedback on drag start
  }, [isDragEnabled]);

  // Handle drag move
  const handleDragMove = useCallback((clientY: number) => {
    if (!isDragging) return;

    const deltaY = clientY - startPosRef.current;
    const maxOffset = window.innerHeight * 0.3; // Max drag distance
    const clampedOffset = Math.max(0, Math.min(deltaY, maxOffset));
    
    setDragOffset(clampedOffset);
    lastPosRef.current = clientY;
  }, [isDragging]);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    if (!isDragging) return;

    setIsDragging(false);
    document.body.style.userSelect = '';

    const velocity = lastPosRef.current - startPosRef.current;
    const threshold = window.innerHeight * 0.2; // 20% of screen height

    // Determine if we should close or snap to a point
    if (dragOffset > threshold || velocity > 50) {
      if (currentSnapPoint < snapPoints.length - 1) {
        setCurrentSnapPoint(currentSnapPoint + 1);
        haptics.snapToPosition(); // Feedback when snapping to point
      } else {
        onClose();
        haptics.dismiss(); // Feedback when closing
      }
    } else if (dragOffset < -threshold || velocity < -50) {
      if (currentSnapPoint > 0) {
        setCurrentSnapPoint(currentSnapPoint - 1);
        haptics.snapToPosition(); // Feedback when snapping to point
      }
    }

    setDragOffset(0);
  }, [isDragging, dragOffset, currentSnapPoint, snapPoints.length, onClose]);

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientY);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    handleDragMove(e.clientY);
  }, [handleDragMove]);

  const handleMouseUp = useCallback(() => {
    handleDragEnd();
  }, [handleDragEnd]);

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientY);
  };

  const handleTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault();
    handleDragMove(e.touches[0].clientY);
  }, [handleDragMove]);

  const handleTouchEnd = useCallback(() => {
    handleDragEnd();
  }, [handleDragEnd]);

  // Attach global event listeners for drag
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  // Prevent body scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  // Detect prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const set = () => setPrefersReducedMotion(mq.matches);
    set();
    mq.addEventListener?.('change', set);
    return () => mq.removeEventListener?.('change', set);
  }, []);

  // Focus management: save previous focus, move focus into sheet, restore on close
  useEffect(() => {
    if (isOpen) {
      prevFocusedRef.current = document.activeElement as HTMLElement | null;
      // Defer to after render
      setTimeout(() => {
        // Try first focusable inside content, else sheet itself
        const container = contentRef.current || sheetRef.current;
        if (!container) return;
        const focusables = container.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length > 0) {
          focusables[0].focus();
        } else {
          sheetRef.current?.setAttribute('tabindex', '-1');
          (sheetRef.current as HTMLElement)?.focus();
        }
      }, 0);
    }
    return () => {
      // Restore focus to the previously focused element
      if (prevFocusedRef.current && typeof prevFocusedRef.current.focus === 'function') {
        prevFocusedRef.current.focus();
      }
      prevFocusedRef.current = null;
    };
  }, [isOpen]);

  // Reset snap point when sheet opens
  useEffect(() => {
    if (isOpen) {
      setCurrentSnapPoint(initialSnapPoint);
      setDragOffset(0);
    }
  }, [isOpen, initialSnapPoint]);

  if (!isOpen) return null;

  const sheetStyle: React.CSSProperties = {
    height: getSheetHeight(currentSnapPoint),
    transform: `translateY(${dragOffset}px)`,
    transition: (isDragging || prefersReducedMotion)
      ? 'none'
      : 'transform var(--mobile-duration-normal) var(--mobile-easing-decelerate)',
  };

  return createPortal(
    <>
      {/* Overlay */}
      <div
        className={`bottom-sheet-overlay ${isOpen ? 'open' : ''}`}
        onClick={closeOnOverlayClick ? onClose : undefined}
      />
      
      {/* Sheet */}
      <div
        ref={sheetRef}
        className={`bottom-sheet ${isOpen ? 'open' : ''} ${className}`}
        style={sheetStyle}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? `bottom-sheet-title-${titleId}` : undefined}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.stopPropagation();
            onClose();
            return;
          }
          if (e.key === 'Tab') {
            const container = contentRef.current || sheetRef.current;
            if (!container) return;
            const focusables = Array.from(
              container.querySelectorAll<HTMLElement>(
                'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
              )
            ).filter(el => el.offsetParent !== null);
            if (focusables.length === 0) return;
            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            if (e.shiftKey) {
              if (document.activeElement === first) {
                e.preventDefault();
                (last as HTMLElement).focus();
              }
            } else {
              if (document.activeElement === last) {
                e.preventDefault();
                (first as HTMLElement).focus();
              }
            }
          }
        }}
      >
        {/* Drag handle */}
        {showHandle && (
          <div
            className="bottom-sheet-handle gesture-area"
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          />
        )}

        {/* Header */}
        {title && (
          <div className="bottom-sheet-header">
            <h3 id={`bottom-sheet-title-${titleId}`} className="text-mobile-lg font-semibold text-center">{title}</h3>
          </div>
        )}

        {/* Content */}
        <div ref={contentRef} className="bottom-sheet-content">
          {children}
        </div>
      </div>
    </>,
    document.body
  );
};

export default BottomSheet;
