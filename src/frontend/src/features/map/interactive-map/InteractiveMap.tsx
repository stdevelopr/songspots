import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Pin, SelectedPin } from '../types/map';
import { useLocation } from '../../common/useLocation';

import { MapHUD } from '../MapHUD';
import { useInternetIdentity } from 'ic-use-internet-identity';
import { useCreatePin, useDeletePin, useUpdatePin } from '../../common/useQueries';
import type { Pin as BackendPin } from '../../../backend/backend.did';
import { useMap } from '../useMap';
import { usePinLayer } from '../../pins/usePinLayer';
import PinDetailModal from '../../pins/PinDetailModal';
import { useIsMobile } from '../../common/useIsMobile';
import DeleteConfirmationModal from '../../common/DeleteConfirmationModal';
import PinEditModal from '../../pins/PinEditModal';
import { toNat } from '../../common/utils/nat';
import PinCreateModal from '../../pins/PinCreateModal';

const DEFAULT_CENTER: [number, number] = [40.7128, -74.006];
const DEFAULT_ZOOM = 10;

interface Props {
  onViewUserProfile: (userId: string) => void;
  selectedPin?: SelectedPin | null;
  onPinSelected?: (pin: Pin) => void;
  onMapReady?: () => void;
  onMapInitialized?: () => void;
  onLocationProcessed?: () => void;
  onMapCentered?: () => void;
  isLoadingTransition?: boolean;
  isInitialLoading?: boolean;
  backendPins: BackendPin[];
  fromProfile?: boolean;
}

const InteractiveMap: React.FC<Props> = ({
  onViewUserProfile,
  selectedPin,
  onPinSelected,
  onMapReady,
  onMapInitialized,
  onLocationProcessed,
  onMapCentered,
  backendPins = [],
  isLoadingTransition = false,
  isInitialLoading = false,
  fromProfile = false,
}) => {
  const { mapRef, mapInstance } = useMap();
  const { identity } = useInternetIdentity();
  const createPinMutation = useCreatePin();
  const deletePinMutation = useDeletePin();
  const updatePinMutation = useUpdatePin();
  const [pinToEdit, setPinToEdit] = useState<any | null>(null);
  const [pinDetailModalOpen, setPinDetailModalOpen] = useState(false);
  const [selectedPinDetail, setSelectedPinDetail] = useState<Pin | null>(null);
  const [pinCreateModalOpen, setPinCreateModalOpen] = useState(false);

  // Pins state (converted from backend)
  const [pins, setPins] = useState<Pin[]>([]);
  const isMobile = useIsMobile();
  const currentUser = identity?.getPrincipal().toString();

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

  useEffect(() => {
    if (!backendPins?.length) return;
    setPins(
      backendPins.map((p) => ({
        id: p.id.toString(),
        lat: parseFloat(p.latitude),
        lng: parseFloat(p.longitude),
        timestamp: Date.now(),
        name: p.name || undefined,
        description: p.description || undefined,
        isPrivate: p.isPrivate,
        isOwner: currentUser ? p.owner.toString() === currentUser : false,
        owner: p.owner,
      }))
    );
  }, [backendPins, currentUser]);

  // Location
  const { userLocation, status, complete, refreshing, request } = useLocation();
  useEffect(() => {
    request(false);
    onLocationProcessed?.();
  }, []);

  // Center map based on location / defaults
  useEffect(() => {
    if (!mapInstance || selectedPin) return;

    console.log('Centering map based on user location or defaults');
    if (status === 'granted' && userLocation) {
      mapInstance.setView([userLocation.lat, userLocation.lng], 15);
      setTimeout(() => onMapCentered?.(), 500);
    } else if (status === 'unavailable' || status === 'denied') {
      mapInstance.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
      onMapCentered?.();
    }
  }, [mapInstance, status, userLocation, selectedPin, onMapCentered]);

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
    // ...existing code for animated flyTo...
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

  // Map click to add pin (UI wiring for modal kept outside for brevity)
  useEffect(() => {
    if (!mapInstance) return;
    const onClick = (e: L.LeafletMouseEvent) => {
      if (!identity) return alert('Please log in to create pins');
      setPinCreateModalOpen(true);
    };
    mapInstance.on('click', onClick);
    onMapInitialized?.();
    return () => {
      mapInstance.off('click', onClick);
    };
  }, [mapInstance, identity, onMapInitialized]);

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

  // Render pins via hook
  usePinLayer({
    map: mapInstance,
    pins,
    onViewProfile: onViewUserProfile,
    onEdit: (pin) => {
      setPinToEdit(pin);
    },
    onDelete: (pin) => {
      /* open delete modal */ console.log('delete', pin);
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

  useEffect(() => {
    if (!mapInstance) return;

    const close = () => mapInstance.closePopup();

    mapInstance.on('dragstart', close);
    mapInstance.on('zoomstart', close);

    return () => {
      mapInstance.off('dragstart', close);
      mapInstance.off('zoomstart', close);
    };
  }, [mapInstance]);

  const publicCount = useMemo(() => pins.filter((p) => !p.isPrivate).length, [pins]);
  const privateCount = useMemo(() => pins.filter((p) => p.isPrivate && p.isOwner).length, [pins]);

  return (
    <div className="relative w-full h-full">
      {/* Pin Detail Modal for mobile */}
      <PinDetailModal
        pin={selectedPinDetail}
        isOpen={pinDetailModalOpen}
        onClose={() => setPinDetailModalOpen(false)}
        onViewProfile={onViewUserProfile}
        onEdit={setPinToEdit}
        onDelete={(pin) => {
          /* open delete modal */ console.log('delete', pin);
        }}
      />
      <MapHUD
        status={status}
        userLocation={userLocation}
        showCounts={pins.length > 0}
        publicCount={publicCount}
        privateCount={privateCount}
        hasIdentity={!!identity}
        onMyLocation={() => request(true)}
        isRefreshing={refreshing}
        isLoadingTransition={isLoadingTransition!}
        isInitialLoading={isInitialLoading!}
      />
      <div ref={mapRef} className="w-full h-full" />

      {/* Delete Confirmation Modal */}
      {/* <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isDeleting={deletePinMutation.isPending}
        pinName={pinToDelete?.name || 'Unnamed Pin'}
      /> */}

      {/* Pin Edit Modal */}
      <PinEditModal
        isOpen={true}
        pin={
          pinToEdit
            ? {
                id: pinToEdit.id.toString(),
                name: pinToEdit.name,
                description: pinToEdit.description,
                musicLink: undefined, // Music links are not stored in backend
                isPrivate: pinToEdit.isPrivate,
              }
            : null
        }
        onSubmit={handleEditSubmit}
        onCancel={() => setPinToEdit(null)}
        isSubmitting={updatePinMutation.isPending}
      />
      <PinCreateModal
        isOpen={pinCreateModalOpen}
        onSubmit={handleEditSubmit}
        onCancel={() => setPinCreateModalOpen(false)}
        isSubmitting={updatePinMutation.isPending}
      />
    </div>
  );
};

export default InteractiveMap;
