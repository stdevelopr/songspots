import { useState, useEffect } from 'react';
import { useInternetIdentity } from 'ic-use-internet-identity';
import {
  useGetUserProfile,
  useGetUserProfileByPrincipal,
  useGetPinsByOwner,
} from '../../common/useQueries';

interface UseProfileStateProps {
  userId?: string | null;
}

export const useProfileState = ({ userId }: UseProfileStateProps) => {
  const { identity } = useInternetIdentity();
  const isViewingOwnProfile = !userId;

  // Profile queries
  const { data: ownProfile, isLoading: isLoadingOwnProfile } = useGetUserProfile();
  const { data: otherUserProfile, isLoading: isLoadingOtherProfile } = useGetUserProfileByPrincipal(
    userId || ''
  );

  const userProfile = isViewingOwnProfile ? ownProfile : otherUserProfile;
  const isLoading = isViewingOwnProfile ? isLoadingOwnProfile : isLoadingOtherProfile;

  // Pins query
  const { data: userPins = [], isLoading: isLoadingPins } = useGetPinsByOwner(
    userId || identity?.getPrincipal().toString() || ''
  );

  // Filter pins based on viewing context
  const visiblePins = isViewingOwnProfile ? userPins : userPins.filter((pin) => !pin.isPrivate);

  // Convert pins for map display
  const backendPinsForMap = visiblePins.map((pin) => ({
    id: pin.id,
    latitude: pin.latitude,
    longitude: pin.longitude,
    name: pin.name,
    description: pin.description,
    musicLink: pin.musicLink,
    isPrivate: pin.isPrivate,
    owner: pin.owner,
  }));

  // Form state
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [error, setError] = useState('');

  // Initialize form when profile data loads
  useEffect(() => {
    if (isViewingOwnProfile) {
      if (userProfile) {
        setName(userProfile.name);
        setBio(userProfile.bio || '');
        setIsEditing(false);
      } else {
        setName('');
        setBio('');
        setIsEditing(true); // Start in edit mode if no profile exists
      }
    } else {
      setIsEditing(false); // Never edit mode when viewing others
      if (userProfile) {
        setBio(userProfile.bio || '');
      } else {
        setBio('');
      }
    }
    setError('');
  }, [userProfile, isViewingOwnProfile]);

  // Utility functions
  const getDisplayName = () => {
    if (userProfile?.name) {
      return userProfile.name;
    }
    if (isViewingOwnProfile) {
      return 'Create Profile';
    }
    return userId ? `User ${userId.slice(0, 8)}...` : 'Unknown User';
  };

  const getUserPrincipalId = () => {
    if (userId) {
      return userId;
    }
    return identity?.getPrincipal().toString() || '';
  };

  return {
    // Profile data
    userProfile,
    isLoading,
    isLoadingPins,
    userPins,
    visiblePins,
    backendPinsForMap,
    isViewingOwnProfile,
    
    // Form state
    isEditing,
    setIsEditing,
    name,
    setName,
    bio,
    setBio,
    error,
    setError,
    
    // Utility functions
    getDisplayName,
    getUserPrincipalId,
  };
};