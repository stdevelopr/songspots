import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { usePinLayer } from '../pins';
import { Pin, SelectedPin } from './types/map';
import type { Pin as BackendPin } from '../../backend/backend.did';
import { IOnViewUserProfile } from './interactive-map/interactiveMapTypes';
import { useCreatePin, useDeletePin, useUpdatePin } from '../common';
import { toNat } from '../common/utils/nat';

export const usePins = ({
  mapInstance,
  isMobile,
  backendPins,
  currentUser,
  onViewUserProfile,
  onPinSelected,
  userLocation,
  selectedPin,
  onMapReady,
  fromProfile,
  isLoadingTransition,
  onDeletePin,
}: {
  mapInstance: L.Map | null;
  isMobile: boolean;
  backendPins: BackendPin[];
  currentUser: string | undefined;
  onViewUserProfile: IOnViewUserProfile;
  onPinSelected: ((pin: Pin) => void) | undefined;
  userLocation: { lat: number; lng: number } | null;
  selectedPin: SelectedPin | null | undefined;
  onMapReady: (() => void) | undefined;
  fromProfile: boolean | undefined;
  isLoadingTransition: boolean | undefined;
  onDeletePin: (pin: Pin) => void;
}) => {
  const [pins, setPins] = useState<Pin[]>([]);
  const [pinToEdit, setPinToEdit] = useState<any | null>(null);
  const [selectedPinDetail, setSelectedPinDetail] = useState<Pin | null>(null);
  const [pinDetailModalOpen, setPinDetailModalOpen] = useState(false);
  const [pinCreateModalOpen, setPinCreateModalOpen] = useState(false);

  const createPinMutation = useCreatePin();
  const deletePinMutation = useDeletePin();
  const updatePinMutation = useUpdatePin();

  usePinLayer({
    isMobile,
    map: mapInstance,
    pins,
    onViewProfile: onViewUserProfile,
    onEdit: (pin) => {
      setPinToEdit(pin);
    },
    onDelete: (pin) => {
      if (onDeletePin) {
        onDeletePin(pin);
      }
    },
    onPinClick: (pin) => {
      if (isMobile) {
        if (mapInstance) {
          mapInstance.panTo([pin.lat, pin.lng], { animate: true });
          const handleMoveEnd = () => {
            setSelectedPinDetail(pin);
            setPinDetailModalOpen(true);

            mapInstance.off('moveend', handleMoveEnd);
          };
          mapInstance.on('moveend', handleMoveEnd);
        } else {
          setSelectedPinDetail(pin);
          setPinDetailModalOpen(true);
        }
      } else {
        if (onPinSelected) {
          onPinSelected(pin);
        }
      }
    },
  });

  // Leaflet user location marker
  const userMarkerRef = useRef<L.Marker | null>(null);
  useEffect(() => {
    if (!mapInstance || !userLocation) return;
    if (userMarkerRef.current) mapInstance.removeLayer(userMarkerRef.current);
    const icon = L.divIcon({
      className: 'user-location-marker',
      html: `<div class="user-location-pin"><div class="user-location-pulse"></div><div class="user-location-dot"></div></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
    userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon }).addTo(
      mapInstance
    );
  }, [mapInstance, userLocation]);

  useEffect(() => {
    if (!backendPins?.length) return;
    setPins(
      backendPins.map((p) => {
        const pinObj = {
          id: p.id.toString(),
          lat: parseFloat(p.latitude),
          lng: parseFloat(p.longitude),
          timestamp: Date.now(),
          name: p.name || undefined,
          description: p.description || undefined,
          musicLink: p.musicLink || undefined,
          isPrivate: p.isPrivate,
          isOwner: currentUser ? p.owner.toString() === currentUser : false,
          owner: p.owner,
        };
        return pinObj;
      })
    );
  }, [backendPins, currentUser]);

  // Selected pin centering
  useEffect(() => {
    if (!mapInstance || !selectedPin) return;
    const target = pins.find((p) => p.id === selectedPin.id);
    if (!target) {
      onMapReady?.();
      return;
    }

    if (fromProfile) {
      // Instantly center and open popup when coming from profile
      mapInstance.setView([target.lat, target.lng], 16, { animate: false });
      const markerLayer = Object.values((mapInstance as any)._layers).find(
        (layer: any) =>
          layer instanceof L.Marker &&
          layer.getLatLng().lat === target.lat &&
          layer.getLatLng().lng === target.lng
      ) as L.Marker | undefined;
      if (markerLayer && typeof markerLayer.openPopup === 'function') {
        markerLayer.openPopup();
      }
      onMapReady?.();
      return;
    }

    const mapHeight = mapInstance.getSize().y;
    let offsetPixels;
    if (isMobile) {
      offsetPixels = mapHeight > 0 ? Math.round(mapHeight / 4) : 100; // 1/4 from top for mobile
    } else {
      offsetPixels = mapHeight > 0 ? Math.round(mapHeight / 10) : 40; // smaller offset for desktop
    }
    const targetPoint = mapInstance.project([target.lat, target.lng], mapInstance.getZoom());
    const offsetPoint = L.point(targetPoint.x, targetPoint.y - offsetPixels);
    const offsetLatLng = mapInstance.unproject(offsetPoint, mapInstance.getZoom());
    mapInstance.flyTo([offsetLatLng.lat, offsetLatLng.lng], 16);

    // Handler to open popup after moveend
    const handleMoveEnd = () => {
      if (!isMobile) {
        const markerLayer = Object.values((mapInstance as any)._layers).find(
          (layer: any) =>
            layer instanceof L.Marker &&
            layer.getLatLng().lat === target.lat &&
            layer.getLatLng().lng === target.lng
        ) as L.Marker | undefined;
        if (markerLayer && typeof markerLayer.openPopup === 'function') {
          markerLayer.openPopup();
        }
      }
      mapInstance.off('moveend', handleMoveEnd);
    };
    mapInstance.on('moveend', handleMoveEnd);

    // Cleanup in case effect re-runs before moveend
    return () => {
      mapInstance.off('moveend', handleMoveEnd);
    };
  }, [mapInstance, selectedPin, isLoadingTransition, pins, onMapReady, onPinSelected]);

  const handleEditSubmit = async (pinData: {
    name: string;
    description: string;
    musicLink: string;
    isPrivate: boolean;
  }) => {
    if (!pinToEdit) return;
    try {
      await updatePinMutation.mutateAsync({
        id: toNat(pinToEdit.id), // nat (bigint)
        name: pinData.name ?? '', // text
        description: pinData.description ?? '', // text
        musicLink: pinData.musicLink ?? '', // text
        latitude: String(pinToEdit.lat), // text
        longitude: String(pinToEdit.lng), // text
        isPrivate: !!pinData.isPrivate, // bool
      });
      setPinToEdit(null);
    } catch (error) {
      console.error('Failed to update pin:', error);
      alert('Failed to update pin. Please try again.');
    }
  };

  const handleCreateSubmit = async (
    pinData: {
      name: string;
      description: string;
      musicLink: string;
      isPrivate: boolean;
    },
    location?: { lat: number; lng: number } | null
  ) => {
    try {
      if (!location) {
        // If no location is provided, do not fly the map
        await createPinMutation.mutateAsync({
          name: pinData.name ?? '',
          description: pinData.description ?? '',
          musicLink: pinData.musicLink ?? '',
          latitude: '',
          longitude: '',
          isPrivate: !!pinData.isPrivate,
        });
        setPinCreateModalOpen(false);
        setPinToEdit(null);
        return;
      }
      // Always use the modal's location for the pin
      const lat = location.lat;
      const lng = location.lng;
      await createPinMutation.mutateAsync({
        name: pinData.name ?? '',
        description: pinData.description ?? '',
        musicLink: pinData.musicLink ?? '',
        latitude: String(lat),
        longitude: String(lng),
        isPrivate: !!pinData.isPrivate,
      });
      setPinCreateModalOpen(false);
      setPinToEdit(null); // Clear edit state after creating
      // Fly to the new pin location using the coordinates from the modal, not from state
      if (mapInstance) {
        setTimeout(() => {
          mapInstance.flyTo([lat, lng], 16, { animate: true });
        }, 300); // Delay to ensure map doesn't fly to old pin
      }
    } catch (error) {
      console.error('Failed to create pin:', error);
      alert('Failed to create pin. Please try again.');
    }
  };

  return {
    pins,
    pinToEdit,
    setPinToEdit,
    selectedPinDetail,
    setSelectedPinDetail,
    pinDetailModalOpen,
    setPinDetailModalOpen,
    pinCreateModalOpen,
    setPinCreateModalOpen,
    handleEditSubmit,
    handleCreateSubmit,
    updatePinMutation,
    createPinMutation,
    deletePinMutation,
  };
};
