import React from 'react';
import VibeInfoPopup from './VibeInfoPopup';
import { Pin } from '../../../map/types/map';

interface Props {
  vibe: Pin;
  onViewProfile: (userId: string | null) => void;
  onEdit: (vibe: Pin) => void;
  onDelete: (vibe: Pin) => void;
  onClose?: () => void;
}

const VibePopup: React.FC<Props> = ({ vibe, onViewProfile, onEdit, onDelete, onClose }) => {
  return (
    <VibeInfoPopup
      vibe={vibe}
      onViewProfile={onViewProfile}
      onEdit={onEdit}
      onDelete={onDelete}
      onClose={onClose}
      showPrivacy={true}
      showTimestamp={true}
    />
  );
};

export default VibePopup;
