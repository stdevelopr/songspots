// Common pin data interface used in modals
export interface PinData {
  name: string;
  description: string;
  musicLink: string;
  isPrivate: boolean;
}

// Modal props interfaces
export interface PinCreateModalProps {
  isOpen: boolean;
  location?: { lat: number; lng: number } | null;
  onSubmit: (pinData: PinData, location?: { lat: number; lng: number } | null) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export interface PinEditModalProps {
  isOpen: boolean;
  pin: any; // This should be replaced with actual Pin type from map types
  onSubmit: (pinData: PinData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export interface PinDetailModalProps {
  pin: any | null; // This should be replaced with actual Pin type from map types
  isOpen: boolean;
  onClose: () => void;
  onViewProfile: (userId: string | null) => void;
  onEdit: (pin: any) => void;
  onDelete: (pin: any) => void;
}

// Pin modal base props (extracted from PinModal.tsx)
export interface PinModalProps {
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

// Pin info popup props
export interface PinInfoPopupProps {
  pin: any; // This should be replaced with actual Pin type from map types
  onViewProfile: (userId: string | null) => void;
  onEdit?: (pin: any) => void;
  onDelete?: (pin: any) => void;
  onClose?: () => void;
  showPrivacy?: boolean;
  showTimestamp?: boolean;
  modalLayout?: boolean;
}