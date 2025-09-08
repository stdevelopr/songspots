import { MoodType } from '../../common/types/moods';

// Common vibe data interface used in modals
export interface VibeData {
  name: string;
  description: string;
  musicLink: string;
  isPrivate: boolean;
  mood?: MoodType;
}

// Modal props interfaces
export interface VibeCreateModalProps {
  isOpen: boolean;
  location?: { lat: number; lng: number } | null;
  onSubmit: (vibeData: VibeData, location?: { lat: number; lng: number } | null) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export interface VibeEditModalProps {
  isOpen: boolean;
  vibe: any; // This should be replaced with actual Vibe type from map types
  onSubmit: (vibeData: VibeData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export interface VibeDetailModalProps {
  vibe: any | null; // This should be replaced with actual Vibe type from map types
  isOpen: boolean;
  onClose: () => void;
  onViewProfile: (userId: string | null) => void;
  onEdit: (vibe: any) => void;
  onDelete: (vibe: any) => void;
}

// Vibe modal base props (extracted from VibeModal.tsx)
export interface VibeModalProps {
  isOpen: boolean;
  title: string;
  name: string;
  setName: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  musicLink: string;
  setMusicLink: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isPrivate: boolean;
  setIsPrivate: (v: boolean) => void;
  error: string;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
  submitText: string;
  children?: React.ReactNode;
}

// Vibe info popup props
export interface VibeInfoPopupProps {
  vibe: any; // This should be replaced with actual Vibe type from map types
  onViewProfile: (userId: string | null) => void;
  onEdit?: (vibe: any) => void;
  onDelete?: (vibe: any) => void;
  onClose?: () => void;
  showPrivacy?: boolean;
  showTimestamp?: boolean;
  modalLayout?: boolean;
}