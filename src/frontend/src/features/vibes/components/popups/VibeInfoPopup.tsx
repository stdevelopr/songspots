import React from 'react';
import { ResponsiveComponent } from '../../../common';
import VibeInfoPopupDesktop from './VibeInfoPopupDesktop';
import VibeInfoPopupMobilePortrait from './VibeInfoPopupMobilePortrait';
import VibeInfoPopupMobileLandscape from './VibeInfoPopupMobileLandscape';
import { Pin } from '../../../map/types/map';

interface VibeInfoPopupProps {
  vibe: Pin;
  onViewProfile: (userId: string | null) => void;
  onEdit?: (vibe: Pin) => void;
  onDelete?: (vibe: Pin) => void;
  onClose?: () => void;
  showPrivacy?: boolean;
  showTimestamp?: boolean;
  modalLayout?: boolean;
}

const VibeInfoPopup: React.FC<VibeInfoPopupProps> = ({
  vibe,
  onViewProfile,
  onEdit,
  onDelete,
  onClose,
  showPrivacy = true,
  showTimestamp = true,
  modalLayout = false,
}) => {
  // Common props to pass to all variants
  const commonProps = {
    vibe,
    onViewProfile,
    onEdit,
    onDelete,
    onClose,
    showTimestamp,
  };

  return (
    <>
      {/* Desktop Layout */}
      <ResponsiveComponent showOnLayoutTypes={['desktop']}>
        <VibeInfoPopupDesktop {...commonProps} />
      </ResponsiveComponent>

      {/* Mobile Portrait Layout */}
      <ResponsiveComponent showOnLayoutTypes={['mobile-portrait']}>
        <VibeInfoPopupMobilePortrait {...commonProps} />
      </ResponsiveComponent>

      {/* Mobile Landscape Layout - Also used for Tablet Landscape */}
      <ResponsiveComponent showOnLayoutTypes={['mobile-landscape', 'tablet-landscape']}>
        <VibeInfoPopupMobileLandscape {...commonProps} />
      </ResponsiveComponent>

      {/* Tablet Portrait Layout */}
      <ResponsiveComponent showOnLayoutTypes={['tablet-portrait']}>
        <VibeInfoPopupMobilePortrait {...commonProps} />
      </ResponsiveComponent>
    </>
  );
};

export default VibeInfoPopup;
