import React from 'react';
import { ResponsiveComponent } from '../common/ResponsiveComponent';
import PinInfoPopupDesktop from './components/PinInfoPopupDesktop';
import PinInfoPopupMobilePortrait from './components/PinInfoPopupMobilePortrait';
import PinInfoPopupMobileLandscape from './components/PinInfoPopupMobileLandscape';
import { Pin } from '../map/types/map';

interface PinInfoPopupProps {
  pin: Pin;
  onViewProfile: (userId: string | null) => void;
  onEdit?: (pin: Pin) => void;
  onDelete?: (pin: Pin) => void;
  onClose?: () => void;
  showPrivacy?: boolean;
  showTimestamp?: boolean;
  modalLayout?: boolean;
}

const PinInfoPopup: React.FC<PinInfoPopupProps> = ({
  pin,
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
    pin,
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
        <PinInfoPopupDesktop {...commonProps} />
      </ResponsiveComponent>

      {/* Mobile Portrait Layout */}
      <ResponsiveComponent showOnLayoutTypes={['mobile-portrait']}>
        <PinInfoPopupMobilePortrait {...commonProps} />
      </ResponsiveComponent>

      {/* Mobile Landscape Layout - Also used for Tablet Landscape */}
      <ResponsiveComponent showOnLayoutTypes={['mobile-landscape', 'tablet-landscape']}>
        <PinInfoPopupMobileLandscape {...commonProps} />
      </ResponsiveComponent>

      {/* Tablet Portrait Layout */}
      <ResponsiveComponent showOnLayoutTypes={['tablet-portrait']}>
        <PinInfoPopupMobilePortrait {...commonProps} />
      </ResponsiveComponent>
    </>
  );
};

export default PinInfoPopup;
