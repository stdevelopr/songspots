import React from 'react';
import { useIsMobile } from '@common';
import VibeCreateModal from '../components/modals/VibeCreateModal';
import { PinCreateSheet } from '../mobile/PinCreateSheet';
import { VibeData } from '../types/vibe';

interface PinCreateProps {
  isOpen: boolean;
  location: { lat: number; lng: number } | null;
  onSubmit: (data: {
    name: string;
    description: string;
    musicLink: string;
    isPrivate: boolean;
    mood: string;
    lat: number;
    lng: number;
  }) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const PinCreate: React.FC<PinCreateProps> = ({
  isOpen,
  location,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <PinCreateSheet
        isOpen={isOpen}
        location={location}
        onSubmit={onSubmit}
        onCancel={onCancel}
        isSubmitting={isSubmitting}
      />
    );
  }

  // Adapt the interface for desktop modal
  const handleModalSubmit = (vibeData: VibeData, modalLocation?: { lat: number; lng: number } | null) => {
    const submitLocation = modalLocation || location;
    if (!submitLocation) return;

    const adaptedData = {
      name: vibeData.name,
      description: vibeData.description,
      musicLink: vibeData.musicLink,
      isPrivate: vibeData.isPrivate,
      mood: vibeData.mood || '', // Convert MoodType to string
      lat: submitLocation.lat,
      lng: submitLocation.lng,
    };

    return onSubmit(adaptedData);
  };

  return (
    <VibeCreateModal
      isOpen={isOpen}
      location={location}
      onSubmit={handleModalSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
    />
  );
};

export default PinCreate;