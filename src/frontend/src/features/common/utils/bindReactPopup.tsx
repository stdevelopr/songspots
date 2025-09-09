import React, { ReactElement } from 'react';
import L from 'leaflet';
import { createRoot, Root } from 'react-dom/client';
import popupStyles from '../components/PopupWrapper.module.css';

/**
 * Use a factory so props are always fresh when the popup opens.
 * We avoid unmounting during React render to prevent warnings.
 */
export function bindReactPopup(
  marker: L.Marker,
  elementFactory: () => ReactElement,
  options: L.PopupOptions = {
    closeButton: false,
    autoClose: true,
    closeOnEscapeKey: true,
    closeOnClick: false,
    maxWidth: window.innerWidth < 600 ? window.innerWidth * 0.95 : 320,
    className: popupStyles.enhancedPopup,
  },
  onClose?: () => void
) {
  const container = document.createElement('div');
  const popup = L.popup(options).setContent(container);
  marker.bindPopup(popup);

  // Create root once and reuse it
  const root: Root = createRoot(container);

  const handleOpen = () => {
    root.render(elementFactory());
  };

  const handleRemove = () => {
    // fully unmount on marker removal, but defer to next frame
    // to avoid "synchronously unmount a root while rendering" warning
    requestAnimationFrame(() => {
      try {
        root.unmount();
      } catch {}
    });
  };

  marker.on('popupopen', handleOpen);
  marker.on('remove', handleRemove);

  return popup;
}
