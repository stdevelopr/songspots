// Main hooks
export { useVibeOperations } from './useVibeOperations';
export { useProfileState } from './useProfileState';
export { useProfilePicture } from './useProfilePicture';
export { useProfileActions } from './useProfileActions';
export { useAuth } from './useAuth';
export { useProfileHeight } from './useProfileHeight';

// Specialized vibe operation hooks
export { useVibeModals } from './useVibeModals';
export { useVibeSelection } from './useVibeSelection';
export { useVibeKeyboardNavigation } from './useVibeKeyboardNavigation';
export { useVibeErrorHandler } from './useVibeErrorHandler';

// Types
export type {
  Vibe,
  VibeUpdateData,
  UseVibeOperationsProps,
  VibeHighlightConfig
} from './useVibeOperations.types';

export type { ErrorState } from './useVibeErrorHandler';

// Constants
export { VIBE_OPERATION_CONSTANTS, VIBE_HIGHLIGHT_STYLES } from './useVibeOperations.types';