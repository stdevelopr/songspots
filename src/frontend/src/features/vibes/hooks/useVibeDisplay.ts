import { useMemo } from 'react';
import { Pin } from '@features/map/types/map';
import { MoodType } from '@common/types/moods';

export interface PinDisplayOptions {
  showTimestamp?: boolean;
}

export interface PinDisplayModel {
  title: string;
  description?: string;
  hasDescription: boolean;
  musicLink?: string;
  hasMedia: boolean;
  // Mood display
  mood?: MoodType;
  hasMood: boolean;
  // Profile button logic
  showProfileButton: boolean;
  profileButton: {
    label: string;
    userId: string | null;
  };
  // Owner actions permissions (callbacks may still be optional in the component)
  canEdit: boolean;
  canDelete: boolean;
  // Timestamp logic (presentation/formatting stays with the layout)
  hasTimestamp: boolean;
  timestampDate?: Date;
}

export function useVibeDisplay(pin: Pin, options: PinDisplayOptions = {}): PinDisplayModel {
  const { showTimestamp = true } = options;

  return useMemo(() => {
    const title = pin.name || 'Unnamed Vibe';
    const description = (pin.description || '').trim();
    const hasDescription = description.length > 0;
    const musicLink = pin.musicLink;
    const hasMedia = Boolean(musicLink);

    const mood = pin.mood;
    const hasMood = Boolean(mood);

    const isOwner = Boolean(pin.isOwner);
    const showProfileButton = !pin.isOwner;
    const profileButton = {
      label: isOwner ? 'My Profile' : 'View Profile',
      userId: isOwner ? null : (pin.owner?.toString?.() ?? null),
    } as const;

    const canEdit = isOwner;
    const canDelete = isOwner;

    const hasTimestamp = Boolean(showTimestamp && pin.timestamp);
    const timestampDate = pin.timestamp ? new Date(pin.timestamp) : undefined;

    return {
      title,
      description: description || undefined,
      hasDescription,
      musicLink,
      hasMedia,
      mood,
      hasMood,
      showProfileButton,
      profileButton,
      canEdit,
      canDelete,
      hasTimestamp,
      timestampDate,
    };
  }, [pin, showTimestamp]);
}

export default useVibeDisplay;
