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

  return (
    <div className="enhanced-pin-popup redesigned-popup">
      {/* Close button for both desktop and mobile */}

      <div className="popup-header redesigned-header">
        <div className="pin-title-section redesigned-title-section">
          <h3 className="pin-title redesigned-title">{pin.name || 'Unnamed Pin'}</h3>
          {privacy}
        </div>
      </div>

      {pin.description && (
        <div className="pin-description redesigned-description">
          <p>{pin.description}</p>
        </div>
      )}

      <div className="pin-metadata redesigned-metadata">
        <div className="owner-info redesigned-owner-info">
          <span className="metadata-icon">👤</span>
          <span className="metadata-label">Created by:</span>
          <button
            type="button"
            className="owner-link redesigned-owner-link"
            onClick={() => onViewProfile(pin.owner.toString())}
          >
            View Profile
          </button>
        </div>
      </div>

      <div className="popup-actions redesigned-actions">
        {pin.musicLink && musicText && (
          <a
            href={pin.musicLink}
            target="_blank"
            rel="noopener noreferrer"
            className="action-button music-button redesigned-music-button"
          >
            <span className="button-icon">🎵</span> {musicText}
          </a>
        )}

        {pin.isOwner && (
          <div className="redesigned-owner-actions">
            <button
              type="button"
              className="action-button edit-button redesigned-edit-button"
              onClick={() => onEdit(pin)}
            >
              <span className="button-icon">✏️</span> Edit
            </button>
            <button
              type="button"
              className="action-button delete-button redesigned-delete-button"
              onClick={() => onDelete(pin)}
            >
              <span className="button-icon">🗑️</span> Delete
            </button>
          </div>
        )}
      </div>

      <div className="popup-footer redesigned-footer">
        <span className="timestamp redesigned-timestamp">
          Added: {new Date(pin.timestamp).toLocaleString()}
        </span>
      </div>
    </div>
  );
};

export default PinPopup;
