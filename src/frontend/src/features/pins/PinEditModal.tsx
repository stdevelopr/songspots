import React, { useState, useEffect } from 'react';
import { isValidMusicLink } from '../common/validateLinks';
import PinModal from './PinModal';

interface Pin {
  id: string;
  name?: string;
  description?: string;
  musicLink?: string;
  isPrivate?: boolean;
}

interface PinData {
  name: string;
  description: string;
  musicLink: string;
  isPrivate: boolean;
}

interface PinEditModalProps {
  isOpen: boolean;
  pin: Pin | null;
  onSubmit: (pinData: PinData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const PinEditModal: React.FC<PinEditModalProps> = ({
  isOpen,
  pin,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [musicLink, setMusicLink] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [error, setError] = useState('');

  // Only reset fields when modal opens for a new pin
  const prevPinIdRef = React.useRef<string | null>(null);
  useEffect(() => {
    if (isOpen && pin && pin.id !== prevPinIdRef.current) {
      setName(pin.name || '');
      setDescription(pin.description || '');
      setMusicLink(pin.musicLink || '');
      setIsPrivate(pin.isPrivate || false);
      setError('');
      prevPinIdRef.current = pin.id;
    }
    // If modal closes, reset ref
    if (!isOpen) {
      prevPinIdRef.current = null;
    }
  }, [isOpen, pin]);

  const validateMusicLink = (link: string): boolean => isValidMusicLink(link);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Allow submission but clear invalid music links
    const validMusicLink = validateMusicLink(musicLink) ? musicLink.trim() : '';

    onSubmit({
      name: name.trim(),
      description: description.trim(),
      musicLink: validMusicLink,
      isPrivate,
    });
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

  if (!isOpen || !pin) return null;

  return (
    <PinModal
      isOpen={isOpen}
      title="Edit Spot"
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
      submitText={isSubmitting ? 'Saving...' : 'Save Changes'}
    />
  );
};

export default PinEditModal;
