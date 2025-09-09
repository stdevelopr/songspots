import { useState } from 'react';
import { useSaveUserProfile, useActor } from '@common';
import { useInternetIdentity } from 'ic-use-internet-identity';

interface UseProfileActionsProps {
  userProfile?: any;
  isViewingOwnProfile: boolean;
  name: string;
  setName: (name: string) => void;
  bio: string;
  setBio: (bio: string) => void;
  setError: (error: string) => void;
  setIsEditing: (editing: boolean) => void;
  getProfilePictureForSave: () => Promise<[] | [string]>;
  resetProfilePicture: () => void;
}

export const useProfileActions = ({
  userProfile,
  isViewingOwnProfile,
  name,
  setName,
  bio,
  setBio,
  setError,
  setIsEditing,
  getProfilePictureForSave,
  resetProfilePicture,
}: UseProfileActionsProps) => {
  const { identity } = useInternetIdentity();
  const { actor } = useActor();
  const saveProfileMutation = useSaveUserProfile();

  // Toast state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const showToastMessage = (message: string, duration = 2000) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), duration);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    try {
      const finalProfilePictureForBackend = await getProfilePictureForSave();

      // Fetch current profile to preserve social media data
      let currentSocialMedia = {
        facebook: [] as [] | [string],
        instagram: [] as [] | [string],
        tiktok: [] as [] | [string],
        twitter: [] as [] | [string],
        website: [] as [] | [string],
        youtube: [] as [] | [string],
        spotify: [] as [] | [string],
        github: [] as [] | [string],
      };

      if (actor) {
        try {
          const rawProfile = await actor.getUserProfile();
          const currentProfile = Array.isArray(rawProfile)
            ? (rawProfile[0] ?? null)
            : (rawProfile ?? null);
          
          if (currentProfile?.socialMedia) {
            currentSocialMedia = {
              facebook: currentProfile.socialMedia.facebook || [],
              instagram: currentProfile.socialMedia.instagram || [],
              tiktok: currentProfile.socialMedia.tiktok || [],
              twitter: currentProfile.socialMedia.twitter || [],
              website: currentProfile.socialMedia.website || [],
              youtube: currentProfile.socialMedia.youtube || [],
              spotify: currentProfile.socialMedia.spotify || [],
              github: currentProfile.socialMedia.github || [],
            };
          }
        } catch (error) {
          console.warn('Could not fetch current profile for social media preservation:', error);
        }
      }

      const profileData = {
        name: name.trim(),
        profilePicture: finalProfilePictureForBackend,
        bio: bio.trim(),
        socialMedia: currentSocialMedia,
      };

      console.log('Saving profile with data:', profileData);
      await saveProfileMutation.mutateAsync(profileData);

      setIsEditing(false);
      setError('');
      resetProfilePicture();
    } catch (error) {
      console.error('Failed to save profile - Full error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      setError(
        `Failed to save profile: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };

  const handleCancel = () => {
    if (userProfile) {
      setName(userProfile.name);
      setBio(userProfile.bio || '');
    } else {
      // Reset to empty values when no profile exists
      setName('');
      setBio('');
    }
    setIsEditing(false);
    setError('');
    resetProfilePicture();
  };

  const getUserPrincipalId = () => {
    return identity?.getPrincipal().toString() || '';
  };

  const handleCopyPrincipal = async () => {
    try {
      await navigator.clipboard.writeText(getUserPrincipalId());
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      showToastMessage('Copied ID to clipboard', 1500);
    } catch (e) {
      console.error('Clipboard copy failed', e);
    }
  };

  const formatDate = () => {
    try {
      const date = new Date();
      return date.toLocaleDateString();
    } catch {
      return 'Unknown date';
    }
  };

  // Theme functions
  const getProfileHeaderGradient = () => {
    return 'from-slate-600 via-indigo-600 to-blue-600';
  };

  const getProfileAccentColor = () => {
    return 'indigo';
  };

  return {
    // Toast state
    showToast,
    toastMessage,
    copied,
    showToastMessage,

    // Profile actions
    handleSave,
    handleCancel,
    handleCopyPrincipal,

    // Utility functions
    formatDate,
    getProfileHeaderGradient,
    getProfileAccentColor,
    getUserPrincipalId,

    // Mutation state
    saveProfileMutation,
  };
};
