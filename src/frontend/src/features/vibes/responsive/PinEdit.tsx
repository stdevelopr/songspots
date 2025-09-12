import React from 'react';
import { useIsMobile } from '@common';
import VibeEditModal from '../components/modals/VibeEditModal';
import { PinEditSheet } from '../mobile/PinEditSheet';
import { VibeData } from '../types/vibe';
import { MoodType } from '@common/types/moods';

interface PinEditProps {
  vibe: {
    id: string;
    name: string;
    description: string;
    musicLink: string;
    isPrivate: boolean;
    mood?: MoodType;
  } | null;
  isOpen: boolean;
  onSubmit: (data: {
    id: string;
    name: string;
    description: string;
    musicLink: string;
    isPrivate: boolean;
    mood: string;
  }) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const PinEdit: React.FC<PinEditProps> = ({
  vibe,
  isOpen,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    // Adapt vibe for mobile sheet which expects mood as string
    const mobileVibe = vibe
      ? {
          id: vibe.id,
          name: vibe.name,
          description: vibe.description,
          musicLink: vibe.musicLink,
          isPrivate: vibe.isPrivate,
          mood: vibe.mood ?? '',
        }
      : null;
    return (
      <PinEditSheet
        vibe={mobileVibe}
        isOpen={isOpen}
        onSubmit={onSubmit}
        onCancel={onCancel}
        isSubmitting={isSubmitting}
      />
    );
  }

  // Adapt the interface for desktop modal
  const handleModalSubmit = (vibeData: VibeData) => {
    if (!vibe) return;

    const adaptedData = {
      id: vibe.id,
      name: vibeData.name,
      description: vibeData.description,
      musicLink: vibeData.musicLink,
      isPrivate: vibeData.isPrivate,
      mood: vibeData.mood || '', // Convert MoodType to string
    };

    return onSubmit(adaptedData);
  };

  // Adapt vibe data for modal
  const modalVibe = vibe
    ? {
        id: vibe.id,
        name: vibe.name,
        description: vibe.description,
        musicLink: vibe.musicLink,
        isPrivate: vibe.isPrivate,
        mood: vibe.mood,
      }
    : null;


  return (
    <VibeEditModal
      isOpen={isOpen}
      vibe={modalVibe}
      onSubmit={handleModalSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
    />
  );
};

export default PinEdit;
