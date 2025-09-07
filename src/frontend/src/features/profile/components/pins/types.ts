export interface Spot {
  id: bigint;
  name: string;
  description?: string;
  musicLink?: string;
  isPrivate: boolean;
  latitude: string;
  longitude: string;
}

export interface PinLike {
  id: bigint | string | number;
  name?: string;
  description?: string;
  musicLink?: string;
  isPrivate?: boolean;
  latitude: string | number;
  longitude: string | number;
}

