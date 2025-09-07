import React from 'react';
import PinInfoPopup from './PinInfoPopup';
import { Pin } from '../../../map/types/map';

interface Props {
  pin: Pin;
  onViewProfile: (userId: string | null) => void;
  onEdit: (pin: Pin) => void;
  onDelete: (pin: Pin) => void;
  onClose?: () => void;
}

const PinPopup: React.FC<Props> = ({ pin, onViewProfile, onEdit, onDelete, onClose }) => {
  return (
    <PinInfoPopup
      pin={pin}
      onViewProfile={onViewProfile}
      onEdit={onEdit}
      onDelete={onDelete}
      onClose={onClose}
      showPrivacy={true}
      showTimestamp={true}
    />
  );
};

export default PinPopup;
