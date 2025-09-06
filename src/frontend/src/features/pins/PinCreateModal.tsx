import React, { useState, useEffect } from 'react';
import PinModal from './PinModal';

interface PinData {
  name: string;
  description: string;
  musicLink: string;
  isPrivate: boolean;
}

interface PinCreateModalProps {
  isOpen: boolean;
  location?: { lat: number; lng: number } | null;
  onSubmit: (pinData: PinData, location?: { lat: number; lng: number } | null) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const PinCreateModal: React.FC<PinCreateModalProps> = ({
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

  const validateMusicLink = (link: string): boolean => {
    if (!link.trim()) return true; // Empty link is allowed

    const youtubeRegex = /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/(watch|shorts|embed)\/.+/;
    const spotifyRegex = /^https?:\/\/(open\.)?spotify\.com\/.+/;

    return youtubeRegex.test(link) || spotifyRegex.test(link);
  };

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
    <PinModal
      isOpen={isOpen}
      title="Create Spot"
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
      submitText={isSubmitting ? 'Creating...' : 'Create Spot'}
    />
  );
};

export default PinCreateModal;
