// Map configuration constants
export const MAP_CONFIG = {
  DEFAULT_CENTER: [40.7128, -74.006] as [number, number], // NYC
  DEFAULT_ZOOM: 2,
  SINGLE_PIN_ZOOM: 10,
  MULTI_PIN_ZOOM: 5,
  TILE_LAYER_URL: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  MAX_ZOOM: 19,
  ATTRIBUTION: '© OpenStreetMap contributors'
} as const;

// UI constants
export const UI_CONFIG = {
  COLLAPSED_HEIGHT: '64px',
  DEFAULT_EXPANDED_HEIGHT: '400px',
  MIN_HEIGHT: '150px',
  FIT_BOUNDS_PADDING: [20, 20] as [number, number],
  MAX_ZOOM_ON_FIT: 15
} as const;