import React from 'react';
import VibeInfoPopup from '../VibeInfoPopup';
import { Pin } from '@features/map';

interface Props {
  vibe: Pin | null;
  isOpen: boolean;
  onClose: () => void;
  onViewProfile: (userId: string | null) => void;
  onEdit: (vibe: Pin) => void;
  onDelete: (vibe: Pin) => void;
}

const VibeDetailModal: React.FC<Props> = ({
  vibe,
  isOpen,
  onClose,
  onViewProfile,
  onEdit,
  onDelete,
}) => {
  if (!isOpen || !vibe) return null;
  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-white/10 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.stopPropagation();
          onClose();
        }
      }}
    >
      <div onClick={(e) => e.stopPropagation()}>
        <VibeInfoPopup
          vibe={vibe}
          onViewProfile={onViewProfile}
          onEdit={onEdit}
          onDelete={onDelete}
          onClose={onClose}
          showPrivacy={true}
          showTimestamp={true}
          modalLayout
        />
      </div>
    </div>
  );
};

export default VibeDetailModal;
