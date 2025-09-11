import React from 'react';
import { ResponsiveWrapper } from '../../../components/responsive/ResponsiveWrapper';
import { MobileInteractiveMap } from '../mobile/MobileInteractiveMap';
import { DesktopInteractiveMap } from '../desktop/DesktopInteractiveMap';
import type { Pin, SelectedPin } from '../types/map';
import type { Vibe as BackendVibe } from '@backend/backend.did';

interface InteractiveMapProps {
  onViewUserProfile: (userId: string | null) => void;
  selectedPin?: SelectedPin | null;
  onPinSelected?: (pin: Pin) => void;
  onClearSelection?: () => void;
  suppressAutoCenterOnLoad?: boolean;
  onMapReady?: () => void;
  onMapInitialized?: () => void;
  onLocationProcessed?: () => void;
  onMapCentered?: () => void;
  isLoadingTransition?: boolean;
  isInitialLoading?: boolean;
  backendPins: BackendVibe[];
  fromProfile?: boolean;
  setSelectedPin: React.Dispatch<React.SetStateAction<SelectedPin | null>>;
  profileMode?: boolean;
  onShowLoginPrompt?: (action?: string) => void;
  isAuthenticated?: boolean;
}

/**
 * ResponsiveInteractiveMap - Main entry point for the interactive map
 * Automatically renders the appropriate component based on device type:
 * - Mobile: MobileInteractiveMap (Phase 2 implementation)
 * - Desktop: DesktopInteractiveMap (existing implementation)
 */
export const InteractiveMap: React.FC<InteractiveMapProps> = (props) => {
  return (
    <ResponsiveWrapper
      mobile={MobileInteractiveMap}
      desktop={DesktopInteractiveMap}
      props={props}
    />
  );
};

export default InteractiveMap;
