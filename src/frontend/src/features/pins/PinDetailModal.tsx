import React from 'react';
import PinInfoPopup from './PinInfoPopup';
import { Pin } from '../map';

interface Props {
  pin: Pin | null;
  isOpen: boolean;
  onClose: () => void;
  onViewProfile: (userId: string | null) => void;
  onEdit: (pin: Pin) => void;
  onDelete: (pin: Pin) => void;
}

const PinDetailModal: React.FC<Props> = ({
  pin,
  isOpen,
  onClose,
  onViewProfile,
  onEdit,
  onDelete,
}) => {
  if (!isOpen || !pin) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-[2000] flex items-center justify-center">
      <PinInfoPopup
        pin={pin}
        onViewProfile={onViewProfile}
        onEdit={onEdit}
        onDelete={onDelete}
        onClose={onClose}
        showPrivacy={true}
        showTimestamp={true}
      />
    </div>
  );
};

export default PinDetailModal;
