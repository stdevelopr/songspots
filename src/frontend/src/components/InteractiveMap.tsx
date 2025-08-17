import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import MusicLinkModal from './MusicLinkModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import PinEditModal from './PinEditModal';
import { useGetAllPins, useCreatePin, useGetUserProfileByPrincipal, useDeletePin, useUpdatePin } from '../hooks/useQueries';
import { useInternetIdentity } from 'ic-use-internet-identity';
import { Principal } from '@dfinity/principal';

interface Pin {
  id: string;
  lat: number;
  lng: number;
  timestamp: number;
  name?: string;
  description?: string;
  musicLink?: string;
  isPrivate?: boolean;
  isOwner?: boolean;
  owner: Principal;
}

interface UserLocation {
  lat: number;
  lng: number;
  accuracy: number;
}

interface PendingPin {
  lat: number;
  lng: number;
}

interface SelectedPin {
  lat: number;
  lng: number;
  id: string;
}

interface InteractiveMapProps {
  onViewUserProfile: (userId: string) => void;
  selectedPin?: SelectedPin | null;
  onPinSelected?: () => void;
  onMapReady?: () => void; // Callback for when map is ready
  onMapInitialized?: () => void; // Callback for when map is initialized
  onLocationProcessed?: () => void; // Callback for when location is processed
  onMapCentered?: () => void; // Callback for when map is centered
  isLoadingTransition?: boolean; // Prop to indicate loading state
  isInitialLoading?: boolean; // Prop to indicate initial loading state
}

declare global {
  interface Window {
    L: any;
  }
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ 
  onViewUserProfile, 
  selectedPin, 
  onPinSelected, 
  onMapReady,
  onMapInitialized,
  onLocationProcessed,
  onMapCentered,
  isLoadingTransition = false,
  isInitialLoading = false
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const userLocationMarkerRef = useRef<any>(null);
  const pinMarkersRef = useRef<any[]>([]);
  const [pins, setPins] = useState<Pin[]>([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationStatus, setLocationStatus] = useState<'requesting' | 'granted' | 'denied' | 'unavailable'>('requesting');
  const [isLocationRequestComplete, setIsLocationRequestComplete] = useState(false);
  const [isMapCenteredState, setIsMapCenteredState] = useState(false);
  const [showMusicModal, setShowMusicModal] = useState(false);
  const [pendingPin, setPendingPin] = useState<PendingPin | null>(null);
  const [isRefreshingLocation, setIsRefreshingLocation] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pinToDelete, setPinToDelete] = useState<Pin | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [pinToEdit, setPinToEdit] = useState<Pin | null>(null);
  const [isPinCentering, setIsPinCentering] = useState(false); // New state to track pin centering

  // Backend queries
  const { data: backendPins = [], isLoading: isLoadingPins, refetch: refetchPins } = useGetAllPins();
  const createPinMutation = useCreatePin();
  const deletePinMutation = useDeletePin();
  const updatePinMutation = useUpdatePin();
  const { identity } = useInternetIdentity();

  // Convert backend pins to frontend format
  useEffect(() => {
    const currentUserPrincipal = identity?.getPrincipal().toString();
    
    const convertedPins: Pin[] = backendPins.map(pin => ({
      id: pin.id.toString(),
      lat: parseFloat(pin.latitude),
      lng: parseFloat(pin.longitude),
      timestamp: Date.now(), // We don't have timestamp from backend, use current time
      name: pin.name || undefined,
      description: pin.description || undefined,
      musicLink: undefined, // Music links are not stored in backend
      isPrivate: pin.isPrivate,
      isOwner: currentUserPrincipal ? pin.owner.toString() === currentUserPrincipal : false,
      owner: pin.owner
    }));
    setPins(convertedPins);
  }, [backendPins, identity]);

  // Simplified selected pin centering - no highlighting
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedPin || !isMapLoaded || isLoadingTransition) return;

    // Find the pin that matches the selected pin ID
    const targetPin = pins.find(pin => pin.id === selectedPin.id);
    if (!targetPin) {
      console.warn('Selected pin not found in pins array:', selectedPin.id);
      // Still call onMapReady to hide loading indicator
      if (onMapReady) {
        onMapReady();
      }
      return;
    }

    // Set pin centering flag to prevent location-based recentering
    setIsPinCentering(true);

    // Center map on selected pin using the actual pin coordinates
    mapInstanceRef.current.setView([targetPin.lat, targetPin.lng], 16);

    // Handle the map centering completion
    const handleMoveEnd = () => {
      mapInstanceRef.current.off('moveend', handleMoveEnd);
      
      // Immediately hide loading indicator and show UI elements
      if (onMapReady) {
        onMapReady();
      }
      
      // Clear selection after centering
      if (onPinSelected) {
        onPinSelected();
      }

      // Keep pin centering flag active to prevent location recentering
      // This will be cleared only when user manually interacts with location
    };

    mapInstanceRef.current.on('moveend', handleMoveEnd);
  }, [selectedPin, isMapLoaded, onPinSelected, pins, onMapReady, isLoadingTransition]);

  // Timeout for loading transitions
  useEffect(() => {
    if (isLoadingTransition && selectedPin) {
      const timeout = setTimeout(() => {
        console.warn('Map readiness timeout reached, forcing completion');
        if (onMapReady) {
          onMapReady();
        }
      }, 10000); // 10 second timeout

      return () => clearTimeout(timeout);
    }
  }, [isLoadingTransition, selectedPin, onMapReady]);

  // Request user's current location - this function handles both initial and refresh requests
  const requestLocation = (isRefresh = false) => {
    if (!navigator.geolocation) {
      setLocationStatus('unavailable');
      setIsLocationRequestComplete(true);
      setIsMapCenteredState(true); // Consider it "centered" since we can't get location
      if (onLocationProcessed && !isRefresh) {
        onLocationProcessed();
      }
      if (onMapCentered && !isRefresh) {
        onMapCentered();
      }
      return;
    }

    if (isRefresh) {
      setIsRefreshingLocation(true);
      // Clear pin centering flag when user manually requests location
      setIsPinCentering(false);
    } else {
      setLocationStatus('requesting');
      setIsLocationRequestComplete(false);
      setIsMapCenteredState(false);
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 15000, // 15 seconds timeout
      maximumAge: 0 // Force fresh location data
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: UserLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        setUserLocation(location);
        setLocationStatus('granted');
        setIsRefreshingLocation(false);
        setIsLocationRequestComplete(true);

        // If this is a refresh and map is loaded, center the map immediately
        if (isRefresh && mapInstanceRef.current) {
          mapInstanceRef.current.setView([location.lat, location.lng], 15);
          setIsMapCenteredState(true);
          // Ensure pins are re-rendered after location change
          setTimeout(() => {
            // Force a re-render of pins by triggering the effect
            if (pins.length > 0) {
              setPins([...pins]);
            }
          }, 100);
        }

        // Call callbacks for initial load
        if (!isRefresh) {
          if (onLocationProcessed) {
            onLocationProcessed();
          }
          // Don't call onMapCentered here yet - wait for the map centering effect
        }
      },
      (error) => {
        console.warn('Geolocation error:', error);
        setLocationStatus('denied');
        setIsRefreshingLocation(false);
        setIsLocationRequestComplete(true);
        setIsMapCenteredState(true); // Consider it "centered" since location was denied
        
        // Call callbacks even on error for initial load
        if (!isRefresh) {
          if (onLocationProcessed) {
            onLocationProcessed();
          }
          if (onMapCentered) {
            onMapCentered();
          }
        }
      },
      options
    );
  };

  // Automatically request location on component mount (every page load/reload)
  useEffect(() => {
    // Reset all location-related states on every mount to ensure fresh request
    setUserLocation(null);
    setLocationStatus('requesting');
    setIsLocationRequestComplete(false);
    setIsMapCenteredState(false);
    setIsPinCentering(false); // Reset pin centering flag
    
    // Request location immediately on every mount
    requestLocation(false);
  }, []); // Empty dependency array ensures this runs on every mount

  const handleMyLocationClick = () => {
    requestLocation(true);
  };

  useEffect(() => {
    setIsMapLoaded(true);
    return () => {
      // Cleanup
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (!isMapLoaded || !mapRef.current || mapInstanceRef.current) return;

    // Determine initial map center and zoom
    let initialCenter: [number, number] = [40.7128, -74.0060]; // Default to NYC
    let initialZoom = 10;

    // If we have a selected pin and are in loading transition, start with that location
    if (selectedPin && isLoadingTransition) {
      const targetPin = pins.find(pin => pin.id === selectedPin.id);
      if (targetPin) {
        initialCenter = [targetPin.lat, targetPin.lng];
        initialZoom = 16;
      }
    }
    // For initial loading, always start with default location and let location request handle centering
    // This ensures consistent behavior regardless of location permission status

    // Initialize map
    const map = L.map(mapRef.current!).setView(initialCenter, initialZoom);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Add click event listener for regular pins (only if authenticated)
    map.on('click', (e: any) => {
      if (!identity) {
        alert('Please log in to create pins');
        return;
      }
      
      // Always reset both states first to ensure clean initialization
      setShowMusicModal(false);
      setPendingPin(null);
      
      // Use setTimeout to ensure state updates are processed before setting new values
      setTimeout(() => {
        // Set new pending pin location
        setPendingPin({
          lat: e.latlng.lat,
          lng: e.latlng.lng
        });
        
        // Show the modal
        setShowMusicModal(true);
      }, 0);
    });

    mapInstanceRef.current = map;

    // Call onMapInitialized to indicate the map is ready
    if (onMapInitialized) {
      onMapInitialized();
    }

    // If we're not waiting for location or selected pin, mark as centered
    if (!isLocationRequestComplete && locationStatus === 'unavailable') {
      setIsMapCenteredState(true);
      if (onMapCentered) {
        onMapCentered();
      }
    }

  }, [isMapLoaded, identity, selectedPin, isLoadingTransition, pins, onMapInitialized, isLocationRequestComplete, locationStatus, onMapCentered]);

  // Handle map centering when location is obtained - MODIFIED to respect pin centering
  useEffect(() => {
    if (!mapInstanceRef.current || !userLocation || !isLocationRequestComplete || locationStatus !== 'granted') return;

    // Only center the map if we're not in a loading transition for a selected pin AND not currently centering on a pin
    if ((!isLoadingTransition || !selectedPin) && !isPinCentering) {
      // Center the map on user location
      mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 15);
      
      // Mark as centered after a short delay to ensure the view change is complete
      setTimeout(() => {
        setIsMapCenteredState(true);
        if (onMapCentered) {
          onMapCentered();
        }
      }, 500); // Give the map time to animate to the new position
    } else if (!isLoadingTransition && !selectedPin) {
      // If we're not transitioning and no selected pin, still mark as centered for initial load
      setIsMapCenteredState(true);
      if (onMapCentered) {
        onMapCentered();
      }
    }
  }, [userLocation, isLocationRequestComplete, locationStatus, isLoadingTransition, selectedPin, onMapCentered, isPinCentering]);

  // Handle the case where location is denied or unavailable - mark as centered immediately
  useEffect(() => {
    if (isLocationRequestComplete && (locationStatus === 'denied' || locationStatus === 'unavailable')) {
      setIsMapCenteredState(true);
      if (onMapCentered) {
        onMapCentered();
      }
    }
  }, [isLocationRequestComplete, locationStatus, onMapCentered]);

  // Update user location marker when userLocation changes
  useEffect(() => {
    if (!mapInstanceRef.current || !window.L || !userLocation) return;

    // Remove existing user location marker
    if (userLocationMarkerRef.current) {
      mapInstanceRef.current.removeLayer(userLocationMarkerRef.current);
    }

    // Add user location marker
    const userLocationIcon = window.L.divIcon({
      className: 'user-location-marker',
      html: `
        <div class="user-location-pin">
          <div class="user-location-pulse"></div>
          <div class="user-location-dot"></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      popupAnchor: [0, -12],
    });

    const userMarker = window.L.marker([userLocation.lat, userLocation.lng], { icon: userLocationIcon })
      .addTo(mapInstanceRef.current)
      .bindPopup(`
        <div class="user-location-popup">
          <strong>📍 You are here</strong><br>
          Lat: ${userLocation.lat.toFixed(6)}<br>
          Lng: ${userLocation.lng.toFixed(6)}<br>
          <small>Accuracy: ±${Math.round(userLocation.accuracy)}m</small>
        </div>
      `);

    userLocationMarkerRef.current = userMarker;
  }, [userLocation]);

  // Add existing pins to map when pins state changes
  useEffect(() => {
    if (!mapInstanceRef.current || !window.L) return;

    // Clear existing pin markers (keep user location marker)
    pinMarkersRef.current.forEach(marker => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(marker);
      }
    });
    pinMarkersRef.current = [];

    // Custom pin icon for public pins
    const pinIcon = window.L.divIcon({
      className: 'custom-pin',
      html: `
        <div class="pin-marker">
          <div class="pin-head"></div>
          <div class="pin-point"></div>
        </div>
      `,
      iconSize: [24, 32],
      iconAnchor: [12, 32],
      popupAnchor: [0, -32],
    });

    // Custom pin icon for public pins with music
    const musicPinIcon = window.L.divIcon({
      className: 'custom-pin',
      html: `
        <div class="pin-marker music-pin">
          <div class="pin-head music-pin-head">
            <div class="music-note">♪</div>
          </div>
          <div class="pin-point"></div>
        </div>
      `,
      iconSize: [24, 32],
      iconAnchor: [12, 32],
      popupAnchor: [0, -32],
    });

    // Custom pin icon for private pins
    const privatePinIcon = window.L.divIcon({
      className: 'custom-pin',
      html: `
        <div class="pin-marker private-pin">
          <div class="pin-head private-pin-head">
            <div class="lock-icon">🔒</div>
          </div>
          <div class="pin-point"></div>
        </div>
      `,
      iconSize: [24, 32],
      iconAnchor: [12, 32],
      popupAnchor: [0, -32],
    });

    // Custom pin icon for private pins with music
    const privateMusicPinIcon = window.L.divIcon({
      className: 'custom-pin',
      html: `
        <div class="pin-marker private-pin music-pin">
          <div class="pin-head private-pin-head music-pin-head">
            <div class="music-note">♪</div>
            <div class="lock-icon-small">🔒</div>
          </div>
          <div class="pin-point"></div>
        </div>
      `,
      iconSize: [24, 32],
      iconAnchor: [12, 32],
      popupAnchor: [0, -32],
    });

    // Set up global functions for popup interactions
    (window as any).viewUserProfile = (userId: string) => {
      onViewUserProfile(userId);
    };

    (window as any).deletePin = (pinId: string) => {
      const pinToDelete = pins.find(p => p.id === pinId);
      if (pinToDelete) {
        setPinToDelete(pinToDelete);
        setShowDeleteModal(true);
      }
    };

    (window as any).editPin = (pinId: string) => {
      const pinToEdit = pins.find(p => p.id === pinId);
      if (pinToEdit) {
        setPinToEdit(pinToEdit);
        setShowEditModal(true);
      }
    };

    // Add all pins to map
    pins.forEach(pin => {
      let icon;
      if (pin.isPrivate) {
        icon = pin.musicLink ? privateMusicPinIcon : privatePinIcon;
      } else {
        icon = pin.musicLink ? musicPinIcon : pinIcon;
      }

      const marker = window.L.marker([pin.lat, pin.lng], { icon })
        .addTo(mapInstanceRef.current);

      // Create popup content with improved styling
      let popupContent = `
        <div class="enhanced-pin-popup">
          <div class="popup-header">
            <div class="pin-title-section">
              <h3 class="pin-title">${pin.name || 'Unnamed Pin'}</h3>
              ${pin.isPrivate && pin.isOwner ? `
                <div class="privacy-badge private">
                  <svg class="privacy-icon" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                  </svg>
                  <span>Private</span>
                </div>
              ` : !pin.isPrivate ? `
                <div class="privacy-badge public">
                  <svg class="privacy-icon" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clip-rule="evenodd" />
                  </svg>
                  <span>Public</span>
                </div>
              ` : ''}
            </div>
          </div>
      `;

      if (pin.description) {
        popupContent += `
          <div class="pin-description">
            <p>${pin.description}</p>
          </div>
        `;
      }

      // Add owner information
      popupContent += `
        <div class="pin-metadata">
          <div class="owner-info">
            <svg class="metadata-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
            </svg>
            <span class="metadata-label">Created by:</span>
            <button class="owner-link" onclick="window.viewUserProfile('${pin.owner.toString()}')">View Profile</button>
          </div>
        </div>
      `;

      // Add action buttons section
      popupContent += `<div class="popup-actions">`;

      // Music link button
      if (pin.musicLink) {
        const linkText = pin.musicLink.includes('youtube.com') || pin.musicLink.includes('youtu.be') 
          ? 'Open YouTube' 
          : pin.musicLink.includes('spotify.com') 
          ? 'Open Spotify' 
          : 'Open Music Link';
        
        popupContent += `
          <a href="${pin.musicLink}" target="_blank" rel="noopener noreferrer" class="action-button music-button">
            <svg class="button-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" clip-rule="evenodd" />
            </svg>
            ${linkText}
          </a>
        `;
      }

      // Edit and delete buttons for owned pins
      if (pin.isOwner && identity) {
        popupContent += `
          <button class="action-button edit-button" onclick="window.editPin('${pin.id}')">
            <svg class="button-icon" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            Edit Pin
          </button>
          <button class="action-button delete-button" onclick="window.deletePin('${pin.id}')">
            <svg class="button-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clip-rule="evenodd" />
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414L7.586 12l-1.293 1.293a1 1 0 101.414 1.414L9 13.414l2.293 2.293a1 1 0 001.414-1.414L11.414 12l1.293-1.293z" clip-rule="evenodd" />
            </svg>
            Delete Pin
          </button>
        `;
      }

      popupContent += `
        </div>
        <div class="popup-footer">
          <span class="timestamp">Added: ${new Date(pin.timestamp).toLocaleString()}</span>
        </div>
      </div>
      `;

      // Bind popup to marker
      marker.bindPopup(popupContent, {
        closeButton: true,
        autoClose: true,
        closeOnEscapeKey: true,
        closeOnClick: false,
        maxWidth: 320,
        className: 'enhanced-popup'
      });

      // Add marker to our tracking array
      pinMarkersRef.current.push(marker);
    });
  }, [pins, onViewUserProfile, identity]);

  // Helper function to completely reset modal state
  const resetModalState = () => {
    setShowMusicModal(false);
    setPendingPin(null);
  };

  const handlePinSubmit = async (pinData: { name: string; description: string; musicLink: string; isPrivate: boolean }) => {
    if (!pendingPin || !identity) {
      resetModalState();
      return;
    }

    try {
      // Save to backend
      await createPinMutation.mutateAsync({
        name: pinData.name || '',
        description: pinData.description || '',
        latitude: pendingPin.lat.toString(),
        longitude: pendingPin.lng.toString(),
        isPrivate: pinData.isPrivate
      });

      // Refetch pins from backend to get the updated list
      await refetchPins();

      // Also add to local state for immediate UI update (including music link which is not stored in backend)
      const newPin: Pin = {
        id: `pin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        lat: pendingPin.lat,
        lng: pendingPin.lng,
        timestamp: Date.now(),
        name: pinData.name || undefined,
        description: pinData.description || undefined,
        musicLink: pinData.musicLink || undefined,
        isPrivate: pinData.isPrivate,
        isOwner: true,
        owner: identity.getPrincipal()
      };

      // Update local state to include music link
      setPins(prevPins => {
        // Remove any temporary pin and add the new one with music link
        const filteredPins = prevPins.filter(p => p.id !== newPin.id);
        return [...filteredPins, newPin];
      });

      // Reset modal state after successful submission
      resetModalState();
    } catch (error) {
      console.error('Failed to create pin:', error);
      alert('Failed to create pin. Please try again.');
      // Reset modal state even on error to allow retry
      resetModalState();
    }
  };

  const handlePinCancel = () => {
    // Always reset modal state when canceling
    resetModalState();
  };

  const handleEditSubmit = async (pinData: { name: string; description: string; musicLink: string; isPrivate: boolean }) => {
    if (!pinToEdit) return;

    try {
      await updatePinMutation.mutateAsync({
        id: BigInt(pinToEdit.id),
        name: pinData.name || '',
        description: pinData.description || '',
        latitude: pinToEdit.lat.toString(),
        longitude: pinToEdit.lng.toString(),
        isPrivate: pinData.isPrivate
      });

      // Update local state immediately
      setPins(prevPins => prevPins.map(pin => 
        pin.id === pinToEdit.id 
          ? { 
              ...pin, 
              name: pinData.name || undefined,
              description: pinData.description || undefined,
              musicLink: pinData.musicLink || undefined,
              isPrivate: pinData.isPrivate
            }
          : pin
      ));

      // Refetch to ensure consistency
      await refetchPins();

      setShowEditModal(false);
      setPinToEdit(null);
    } catch (error) {
      console.error('Failed to update pin:', error);
      alert('Failed to update pin. Please try again.');
    }
  };

  const handleEditCancel = () => {
    setShowEditModal(false);
    setPinToEdit(null);
  };

  const handleDeleteConfirm = async () => {
    if (!pinToDelete) return;

    try {
      await deletePinMutation.mutateAsync(BigInt(pinToDelete.id));
      
      // Remove from local state immediately
      setPins(prevPins => prevPins.filter(p => p.id !== pinToDelete.id));
      
      // Refetch to ensure consistency
      await refetchPins();
      
      setShowDeleteModal(false);
      setPinToDelete(null);
    } catch (error) {
      console.error('Failed to delete pin:', error);
      alert('Failed to delete pin. Please try again.');
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setPinToDelete(null);
  };

  // Effect to ensure modal state is always clean when component unmounts or identity changes
  useEffect(() => {
    return () => {
      resetModalState();
    };
  }, []);

  // Reset modal state when identity changes
  useEffect(() => {
    resetModalState();
  }, [identity]);

  const getLocationStatusMessage = () => {
    switch (locationStatus) {
      case 'requesting':
        return 'Requesting your location...';
      case 'granted':
        return userLocation ? 'Location found! Map centered on your position.' : '';
      case 'denied':
        return 'Location access denied. Using default map view.';
      case 'unavailable':
        return 'Geolocation not supported. Using default map view.';
      default:
        return '';
    }
  };

  const publicPinsCount = pins.filter(pin => !pin.isPrivate).length;
  const privatePinsCount = pins.filter(pin => pin.isPrivate && pin.isOwner).length;

  return (
    <div className="relative w-full h-full">
      {/* My Location Button */}
      {!isLoadingTransition && !isInitialLoading && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1001]">
          <button
            onClick={handleMyLocationClick}
            disabled={isRefreshingLocation || locationStatus === 'unavailable'}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-lg shadow-lg font-medium text-sm transition-all duration-200
              ${isRefreshingLocation 
                ? 'bg-blue-100 text-blue-600 cursor-not-allowed' 
                : locationStatus === 'unavailable'
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-xl active:scale-95'
              }
            `}
          >
            {isRefreshingLocation ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>Finding Location...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>My Location</span>
              </>
            )}
          </button>
        </div>
      )}

      <div ref={mapRef} className="w-full h-full" />
      
      {/* Location status indicator */}
      {locationStatus === 'requesting' && !isLoadingTransition && !isInitialLoading && (
        <div className="absolute top-20 left-4 bg-blue-50 border border-blue-200 rounded-lg shadow-lg px-4 py-2 z-[1000]">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-blue-700">
              {getLocationStatusMessage()}
            </span>
          </div>
        </div>
      )}

      {/* Location status message for denied/unavailable */}
      {(locationStatus === 'denied' || locationStatus === 'unavailable') && !isLoadingTransition && !isInitialLoading && (
        <div className="absolute top-20 left-4 bg-yellow-50 border border-yellow-200 rounded-lg shadow-lg px-4 py-2 z-[1000]">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 text-yellow-600">⚠️</div>
            <span className="text-sm text-yellow-700">
              {getLocationStatusMessage()}
            </span>
          </div>
        </div>
      )}

      {/* Pin counter */}
      {pins.length > 0 && !isLoadingTransition && !isInitialLoading && (
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg px-4 py-2 z-[1000]">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">
                {publicPinsCount} public pin{publicPinsCount !== 1 ? 's' : ''}
              </span>
            </div>
            {identity && privatePinsCount > 0 && (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">
                  {privatePinsCount} private pin{privatePinsCount !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* User location indicator */}
      {userLocation && locationStatus === 'granted' && !isLoadingTransition && !isInitialLoading && (
        <div className="absolute bottom-20 right-4 bg-blue-50 border border-blue-200 rounded-lg shadow-lg px-4 py-2 z-[1000]">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-blue-700">
              Your location
            </span>
          </div>
        </div>
      )}

      {/* Authentication prompt for non-authenticated users */}
      {!identity && !isLoadingTransition && !isInitialLoading && (
        <div className="absolute bottom-20 left-4 bg-yellow-50 border border-yellow-200 rounded-lg shadow-lg px-4 py-2 z-[1000]">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 text-yellow-600">ℹ️</div>
            <span className="text-sm text-yellow-700">
              Log in to create pins and see your private pins
            </span>
          </div>
        </div>
      )}

      {/* Pin Creation Modal */}
      <MusicLinkModal
        isOpen={showMusicModal}
        onSubmit={handlePinSubmit}
        onCancel={handlePinCancel}
        isSubmitting={createPinMutation.isPending}
      />

      {/* Pin Edit Modal */}
      <PinEditModal
        isOpen={showEditModal}
        pin={pinToEdit}
        onSubmit={handleEditSubmit}
        onCancel={handleEditCancel}
        isSubmitting={updatePinMutation.isPending}
      />

      {/* Pin Deletion Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isDeleting={deletePinMutation.isPending}
        pinName={pinToDelete?.name || 'Unnamed Pin'}
      />
    </div>
  );
};

export default InteractiveMap;
