import React from 'react';
import type { Pin } from '../types/map';

interface Props {
  pin: Pin | null;
  isOpen: boolean;
  onClose: () => void;
  onViewProfile: (userId: string) => void;
  onEdit: (pin: Pin) => void;
  onDelete: (pin: Pin) => void;
}

const PinDetailModal: React.FC<Props> = ({ pin, isOpen, onClose, onViewProfile, onEdit, onDelete }) => {
  if (!isOpen || !pin) return null;

  const privacy = pin.isPrivate ? (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-red-100 text-red-700 text-xs font-semibold">
      🔒 Private
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-semibold">
      🌍 Public
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
    <div className="fixed inset-0 bg-black bg-opacity-60 z-[2000] flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-2 max-h-[90vh] overflow-y-auto p-4 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Pin Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-gray-800 mb-1">{pin.name || 'Unnamed Pin'}</h3>
          {privacy}
        </div>
        {pin.description && (
          <div className="mb-4">
            <p className="text-gray-700 text-base whitespace-pre-line">{pin.description}</p>
          </div>
        )}
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-sm">👤 Created by:</span>
            <button type="button" className="underline text-blue-600 text-sm font-medium" onClick={() => onViewProfile(pin.owner.toString())}>
              View Profile
            </button>
          </div>
        </div>
        <div className="mb-4 flex gap-2 flex-wrap">
          {pin.musicLink && musicText && (
            <a href={pin.musicLink} target="_blank" rel="noopener noreferrer" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition">
              🎵 {musicText}
            </a>
          )}
          {pin.isOwner && (
            <>
              <button type="button" className="bg-yellow-400 text-yellow-900 px-4 py-2 rounded-lg font-semibold shadow hover:bg-yellow-500 transition" onClick={() => onEdit(pin)}>
                ✏️ Edit
              </button>
              <button type="button" className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-red-600 transition" onClick={() => onDelete(pin)}>
                🗑️ Delete
              </button>
            </>
          )}
        </div>
        <div className="mt-2 text-right">
          <span className="timestamp text-xs text-gray-400">Added: {new Date(pin.timestamp).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default PinDetailModal;
