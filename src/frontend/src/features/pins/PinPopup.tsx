import React from 'react';
import { Pin } from '../map/types/map';

interface Props {
  pin: Pin;
  onViewProfile: (userId: string) => void;
  onEdit: (pin: Pin) => void;
  onDelete: (pin: Pin) => void;
  onClose?: () => void; // for mobile modal
}

const PinPopup: React.FC<Props> = ({ pin, onViewProfile, onEdit, onDelete, onClose }) => {
  const privacy = pin.isPrivate ? (
    <span className="privacy-badge private">
      <span className="privacy-icon">🔒</span> Private
    </span>
  ) : (
    <span className="privacy-badge public">
      <span className="privacy-icon">🌍</span> Public
    </span>
  );

  const musicText = pin.musicLink
    ? pin.musicLink.includes('youtu')
      ? 'Open YouTube'
      : pin.musicLink.includes('spotify')
        ? 'Open Spotify'
        : 'Open Music Link'
    : null;

  return <div>OK</div>;
};

export default PinPopup;
