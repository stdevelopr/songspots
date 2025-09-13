import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BottomSheet } from '../../../components/mobile/BottomSheet';
import { MusicEmbed } from '@common';
import { useGetUserProfileByPrincipal } from '@common';
import { useAccessibility } from '../../../utils/accessibility';
import { haptics } from '../../../utils/haptics';
import type { Pin } from '../../map/types/map';
import { getMoodById } from '../../common/types/moods';

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
  const { announce, generateId } = useAccessibility();
  const ownerPrincipal = vibe?.owner?.toString?.() || '';
  const { data: ownerProfile } = useGetUserProfileByPrincipal(ownerPrincipal);
  const displayName = (ownerProfile?.name || '').trim() || `${ownerPrincipal.slice(0, 6)}...${ownerPrincipal.slice(-4)}`;
  const initials = React.useMemo(() => {
    const n = (ownerProfile?.name || '').trim();
    if (!n) return ownerPrincipal.slice(0, 2).toUpperCase();
    const parts = n.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return n.slice(0, 2).toUpperCase();
  }, [ownerProfile?.name, ownerPrincipal]);

  useEffect(() => {
    if (isOpen && vibe) {
      announce(`Viewing details for ${vibe.name}`, 'polite');
    }
  }, [isOpen, vibe, announce]);

  if (!vibe) return null;

  const handleViewProfile = () => {
    haptics.tap();
    onViewProfile(vibe.owner.toString());
    onClose();
  };

  const handleEdit = () => {
    haptics.buttonPress();
    onEdit(vibe);
    onClose();
  };

  const handleDelete = () => {
    haptics.buttonPress();
    onDelete(vibe);
    onClose();
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      snapPoints={[0.9]}
      initialSnapPoint={0}
      showHandle={true}
      closeOnOverlayClick={true}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-mobile-xl font-bold text-gray-900 leading-tight">{vibe.name}</h2>
            {vibe.owner && (
              <Link
                to={`/profile/${encodeURIComponent(vibe.owner.toString())}`}
                onClick={() => handleViewProfile()}
                className="mt-1 inline-flex items-center gap-2 text-mobile-xs text-gray-500 hover:text-blue-700"
                aria-label={`View profile of ${displayName}`}
              >
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-semibold">
                  {initials}
                </span>
                <span>by {displayName}</span>
              </Link>
            )}
          </div>
          <div className="flex items-center gap-2 ml-4">
            {/* Mood indicator */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100">
              <span className="text-lg">{vibe.mood ? getMoodById(vibe.mood).emoji : '😊'}</span>
              <span className="text-mobile-sm font-medium text-gray-700">
                {vibe.mood ? getMoodById(vibe.mood).name : 'Good Vibes'}
              </span>
            </div>

            {/* Privacy indicator */}
            {vibe.isPrivate && (
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100">
                <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {vibe.description && (
          <div>
            <h3 className="text-mobile-base font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-mobile-base text-gray-700 leading-relaxed">{vibe.description}</p>
          </div>
        )}

        {/* Music / Video Embed */}
        {vibe.musicLink && (
          <div>
            <h3 className="text-mobile-base font-semibold text-gray-900 mb-2">Media</h3>
            <div className="rounded-xl overflow-hidden border border-gray-200">
              <MusicEmbed musicLink={vibe.musicLink} />
            </div>
          </div>
        )}

        {/* Owner Action Buttons */}
        {vibe.isOwner && (
          <div className="space-y-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleEdit}
              className="w-full mobile-button-secondary touch-target text-mobile-base font-medium flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit Spot
            </button>

            <button
              onClick={handleDelete}
              className="w-full bg-red-50 text-red-600 border border-red-200 rounded-lg touch-target text-mobile-base font-medium hover:bg-red-100 transition-colors flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
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
