import React, { useState, useEffect } from 'react';
import { isValidMusicLink } from '../../../common/validateLinks';
import VibeModal from './VibeModal';
import { VibeData } from '../../types';

interface VibeCreateModalProps {
  isOpen: boolean;
  location?: { lat: number; lng: number } | null;
  onSubmit: (vibeData: VibeData, location?: { lat: number; lng: number } | null) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const VibeCreateModal: React.FC<VibeCreateModalProps> = ({
  isOpen,
  location,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [musicLink, setMusicLink] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName('');
      setDescription('');
      setMusicLink('');
      setIsPrivate(false);
      setError('');
    }
  }, [isOpen]);

  const validateMusicLink = (link: string): boolean => isValidMusicLink(link);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Allow submission but clear invalid music links
    const validMusicLink = validateMusicLink(musicLink) ? musicLink.trim() : '';

    onSubmit(
      {
        name: name.trim(),
        description: description.trim(),
        musicLink: validMusicLink,
        isPrivate,
      },
      location
    );
  };

  const handleMusicLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMusicLink(value);

    // Show warning for invalid links, but don't prevent submission
    if (value.trim() !== '' && !validateMusicLink(value)) {
      setError('Link is not valid');
    } else {
      setError('');
    }
  };

  return (
    <VibeModal
      isOpen={isOpen}
      title="Create Vibe"
      name={name}
      setName={setName}
      description={description}
      setDescription={setDescription}
      musicLink={musicLink}
      setMusicLink={handleMusicLinkChange}
      isPrivate={isPrivate}
      setIsPrivate={setIsPrivate}
      error={error}
      isSubmitting={isSubmitting}
      onCancel={onCancel}
      onSubmit={handleSubmit}
      submitText={isSubmitting ? 'Creating...' : 'Create Vibe'}
    />
  );
};

export default VibeCreateModal;
