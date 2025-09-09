import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useVibeLayer } from '@features/vibes';
import { Vibe, SelectedVibe } from './types/map';
import type { Vibe as BackendVibe } from '@backend/backend.did';
import { IOnViewUserProfile } from './interactive-map/interactiveMapTypes';
import { useCreateVibe, useDeleteVibe, useUpdateVibe } from '@common';
import { toNat } from '@common/utils/nat';
import { MoodType } from '@common/types/moods';
import markerStyles from '@common/components/MarkerIcons.module.css';

export const useVibes = ({
  mapInstance,
  isMobile,
  backendVibes,
  currentUser,
  onViewUserProfile,
  onVibeSelected,
  userLocation,
  selectedVibe,
  onMapReady,
  fromProfile,
  isLoadingTransition,
  onDeleteVibe,
}: {
  mapInstance: L.Map | null;
  isMobile: boolean;
  backendVibes: BackendVibe[];
  currentUser: string | undefined;
  onViewUserProfile: IOnViewUserProfile;
  onVibeSelected: ((vibe: Vibe) => void) | undefined;
  userLocation: { lat: number; lng: number } | null;
  selectedVibe: SelectedVibe | null | undefined;
  onMapReady: (() => void) | undefined;
  fromProfile: boolean | undefined;
  isLoadingTransition: boolean | undefined;
  onDeleteVibe: (vibe: Vibe) => void;
}) => {
  const [vibes, setVibes] = useState<Vibe[]>([]);
  const [vibeToEdit, setVibeToEdit] = useState<any | null>(null);
  const [selectedVibeDetail, setSelectedVibeDetail] = useState<Vibe | null>(null);
  const [vibeDetailModalOpen, setVibeDetailModalOpen] = useState(false);
  const [vibeCreateModalOpen, setVibeCreateModalOpen] = useState(false);

  const createVibeMutation = useCreateVibe();
  const deleteVibeMutation = useDeleteVibe();
  const updateVibeMutation = useUpdateVibe();

  useVibeLayer({
    isMobile,
    map: mapInstance,
    vibes,
    onViewProfile: onViewUserProfile,
    onEdit: (vibe) => {
      setVibeToEdit(vibe);
    },
    onDelete: (vibe) => {
      if (onDeleteVibe) {
        onDeleteVibe(vibe);
      }
    },
    onVibeClick: (vibe) => {
      // Always show fullscreen modal for both mobile and desktop
      if (mapInstance) {
        mapInstance.panTo([vibe.lat, vibe.lng], { animate: true });
        const handleMoveEnd = () => {
          setSelectedVibeDetail(vibe);
          setVibeDetailModalOpen(true);

          mapInstance.off('moveend', handleMoveEnd);
        };
        mapInstance.on('moveend', handleMoveEnd);
      } else {
        setSelectedVibeDetail(vibe);
        setVibeDetailModalOpen(true);
      }
    },
  });

  // Leaflet user location marker
  const userMarkerRef = useRef<L.Marker | null>(null);
  useEffect(() => {
    if (!mapInstance || !userLocation) return;
    if (userMarkerRef.current) mapInstance.removeLayer(userMarkerRef.current);
    const icon = L.divIcon({
      className: markerStyles.userLocationMarker,
      html: `<div class="${markerStyles.userLocationPin}"><div class="${markerStyles.userLocationPulse}"></div><div class="${markerStyles.userLocationDot}"></div></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
    userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon }).addTo(
      mapInstance
    );
  }, [mapInstance, userLocation]);

  console.log('backendVibes:', backendVibes);
  useEffect(() => {
    if (!backendVibes?.length) return;
    setVibes(
      backendVibes.map((v) => {
        const vibeId = v.id.toString();
        const vibeObj = {
          id: vibeId,
          lat: parseFloat(v.latitude),
          lng: parseFloat(v.longitude),
          timestamp: Date.now(),
          name: v.name || undefined,
          description: v.description || undefined,
          musicLink: v.musicLink || undefined,
          isPrivate: v.isPrivate,
          isOwner: currentUser ? v.owner.toString() === currentUser : false,
          owner: v.owner,
          mood: v.mood?.[0] as MoodType | undefined, // Backend stores mood as opt text (optional)
        };
        return vibeObj;
      })
    );
  }, [backendVibes, currentUser]);

  // Selected vibe centering
  useEffect(() => {
    if (!mapInstance || !selectedVibe) return;
    const target = vibes.find((v) => v.id === selectedVibe.id);
    if (!target) {
      onMapReady?.();
      return;
    }

    if (fromProfile) {
      // Instantly center and open fullscreen modal when coming from profile
      mapInstance.setView([target.lat, target.lng], 16, { animate: false });
      setSelectedVibeDetail(target);
      setVibeDetailModalOpen(true);
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

    // Handler to open fullscreen modal after moveend
    const handleMoveEnd = () => {
      setSelectedVibeDetail(target);
      setVibeDetailModalOpen(true);
      mapInstance.off('moveend', handleMoveEnd);
    };
    mapInstance.on('moveend', handleMoveEnd);

    // Cleanup in case effect re-runs before moveend
    return () => {
      mapInstance.off('moveend', handleMoveEnd);
    };
  }, [mapInstance, selectedVibe, isLoadingTransition, vibes, onMapReady, onVibeSelected]);

  const handleEditSubmit = async (vibeData: {
    name: string;
    description: string;
    musicLink: string;
    isPrivate: boolean;
    mood?: MoodType;
  }) => {
    if (!vibeToEdit) return;
    try {
      await updateVibeMutation.mutateAsync({
        id: toNat(vibeToEdit.id), // nat (bigint)
        name: vibeData.name ?? '', // text
        description: vibeData.description ?? '', // text
        musicLink: vibeData.musicLink ?? '', // text
        latitude: String(vibeToEdit.lat), // text
        longitude: String(vibeToEdit.lng), // text
        isPrivate: !!vibeData.isPrivate, // bool
        mood: vibeData.mood ? [vibeData.mood] : [], // Backend expects ?Text (optional array)
      });

      // Update selectedVibeDetail so popup refreshes
      setSelectedVibeDetail((prev) =>
        prev && prev.id === vibeToEdit.id
          ? {
              ...prev,
              name: vibeData.name,
              description: vibeData.description,
              musicLink: vibeData.musicLink,
              isPrivate: vibeData.isPrivate,
              mood: vibeData.mood,
            }
          : prev
      );
      setVibeToEdit(null);
    } catch (error) {
      console.error('Failed to update vibe:', error);
      alert('Failed to update vibe. Please try again.');
    }
  };

  const handleCreateSubmit = async (
    vibeData: {
      name: string;
      description: string;
      musicLink: string;
      isPrivate: boolean;
      mood?: MoodType;
    },
    location?: { lat: number; lng: number } | null
  ) => {
    try {
      if (!location) {
        // If no location is provided, do not fly the map
        await createVibeMutation.mutateAsync({
          name: vibeData.name ?? '',
          description: vibeData.description ?? '',
          musicLink: vibeData.musicLink ?? '',
          latitude: '',
          longitude: '',
          isPrivate: !!vibeData.isPrivate,
          mood: vibeData.mood ? [vibeData.mood] : [], // Backend expects ?Text (optional array)
        });

        setVibeCreateModalOpen(false);
        setVibeToEdit(null);
        return;
      }
      // Always use the modal's location for the vibe
      const lat = location.lat;
      const lng = location.lng;
      await createVibeMutation.mutateAsync({
        name: vibeData.name ?? '',
        description: vibeData.description ?? '',
        musicLink: vibeData.musicLink ?? '',
        latitude: String(lat),
        longitude: String(lng),
        isPrivate: !!vibeData.isPrivate,
        mood: vibeData.mood ? [vibeData.mood] : [], // Backend expects ?Text (optional array)
      });

      setVibeCreateModalOpen(false);
      setVibeToEdit(null); // Clear edit state after creating
      // Fly to the new vibe location using the coordinates from the modal, not from state
      if (mapInstance) {
        setTimeout(() => {
          mapInstance.flyTo([lat, lng], 16, { animate: true });
        }, 300); // Delay to ensure map doesn't fly to old vibe
      }
    } catch (error) {
      console.error('Failed to create vibe:', error);
      alert('Failed to create vibe. Please try again.');
    }
  };

  return {
    vibes,
    vibeToEdit,
    setVibeToEdit,
    selectedVibeDetail,
    setSelectedVibeDetail,
    vibeDetailModalOpen,
    setVibeDetailModalOpen,
    vibeCreateModalOpen,
    setVibeCreateModalOpen,
    handleEditSubmit,
    handleCreateSubmit,
    updateVibeMutation,
    createVibeMutation,
    deleteVibeMutation,
    // Legacy aliases for backward compatibility
    pins: vibes,
    pinToEdit: vibeToEdit,
    setPinToEdit: setVibeToEdit,
    selectedPinDetail: selectedVibeDetail,
    setSelectedPinDetail: setSelectedVibeDetail,
    pinDetailModalOpen: vibeDetailModalOpen,
    setPinDetailModalOpen: setVibeDetailModalOpen,
    pinCreateModalOpen: vibeCreateModalOpen,
    setPinCreateModalOpen: setVibeCreateModalOpen,
    updatePinMutation: updateVibeMutation,
    createPinMutation: createVibeMutation,
    deletePinMutation: deleteVibeMutation,
  };
};
