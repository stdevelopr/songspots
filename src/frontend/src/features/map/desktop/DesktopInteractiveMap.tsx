import React, { useEffect, useMemo, useState } from 'react';
import { toNat } from '@common/utils/nat';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Pin, SelectedPin } from '../types/map';
import { useLocation } from '@common';
import { MapHUD } from '../MapHUD';
import { useInternetIdentity } from 'ic-use-internet-identity';
import type { Vibe as BackendVibe } from '@backend/backend.did';
import { useMap } from '../useMap';
import { PinDetails } from '../../vibes/responsive/PinDetails';
import { PinEdit } from '../../vibes/responsive/PinEdit';
import { PinCreate } from '../../vibes/responsive/PinCreate';
import { DeleteConfirmation } from '../../vibes/responsive/DeleteConfirmation';
import { useIsMobile, Loader } from '@common';
import { useVibes } from '../useVibes';
import { useMoodFilter } from '../hooks/useMoodFilter';
import { MoodFilter } from '../components/MoodFilter';
import { useVibeLayer } from '@features/vibes';
import { useToast } from '@common';
import { MoodType } from '@common/types/moods';
import mapStyles from '../interactive-map/MapContainer.module.css';

const DEFAULT_CENTER: [number, number] = [40.7128, -74.006];
const DEFAULT_ZOOM = 10;

interface DesktopInteractiveMapProps {
  onViewUserProfile: (userId: string | null) => void;
  selectedPin?: SelectedPin | null;
  onPinSelected?: (pin: SelectedPin) => void;
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

export const DesktopInteractiveMap: React.FC<DesktopInteractiveMapProps> = (props) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pinToDelete, setPinToDelete] = useState<Pin | null>(null);
  const skipNextAutoCenterRef = React.useRef(false);
  const hasAutoCenteredRef = React.useRef(false);
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
    profileMode,
    onShowLoginPrompt,
    onClearSelection,
    suppressAutoCenterOnLoad,
  } = props;

  const [newPinLocation, setNewPinLocation] = React.useState<{ lat: number; lng: number } | null>(
    null
  );
  // Flag to prevent user location centering after pin creation
  const [justCreatedPin, setJustCreatedPin] = React.useState(false);
  const { identity } = useInternetIdentity();
  const isMobile = useIsMobile();
  const currentUser = identity?.getPrincipal().toString();
  const { userLocation, status, refreshing, request } = useLocation();
  const { mapRef, mapInstance } = useMap();

  const [popupOpen, setPopupOpen] = useState(false);
  const { showToast } = useToast();
  // If deep-linking, once map is created, jump directly to pin without animation
  useEffect(() => {
    if (!mapInstance) return;
    if (suppressAutoCenterOnLoad && selectedPin) {
      mapInstance.setView([selectedPin.lat, selectedPin.lng], 16, { animate: false });
      onMapCentered?.();
      hasAutoCenteredRef.current = true;
    }
  }, [mapInstance, suppressAutoCenterOnLoad, selectedPin]);

  const {
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
  } = useVibes({
    mapInstance,
    isMobile,
    backendVibes: backendPins,
    currentUser,
    onViewUserProfile,
    onVibeSelected: onPinSelected,
    userLocation,
    selectedVibe: selectedPin,
    onMapReady,
    fromProfile,
    isLoadingTransition,
    onDeleteVibe: (vibe) => {
      setPinToDelete(vibe);
      setShowDeleteModal(true);
      setPopupOpen(true);
    },
    skipVibeLayer: !profileMode,
  });

  // Mood filtering logic (only for non-profile mode)
  const moodFilter = useMoodFilter(profileMode ? [] : pins);
  const {
    selectedMoods,
    toggleMood,
    clearAllFilters,
    showAllPins,
    filteredPins,
    hasActiveFilters,
  } = moodFilter;

  // Handle vibe layer rendering for non-profile mode with filtering support
  const vibesToRender = !profileMode ? (hasActiveFilters ? filteredPins : pins) : undefined;

  useVibeLayer({
    map: mapInstance,
    vibes: vibesToRender,
    onViewProfile: onViewUserProfile,
    onEdit: (vibe) => {
      setPinToEdit(vibe);
    },
    onDelete: (vibe) => {
      setPinToDelete(vibe);
      setShowDeleteModal(true);
      setPopupOpen(true);
    },
    onVibeClick: (vibe) => {
      if (mapInstance) {
        mapInstance.panTo([vibe.lat, vibe.lng], { animate: true });
        const handleMoveEnd = () => {
          setSelectedPinDetail(vibe);
          setPinDetailModalOpen(true);
          mapInstance.off('moveend', handleMoveEnd);
        };
        mapInstance.on('moveend', handleMoveEnd);
      } else {
        setSelectedPinDetail(vibe);
        setPinDetailModalOpen(true);
      }
      // Notify parent for URL sync
      onPinSelected?.({ id: vibe.id, lat: vibe.lat, lng: vibe.lng });
    },
    isMobile,
  });

  useEffect(() => {
    request(false);
    onLocationProcessed?.();
  }, [request, onLocationProcessed]);

  // Fit bounds to all pins for profile mode
  useEffect(() => {
    if (profileMode && mapInstance && backendPins.length > 0) {
      const bounds = L.latLngBounds(
        backendPins.map((p) => [parseFloat(p.latitude), parseFloat(p.longitude)])
      );
      mapInstance.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [profileMode, mapInstance, backendPins]);

  // Center map based on location / defaults (skip in profile mode)
  useEffect(() => {
    if (profileMode) return;
    if (!mapInstance || selectedPin) return;
    if (justCreatedPin) return; // Skip centering after pin creation
    if (skipNextAutoCenterRef.current) { skipNextAutoCenterRef.current = false; return; }
    if (suppressAutoCenterOnLoad && !hasAutoCenteredRef.current) return;
    if (hasAutoCenteredRef.current) return;
    if (status === 'granted' && userLocation) {
      mapInstance.setView([userLocation.lat, userLocation.lng], 15);
      setTimeout(() => onMapCentered?.(), 500);
      hasAutoCenteredRef.current = true;
    } else if (status === 'unavailable' || status === 'denied') {
      mapInstance.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
      onMapCentered?.();
      hasAutoCenteredRef.current = true;
    }
  }, [profileMode, mapInstance, status, userLocation, selectedPin, onMapCentered, justCreatedPin]);

  // Disable pin creation in profile mode
  useEffect(() => {
    if (profileMode) return;
    if (!mapInstance) return;
    const onClick = (e: L.LeafletMouseEvent) => {
      mapInstance.closePopup();
      if (!identity) {
        onShowLoginPrompt?.('create your first vibe spot');
        return;
      }
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
  }, [
    profileMode,
    mapInstance,
    identity,
    onMapInitialized,
    setPinToEdit,
    onShowLoginPrompt,
    setPinCreateModalOpen,
    setNewPinLocation,
    setPopupOpen,
  ]);

  if (profileMode) {
    // Profile mode: just show the map with pins, no HUD, no modals, no location, no editing
    return <div ref={mapRef} className={`${mapStyles.mapRoot} w-full h-full z-0`} />;
  }

  const publicCount = useMemo(() => pins.filter((p) => !p.isPrivate).length, [pins]);
  const privateCount = useMemo(() => pins.filter((p) => p.isPrivate && p.isOwner).length, [pins]);

  return (
    <div className={`${mapStyles.mapRoot} relative w-full h-full flex flex-col`}>
      {/* Pin Detail Interface - Responsive */}
      <PinDetails
        vibe={selectedPinDetail}
        isOpen={pinDetailModalOpen}
        onClose={() => {
          // Set guard BEFORE clearing selection to avoid immediate auto-center
          skipNextAutoCenterRef.current = true;
          setPinDetailModalOpen(false);
          setPopupOpen(false);
          if (onClearSelection) onClearSelection();
          else setSelectedPin(null);
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

      {/* Mood Filter - placed above the map */}
      {!profileMode && pins.length > 0 && (
        <MoodFilter
          selectedMoods={selectedMoods}
          onMoodToggle={toggleMood}
          onClearAll={clearAllFilters}
          onShowAll={showAllPins}
        />
      )}

      {/* Map container with HUD */}
      <div className="relative flex-1">
        <MapHUD
          status={status}
          userLocation={userLocation}
          showCounts={pins.length > 0}
          publicCount={publicCount}
          privateCount={privateCount}
          hasIdentity={!!identity}
          onMyLocation={() => {
            setSelectedPin(null);
            hasAutoCenteredRef.current = false;
            request(true);
          }}
          isRefreshing={refreshing}
          isLoadingTransition={isLoadingTransition!}
          isInitialLoading={isInitialLoading!}
        />

        <div ref={mapRef} className="w-full h-full z-0" />
      </div>

      {/* Delete Confirmation Interface - Responsive */}
      <DeleteConfirmation
        isOpen={showDeleteModal}
        onConfirm={async () => {
          if (!pinToDelete) return;
          try {
            await deletePinMutation.mutateAsync(toNat(pinToDelete.id));
            setShowDeleteModal(false);
            setPinToDelete(null);
            setPopupOpen(false);
          } catch (error) {
            console.error('Failed to delete vibe:', error);
            showToast('Failed to delete vibe. Please try again.', 'error');
          }
        }}
        onCancel={() => {
          setShowDeleteModal(false);
          setPinToDelete(null);
        }}
        isDeleting={deletePinMutation.isPending}
        pinName={pinToDelete?.name || 'Unnamed Pin'}
      />

      {/* Pin Edit Interface - Responsive */}
      <PinEdit
        isOpen={!!pinToEdit}
        vibe={
          pinToEdit
            ? {
                id: pinToEdit.id.toString(),
                name: pinToEdit.name,
                description: pinToEdit.description,
                musicLink: pinToEdit.musicLink,
                isPrivate: pinToEdit.isPrivate,
                mood: pinToEdit.mood,
              }
            : null
        }
        onSubmit={async (data) => {
          // Adapt PinEdit's data format to handleEditSubmit's expected format
          await handleEditSubmit({
            name: data.name,
            description: data.description,
            musicLink: data.musicLink,
            isPrivate: data.isPrivate,
            mood: data.mood as MoodType | undefined,
          });
        }}
        onCancel={() => {
          setPinToEdit(null);
          setPopupOpen(false);
        }}
        isSubmitting={updatePinMutation.isPending}
      />
      <PinCreate
        isOpen={pinCreateModalOpen}
        location={newPinLocation}
        onSubmit={async (data) => {
          setJustCreatedPin(true);
          // Adapt PinCreate's data format to handleCreateSubmit's expected format
          await handleCreateSubmit(
            {
              name: data.name,
              description: data.description,
              musicLink: data.musicLink,
              isPrivate: data.isPrivate,
              mood: data.mood as MoodType | undefined,
            },
            { lat: data.lat, lng: data.lng }
          );
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

export default DesktopInteractiveMap;
