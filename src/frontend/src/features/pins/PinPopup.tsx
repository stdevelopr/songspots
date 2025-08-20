import React from 'react';
import type { Pin } from '../types/map';

interface Props {
  pin: Pin;
  onViewProfile: (userId: string) => void;
  onEdit: (pin: Pin) => void;
  onDelete: (pin: Pin) => void;
}

const PinPopup: React.FC<Props> = ({ pin, onViewProfile, onEdit, onDelete }) => {
  const privacy = pin.isPrivate ? (
    <div className="privacy-badge private">
      🔒 <span>Private</span>
    </div>
  ) : (
    <div className="privacy-badge public">
      🌍 <span>Public</span>
    </div>
  );

  const musicText = pin.musicLink
    ? pin.musicLink.includes('youtu')
      ? 'Open YouTube'
      : pin.musicLink.includes('spotify')
        ? 'Open Spotify'
        : 'Open Music Link'
    : null;

  return (
    <div className="enhanced-pin-popup">
      <div className="popup-header">
        <div className="pin-title-section">
          <h3 className="pin-title">{pin.name || 'Unnamed Pin'}</h3>
          {privacy}
        </div>
      </div>

      {pin.description && (
        <div className="pin-description">
          <p>{pin.description}</p>
        </div>
      )}

      <div className="pin-metadata">
        <div className="owner-info">
          👤 <span className="metadata-label">Created by:</span>
          <button
            type="button"
            className="owner-link"
            onClick={() => onViewProfile(pin.owner.toString())}
          >
            View Profile
          </button>
        </div>
      </div>

      <div className="popup-actions">
        {pin.musicLink && musicText && (
          <a
            href={pin.musicLink}
            target="_blank"
            rel="noopener noreferrer"
            className="action-button music-button"
          >
            🎵 {musicText}
          </a>
        )}

        {pin.isOwner && (
          <>
            <button type="button" className="action-button edit-button" onClick={() => onEdit(pin)}>
              ✏️ Edit
            </button>
            <button
              type="button"
              className="action-button delete-button"
              onClick={() => onDelete(pin)}
            >
              🗑️ Delete
            </button>
          </>
        )}
      </div>

      <div className="popup-footer">
        <span className="timestamp">Added: {new Date(pin.timestamp).toLocaleString()}</span>
      </div>
    </div>
  );
};

export default PinPopup;
