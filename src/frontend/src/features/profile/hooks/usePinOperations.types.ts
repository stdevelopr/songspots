export interface Pin {
  id: bigint;
  name: string;
  description: string;
  musicLink: string;
  latitude: string;
  longitude: string;
  isPrivate: boolean;
}

export interface PinUpdateData {
  name: string;
  description: string;
  musicLink: string;
  isPrivate: boolean;
}

export interface UsePinOperationsProps {
  visiblePins: Pin[];
  onFocusMapPin: (pinId: string) => void;
}

export interface PinHighlightConfig {
  transform: string;
  boxShadow: string;
  borderColor: string;
  borderWidth: string;
  background: string;
  transition: string;
}

// Constants
export const PIN_OPERATION_CONSTANTS = {
  HIGHLIGHT_DURATION: 2500,
  MOBILE_BREAKPOINT: 768,
  HIGHLIGHT_Z_INDEX: '1001',
} as const;

export const PIN_HIGHLIGHT_STYLES: PinHighlightConfig = {
  transform: 'scale(1.02)',
  boxShadow: '0 12px 40px rgba(59, 130, 246, 0.4), 0 4px 20px rgba(59, 130, 246, 0.2)',
  borderColor: 'rgb(59, 130, 246)',
  borderWidth: '2px',
  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(147, 197, 253, 0.1) 100%)',
  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
} as const;

export const SELECTED_INDICATOR_HTML = `
  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
  </svg>
  Selected
` as const;