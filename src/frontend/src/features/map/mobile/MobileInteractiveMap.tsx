import React, { useState, useEffect, useRef, useCallback } from 'react';
import { toNat } from '@common/utils/nat';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Pin, SelectedPin } from '../types/map';
import { useLocation } from '@common';
import { useInternetIdentity } from 'ic-use-internet-identity';
import type { Vibe as BackendVibe } from '@backend/backend.did';
import { useMap } from '../useMap';
import { useIsMobile } from '@common';
import { useVibes } from '../useVibes';
import { useMoodFilter } from '../hooks/useMoodFilter';
import { useVibeLayer } from '@features/vibes';
import { useToast } from '@common';

// Mobile components
import { MobileHeader } from '../../../components/mobile/MobileHeader';
import { FilterDrawer } from './FilterDrawer';
import { MobileMapControls } from './MobileMapControls';
import { BottomSheet } from '../../../components/mobile/BottomSheet';

// Import responsive components (automatically choose mobile sheets vs desktop modals)
import { PinDetails } from '../../vibes/responsive/PinDetails';
import { PinEdit } from '../../vibes/responsive/PinEdit';
import { PinCreate } from '../../vibes/responsive/PinCreate';
import { DeleteConfirmation } from '../../vibes/responsive/DeleteConfirmation';

import mapStyles from '../interactive-map/MapContainer.module.css';

const DEFAULT_CENTER: [number, number] = [40.7128, -74.006];
const DEFAULT_ZOOM = 10;

interface MobileInteractiveMapProps {
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
}

export const MobileInteractiveMap: React.FC<MobileInteractiveMapProps> = ({
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
  profileMode = false,
  onShowLoginPrompt,
  onClearSelection,
  suppressAutoCenterOnLoad,
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pinToDelete, setPinToDelete] = useState<Pin | null>(null);
  const [newPinLocation, setNewPinLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [justCreatedPin, setJustCreatedPin] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const skipNextAutoCenterRef = useRef(false);
  const hasAutoCenteredRef = useRef(false);
  const { showToast } = useToast();

  const { identity } = useInternetIdentity();
  const isMobile = useIsMobile();
  const currentUser = identity?.getPrincipal().toString();
  const { userLocation, status, refreshing, request } = useLocation();
  const { mapRef, mapInstance } = useMap();
  // If deep-linking, once map is created, jump directly to pin without animation
  useEffect(() => {
    if (!mapInstance) return;
    if (suppressAutoCenterOnLoad && selectedPin) {
      mapInstance.setView([selectedPin.lat, selectedPin.lng], 16, { animate: false });
      onMapCentered?.();
      hasAutoCenteredRef.current = true;
    }
  }, [mapInstance, suppressAutoCenterOnLoad, selectedPin]);
  const handleCreateAtCenter = () => {
    if (!mapInstance) return;
    if (!identity) {
      onShowLoginPrompt?.('create your first vibe spot');
      return;
    }
    const c = mapInstance.getCenter();
    setPinToEdit(null);
    setNewPinLocation({ lat: c.lat, lng: c.lng });
    setPinCreateModalOpen(true);
    setPopupOpen(true);
  };

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
    skipVibeLayer: !profileMode, // Skip internal vibe layer for filtering support
  });

  // Mood filtering logic
  const moodFilter = useMoodFilter(profileMode ? [] : pins);
  const {
    selectedMoods,
    toggleMood,
    clearAllFilters,
    showAllPins,
    filteredPins,
    hasActiveFilters
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
    if (justCreatedPin) return;
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

  // Handle map clicks for pin creation (disable in profile mode)
  useEffect(() => {
    if (profileMode) return;
    if (!mapInstance) return;
    
    const onClick = (e: L.LeafletMouseEvent) => {
      mapInstance.closePopup();
      if (!identity) {
        onShowLoginPrompt?.('create your first vibe spot');
        return;
      }
      setPinToEdit(null);
      setNewPinLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
      setPinCreateModalOpen(true);
      setPopupOpen(true);
    };
    
    mapInstance.on('click', onClick);
    onMapInitialized?.();
    
    return () => {
      mapInstance.off('click', onClick);
    };
  }, [profileMode, mapInstance, identity, onMapInitialized, setPinToEdit, onShowLoginPrompt, setPinCreateModalOpen, setNewPinLocation, setPopupOpen]);

  const publicCount = pins.filter((p) => !p.isPrivate).length;
  const privateCount = pins.filter((p) => p.isPrivate && p.isOwner).length;

  if (profileMode) {
    // Profile mode: simplified mobile view
    return (
      <div className="w-full h-full">
        <div ref={mapRef} className="w-full h-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Mobile Header */}
      <MobileHeader
        title="Vibes Map"
        showPinCount={pins.length > 0}
        pinCount={pins.length}
        rightAction={
          identity ? {
            icon: (
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {identity.getPrincipal().toString().slice(0, 2).toUpperCase()}
                </span>
              </div>
            ),
            onClick: () => onViewUserProfile(null),
            label: 'User Profile'
          } : {
            icon: (
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            ),
            onClick: () => {
              onShowLoginPrompt?.('access your vibes');
            },
            label: 'Sign In'
          }
        }
      />

      {/* Map Container */}
      <div className="flex-1 relative">
        <div ref={mapRef} className="w-full h-full" />
        
        {/* Mobile Map Controls */}
        <MobileMapControls
          status={status}
          userLocation={userLocation}
          onMyLocation={() => {
            setSelectedPin(null);
            hasAutoCenteredRef.current = false;
            request(true);
          }}
          onCreate={handleCreateAtCenter}
          isRefreshing={refreshing}
          showCounts={pins.length > 0}
          publicCount={publicCount}
          privateCount={privateCount}
          hasIdentity={!!identity}
          isLoadingTransition={isLoadingTransition}
          isInitialLoading={isInitialLoading}
        />

        {/* Filter Drawer */}
        {pins.length > 0 && (
          <FilterDrawer
            selectedMoods={selectedMoods}
            onMoodToggle={toggleMood}
            onClearAll={clearAllFilters}
            onShowAll={showAllPins}
          />
        )}
      </div>

      {/* Responsive Pin Interactions - Mobile uses bottom sheets, desktop uses modals */}
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
        onSubmit={handleEditSubmit}
        onCancel={() => {
          setPinToEdit(null);
          setPopupOpen(false);
        }}
        isSubmitting={updatePinMutation.isPending}
      />

      <PinCreate
        isOpen={pinCreateModalOpen}
        location={newPinLocation}
        onSubmit={async (...args) => {
          setJustCreatedPin(true);
          await handleCreateSubmit(...args);
          setTimeout(() => setJustCreatedPin(false), 1000);
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

export default MobileInteractiveMap;
