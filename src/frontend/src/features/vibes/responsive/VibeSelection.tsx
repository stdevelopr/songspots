import React from 'react';
import { useIsMobile } from '@common';
import { VibeSelectionModal } from '../components/modals/VibeSelectionModal';
import { VibeSelectionSheet } from '../mobile/VibeSelectionSheet';
import type { Pin, Vibe } from '../../map/types/map';

interface VibeSelectionProps {
  vibes: (Pin | Vibe)[];
  isOpen: boolean;
  onClose: () => void;
  onVibeSelect: (vibe: Pin | Vibe) => void;
  title?: string;
}

export const VibeSelection: React.FC<VibeSelectionProps> = (props) => {
  const isMobile = useIsMobile();

  return isMobile ? (
    <VibeSelectionSheet {...props} />
  ) : (
    <VibeSelectionModal {...props} />
  );
};

export default VibeSelection;