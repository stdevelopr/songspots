import React from 'react';
import { useIsMobile } from '@common';
import VibeDetailModal from '../components/modals/VibeDetailModal';
import { PinDetailSheet } from '../mobile/PinDetailSheet';
import type { Pin } from '../../map/types/map';

interface PinDetailsProps {
  vibe: Pin | null;
  isOpen: boolean;
  onClose: () => void;
  onViewProfile: (userId: string | null) => void;
  onEdit: (pin: Pin) => void;
  onDelete: (pin: Pin) => void;
}

export const PinDetails: React.FC<PinDetailsProps> = (props) => {
  const isMobile = useIsMobile();

  return isMobile ? (
    <PinDetailSheet {...props} />
  ) : (
    <VibeDetailModal {...props} />
  );
};

export default PinDetails;