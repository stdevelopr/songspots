import { Principal } from '@dfinity/principal';

export interface Pin {
  id: string;
  lat: number;
  lng: number;
  timestamp: number;
  name?: string;
  description?: string;
  musicLink?: string;
  isPrivate?: boolean;
  isOwner?: boolean;
  owner: Principal;
}

export interface UserLocation {
  lat: number;
  lng: number;
  accuracy: number;
}

export interface PendingPin {
  lat: number;
  lng: number;
}

export interface SelectedPin {
  lat: number;
  lng: number;
  id: string;
}

export interface InteractiveMapProps {
  onViewUserProfile: IOnViewUserProfile;
  selectedPin?: SelectedPin | null;
  onPinSelected?: () => void;
  onMapReady?: () => void; // Callback for when map is ready
  onMapInitialized?: () => void; // Callback for when map is initialized
  onLocationProcessed?: () => void; // Callback for when location is processed
  onMapCentered?: () => void; // Callback for when map is centered
  isLoadingTransition?: boolean; // Prop to indicate loading state
  isInitialLoading?: boolean; // Prop to indicate initial loading state
}

export interface IOnViewUserProfile {
  (userId: string | null): void;
}
