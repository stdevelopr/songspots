import React from 'react';
import { BottomSheet } from '../../../components/mobile/BottomSheet';
import type { Pin } from '../../map/types/map';

interface PinDetailSheetProps {
  vibe: Pin | null;
  isOpen: boolean;
  onClose: () => void;
  onViewProfile: (userId: string | null) => void;
  onEdit: (pin: Pin) => void;
  onDelete: (pin: Pin) => void;
}

export const PinDetailSheet: React.FC<PinDetailSheetProps> = ({
  vibe,
  isOpen,
  onClose,
  onViewProfile,
  onEdit,
  onDelete,
}) => {
  if (!vibe) return null;

  const handleViewProfile = () => {
    onViewProfile(vibe.creator);
    onClose();
  };

  const handleEdit = () => {
    onEdit(vibe);
    onClose();
  };

  const handleDelete = () => {
    onDelete(vibe);
    onClose();
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      snapPoints={[0.4, 0.7]}
      initialSnapPoint={0}
      showHandle={true}
      closeOnOverlayClick={true}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-mobile-xl font-bold text-gray-900 leading-tight">
              {vibe.name}
            </h2>
            {vibe.creator && (
              <button
                onClick={handleViewProfile}
                className="text-mobile-sm text-blue-600 hover:text-blue-800 font-medium mt-1"
              >
                View Profile
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 ml-4">
            {/* Mood indicator */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100">
              <span className="text-lg">{vibe.mood?.emoji || '😊'}</span>
              <span className="text-mobile-sm font-medium text-gray-700">
                {vibe.mood?.name || 'Good Vibes'}
              </span>
            </div>
            
            {/* Privacy indicator */}
            {vibe.isPrivate && (
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100">
                <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {vibe.description && (
          <div>
            <h3 className="text-mobile-base font-semibold text-gray-900 mb-2">
              Description
            </h3>
            <p className="text-mobile-base text-gray-700 leading-relaxed">
              {vibe.description}
            </p>
          </div>
        )}

        {/* Music Link */}
        {vibe.musicLink && (
          <div>
            <h3 className="text-mobile-base font-semibold text-gray-900 mb-2">
              Music
            </h3>
            <a
              href={vibe.musicLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200"
            >
              <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 11-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-1.343-4.243 1 1 0 010-1.414z" clipRule="evenodd" />
                  <path fillRule="evenodd" d="M13.828 8.172a1 1 0 011.414 0A5.983 5.983 0 0117 12a5.983 5.983 0 01-1.758 3.828 1 1 0 01-1.414-1.414A3.987 3.987 0 0015 12a3.987 3.987 0 00-1.172-2.828 1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-mobile-sm font-medium text-blue-900">
                  Listen to Music
                </p>
                <p className="text-mobile-xs text-blue-600 truncate">
                  {vibe.musicLink}
                </p>
              </div>
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        )}

        {/* Action Buttons */}
        {vibe.isOwner && (
          <div className="space-y-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleEdit}
              className="w-full mobile-button-secondary touch-target text-mobile-base font-medium"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Spot
            </button>
            
            <button
              onClick={handleDelete}
              className="w-full bg-red-50 text-red-600 border border-red-200 rounded-lg touch-target text-mobile-base font-medium hover:bg-red-100 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Spot
            </button>
          </div>
        )}

        {/* Bottom spacing for safe area */}
        <div className="pb-safe" />
      </div>
    </BottomSheet>
  );
};

export default PinDetailSheet;