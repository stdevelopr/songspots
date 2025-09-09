import { MoodType } from '@common/types/moods';

export interface SelectedPin {
  id: string;
  lat: number;
  lng: number;
}

export interface SelectedVibe {
  id: string;
  lat: number;
  lng: number;
}
export interface UserLocation {
  lat: number;
  lng: number;
  accuracy: number;
}
export type LocationStatus = 'requesting' | 'granted' | 'denied' | 'unavailable';

// Keep this local Pin type minimal; extend as needed

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
  owner: { toString(): string };
  mood?: MoodType;
}

// Vibe type (updated from Pin)
export interface Vibe {
  id: string;
  lat: number;
  lng: number;
  timestamp: number;
  name?: string;
  description?: string;
  musicLink?: string;
  isPrivate?: boolean;
  isOwner?: boolean;
  owner: { toString(): string };
  mood?: MoodType;
}
