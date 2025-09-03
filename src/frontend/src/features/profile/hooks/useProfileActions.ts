import { useState } from 'react';
import { useSaveUserProfile } from '../../common/useQueries';
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

      const profileData = {
        name: name.trim(),
        profilePicture: finalProfilePictureForBackend,
        bio: bio.trim(),
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
      setIsEditing(false);
    }
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
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
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