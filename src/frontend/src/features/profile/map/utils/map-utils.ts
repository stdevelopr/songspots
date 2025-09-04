import type { Pin as BackendPin } from '../../../../backend/backend.did';

export interface ValidPin {
  lat: number;
  lng: number;
  pin: BackendPin;
}

export interface MapConfig {
  center: [number, number];
  zoom: number;
}

export const parseCoordinates = (lat: string, lng: string): { lat: number; lng: number } | null => {
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);
  
  if (isNaN(latitude) || isNaN(longitude)) {
    return null;
  }
  
  return { lat: latitude, lng: longitude };
};

export const calculateMapCenter = (pins: BackendPin[], config: {
  defaultCenter: [number, number];
  defaultZoom: number;
  singlePinZoom: number;
  multiPinZoom: number;
}): MapConfig => {
  if (!pins || pins.length === 0) {
    return { center: config.defaultCenter, zoom: config.defaultZoom };
  }

  const validPins = pins
    .map(pin => parseCoordinates(pin.latitude, pin.longitude))
    .filter(Boolean) as Array<{ lat: number; lng: number }>;

  if (validPins.length === 0) {
    return { center: config.defaultCenter, zoom: config.defaultZoom };
  }

  const avgLat = validPins.reduce((sum, pin) => sum + pin.lat, 0) / validPins.length;
  const avgLng = validPins.reduce((sum, pin) => sum + pin.lng, 0) / validPins.length;
  
  return {
    center: [avgLat, avgLng],
    zoom: validPins.length === 1 ? config.singlePinZoom : config.multiPinZoom
  };
};

export const createPopupContent = (pin: BackendPin): string => {
  return `
    <div class="pin-popup">
      <h3 class="font-semibold text-lg mb-2">${pin.name || 'Unnamed Pin'}</h3>
      ${pin.description ? `<p class="text-sm text-gray-600 mb-2">${pin.description}</p>` : ''}
      ${pin.musicLink ? `<a href="${pin.musicLink}" target="_blank" class="text-blue-500 hover:text-blue-700 text-sm">🎵 Listen</a>` : ''}
    </div>
  `;
};