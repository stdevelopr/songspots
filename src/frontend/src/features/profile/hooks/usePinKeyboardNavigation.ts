import { useEffect } from 'react';
import { handleKeyboardNavigation } from './usePinOperations.helpers';
import type { Pin } from './usePinOperations.types';

interface UsePinKeyboardNavigationProps {
  visiblePins: Pin[];
  selectedPinId: string | null;
  onPinClick: (pinId: string) => void;
}

export const usePinKeyboardNavigation = ({
  visiblePins,
  selectedPinId,
  onPinClick
}: UsePinKeyboardNavigationProps) => {
  useEffect(() => {
    if (visiblePins.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      handleKeyboardNavigation(e, visiblePins, selectedPinId, onPinClick);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedPinId, visiblePins, onPinClick]);
};