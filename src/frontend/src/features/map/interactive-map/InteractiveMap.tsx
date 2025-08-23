import React, { useEffect, useMemo, useState } from 'react';
import { toNat } from '../../common/utils/nat';
import { DeleteConfirmationModal } from '../../common';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Pin, SelectedPin } from '../types/map';
import { useLocation } from '../../common/useLocation';
import { MapHUD } from '../MapHUD';
import { useInternetIdentity } from 'ic-use-internet-identity';
import type { Pin as BackendPin } from '../../../backend/backend.did';
import { useMap } from '../useMap';
import PinDetailModal from '../../pins/PinDetailModal';
import { useIsMobile } from '../../common/useIsMobile';
import PinEditModal from '../../pins/PinEditModal';
import PinCreateModal from '../../pins/PinCreateModal';
import { usePins } from '../usePins';

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
  setSelectedPin: React.Dispatch<React.SetStateAction<SelectedPin | null>>;
}

const InteractiveMap: React.FC<Props> = (props) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pinToDelete, setPinToDelete] = useState<Pin | null>(null);
  const {
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
    setSelectedPin,
  } = props;

  const [newPinLocation, setNewPinLocation] = React.useState<{ lat: number; lng: number } | null>(
    null
  );
  // Flag to prevent user location centering after pin creation
  const [justCreatedPin, setJustCreatedPin] = React.useState(false);
  const { identity } = useInternetIdentity();
  const isMobile = useIsMobile();
  const currentUser = identity?.getPrincipal().toString();
  const { userLocation, status, complete, refreshing, request } = useLocation();
  const { mapRef, mapInstance } = useMap();

  const [popupOpen, setPopupOpen] = useState(false);

  const {
    pins,
    pinToEdit,
    setPinToEdit,
    selectedPinDetail,
    pinDetailModalOpen,
    setPinDetailModalOpen,
    pinCreateModalOpen,
    setPinCreateModalOpen,
    handleEditSubmit,
    handleCreateSubmit,
    updatePinMutation,
    createPinMutation,
    deletePinMutation,
  } = usePins({
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
    onDeletePin: (pin) => {
      setPinToDelete(pin);
      setShowDeleteModal(true);
      setPopupOpen(true);
    },
  });

  useEffect(() => {
    request(false);
    onLocationProcessed?.();
  }, []);

  // Center map based on location / defaults
  useEffect(() => {
    if (!mapInstance || selectedPin) return;
    if (justCreatedPin) return; // Skip centering after pin creation
    if (status === 'granted' && userLocation) {
      mapInstance.setView([userLocation.lat, userLocation.lng], 15);
      setTimeout(() => onMapCentered?.(), 500);
    } else if (status === 'unavailable' || status === 'denied') {
      mapInstance.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
      onMapCentered?.();
    }
  }, [mapInstance, status, userLocation, selectedPin, onMapCentered]);

  // Map click to add pin (UI wiring for modal kept outside for brevity)
  useEffect(() => {
    if (!mapInstance) return;
    const onClick = (e: L.LeafletMouseEvent) => {
      mapInstance.closePopup();
      if (!identity) return alert('Please log in to create pins');
      setPinToEdit(null); // Clear previous edit state
      setNewPinLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
      setPinCreateModalOpen(true);
      setPopupOpen(true);
    };
    mapInstance.on('click', onClick);
    onMapInitialized?.();
    return () => {
      mapInstance.off('click', onClick);
    };
  }, [mapInstance, identity, popupOpen, onMapInitialized, setPinToEdit]);

  const publicCount = useMemo(() => pins.filter((p) => !p.isPrivate).length, [pins]);
  const privateCount = useMemo(() => pins.filter((p) => p.isPrivate && p.isOwner).length, [pins]);

  return (
    <div className="relative w-full h-full">
      {/* Pin Detail Modal for mobile */}
      <PinDetailModal
        pin={selectedPinDetail}
        isOpen={pinDetailModalOpen}
        onClose={() => {
          setPinDetailModalOpen(false);
          setPopupOpen(false);
        }}
        onViewProfile={onViewUserProfile}
        onEdit={(pin) => {
          setPinToEdit(pin);
          setPopupOpen(true);
        }}
        onDelete={(pin) => {
          setPinToDelete(pin);
          setShowDeleteModal(true);
          setPopupOpen(true);
        }}
      />
      <MapHUD
        status={status}
        userLocation={userLocation}
        showCounts={pins.length > 0}
        publicCount={publicCount}
        privateCount={privateCount}
        hasIdentity={!!identity}
        onMyLocation={() => {
          setSelectedPin(null);
          request(true);
        }}
        isRefreshing={refreshing}
        isLoadingTransition={isLoadingTransition!}
        isInitialLoading={isInitialLoading!}
      />
      <div ref={mapRef} className="w-full h-full" />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onConfirm={async () => {
          if (!pinToDelete) return;
          try {
            await deletePinMutation.mutateAsync(toNat(pinToDelete.id));
            setShowDeleteModal(false);
            setPinToDelete(null);
            setPopupOpen(false);
          } catch (error) {
            alert('Failed to delete pin.');
          }
        }}
        onCancel={() => {
          setShowDeleteModal(false);
          setPinToDelete(null);
        }}
        isDeleting={deletePinMutation.isPending}
        pinName={pinToDelete?.name || 'Unnamed Pin'}
      />

      {/* Pin Edit Modal */}
      <PinEditModal
        isOpen={!!pinToEdit}
        pin={
          pinToEdit
            ? {
                id: pinToEdit.id.toString(),
                name: pinToEdit.name,
                description: pinToEdit.description,
                musicLink: pinToEdit.musicLink,
                isPrivate: pinToEdit.isPrivate,
              }
            : null
        }
        onSubmit={handleEditSubmit}
        onCancel={() => {
          setPinToEdit(null);
          setPopupOpen(false);
        }}
        isSubmitting={updatePinMutation.isPending}
      />
      <PinCreateModal
        isOpen={pinCreateModalOpen}
        location={newPinLocation}
        onSubmit={async (...args) => {
          setJustCreatedPin(true);
          await handleCreateSubmit(...args);
          setTimeout(() => setJustCreatedPin(false), 1000); // Reset flag after 1s
        }}
        onCancel={() => {
          setPinCreateModalOpen(false);
          setPopupOpen(false);
          setNewPinLocation(null);
        }}
        isSubmitting={createPinMutation.isPending}
      />
    </div>
  );
};

export default InteractiveMap;
