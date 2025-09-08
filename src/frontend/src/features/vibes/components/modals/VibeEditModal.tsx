import React, { useState, useEffect } from 'react';
import { isValidMusicLink } from '../../../common/validateLinks';
import VibeModal from './VibeModal';
import { MoodType } from '../../../common/types/moods';
import MoodSelector from '../MoodSelector';

interface Vibe {
  id: string;
  name?: string;
  description?: string;
  musicLink?: string;
  isPrivate?: boolean;
  mood?: MoodType;
}

interface VibeData {
  name: string;
  description: string;
  musicLink: string;
  isPrivate: boolean;
  mood?: MoodType;
}

interface VibeEditModalProps {
  isOpen: boolean;
  vibe: Vibe | null;
  onSubmit: (vibeData: VibeData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const VibeEditModal: React.FC<VibeEditModalProps> = ({
  isOpen,
  vibe,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [musicLink, setMusicLink] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [mood, setMood] = useState<MoodType | undefined>(undefined);
  const [error, setError] = useState('');

  // Only reset fields when modal opens for a new vibe
  const prevVibeIdRef = React.useRef<string | null>(null);
  useEffect(() => {
    if (isOpen && vibe && vibe.id !== prevVibeIdRef.current) {
      setName(vibe.name || '');
      setDescription(vibe.description || '');
      setMusicLink(vibe.musicLink || '');
      setIsPrivate(vibe.isPrivate || false);
      setMood(vibe.mood);
      setError('');
      prevVibeIdRef.current = vibe.id;
    }
    // If modal closes, reset ref
    if (!isOpen) {
      prevVibeIdRef.current = null;
    }
  }, [isOpen, vibe]);

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
      mood,
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

  if (!isOpen || !vibe) return null;

  return (
    <VibeModal
      isOpen={isOpen}
      title="Edit Vibe"
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
    >
      <div className="mt-4 pt-4 border-t border-gray-200">
        <MoodSelector selectedMood={mood} onMoodSelect={setMood} />
      </div>
    </VibeModal>
  );
};

export default VibeEditModal;
