import { useState, useRef } from 'react';
import { useFileUpload } from '@features/file-storage/FileUpload';
import { useFileUrl, sanitizeUrl } from '@features/file-storage/FileList';
import { useInternetIdentity } from 'ic-use-internet-identity';

interface UseProfilePictureProps {
  userProfile?: any;
  onToast?: (message: string) => void;
}

export const useProfilePicture = ({ userProfile, onToast }: UseProfilePictureProps) => {
  const { identity } = useInternetIdentity();
  const { uploadFile, isUploading } = useFileUpload();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Profile picture state
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
  const [removeProfilePicture, setRemoveProfilePicture] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Get current profile picture URL
  const profilePicturePath = userProfile?.profilePicture;
  let urlParam: string = '';
  if (typeof profilePicturePath === 'string') {
    urlParam = profilePicturePath;
  } else if (Array.isArray(profilePicturePath) && profilePicturePath.length > 0) {
    urlParam = profilePicturePath[0] || '';
  }
  const { data: profilePictureUrl } = useFileUrl(urlParam);

  const validateAndSetProfilePicture = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      onToast?.('Please select an image file');
      return false;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      onToast?.('Image file must be smaller than 5MB');
      return false;
    }

    setProfilePictureFile(file);
    setRemoveProfilePicture(false);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setProfilePicturePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    onToast?.('Profile picture updated');
    return true;
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetProfilePicture(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      validateAndSetProfilePicture(file);
    }
  };

  const handleRemoveProfilePicture = () => {
    setRemoveProfilePicture(true);
    setProfilePicturePreview(null);
    setProfilePictureFile(null);
    onToast?.('Profile picture will be removed');
  };

  const resetProfilePicture = () => {
    setProfilePictureFile(null);
    setProfilePicturePreview(null);
    setRemoveProfilePicture(false);
  };

  const getProfilePictureForSave = async (): Promise<[] | [string]> => {
    if (removeProfilePicture) {
      return [];
    }
    
    if (profilePictureFile) {
      const data = new Uint8Array(await profilePictureFile.arrayBuffer());
      const fileName = `profile-pictures/${identity?.getPrincipal().toString()}-${Date.now()}.${profilePictureFile.name.split('.').pop()}`;
      const uploadedFilePath = sanitizeUrl(fileName);
      await uploadFile(uploadedFilePath, profilePictureFile.type, data);
      return [uploadedFilePath];
    }
    
    // Keep existing profile picture if any
    return userProfile?.profilePicture || [];
  };

  return {
    // State
    profilePictureFile,
    profilePicturePreview,
    profilePictureUrl,
    removeProfilePicture,
    isDragOver,
    isUploading,
    fileInputRef,
    
    // Handlers
    handleProfilePictureChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleRemoveProfilePicture,
    resetProfilePicture,
    getProfilePictureForSave,
  };
};
