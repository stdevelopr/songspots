import React, { useState, useEffect, useRef } from 'react';
import {
  useGetUserProfile,
  useSaveUserProfile,
  useGetUserProfileByPrincipal,
  useGetPinsByOwner,
  useDeletePin,
  useUpdatePin,
} from '../common/useQueries';
import { useInternetIdentity } from 'ic-use-internet-identity';
import { useFileUpload } from '../file-storage/FileUpload';
import { useFileUrl, sanitizeUrl } from '../file-storage/FileList';
import { Principal } from '@dfinity/principal';
import DeleteConfirmationModal from '../common/DeleteConfirmationModal';
import PinEditModal from '../pins/PinEditModal';
import ProfileHero from './ProfileHero';
import ProfileCard from './ProfileCard';
import MusicEmbed from '../common/MusicEmbed';
import LocationDisplay from '../common/LocationDisplay';

interface ProfilePageProps {
  onBackToMap: () => void;
  userId?: string | null; // If provided, view another user's profile
  onViewPinOnMap: (pinId: string, lat: number, lng: number, fromProfile?: boolean) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ onBackToMap, userId, onViewPinOnMap }) => {
  const { identity } = useInternetIdentity();
  const isViewingOwnProfile = !userId;

  // Queries for own profile or other user's profile
  const { data: ownProfile, isLoading: isLoadingOwnProfile } = useGetUserProfile();
  const { data: otherUserProfile, isLoading: isLoadingOtherProfile } = useGetUserProfileByPrincipal(
    userId || ''
  );

  const userProfile = isViewingOwnProfile ? ownProfile : otherUserProfile;
  const isLoading = isViewingOwnProfile ? isLoadingOwnProfile : isLoadingOtherProfile;

  // Get pins for the user being viewed
  const { data: userPins = [], isLoading: isLoadingPins } = useGetPinsByOwner(
    userId || identity?.getPrincipal().toString() || ''
  );
  const saveProfileMutation = useSaveUserProfile();
  const deletePinMutation = useDeletePin();
  const updatePinMutation = useUpdatePin();
  const { uploadFile, isUploading } = useFileUpload();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
  const [removeProfilePicture, setRemoveProfilePicture] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pinToDelete, setPinToDelete] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [pinToEdit, setPinToEdit] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [isCondensed, setIsCondensed] = useState(false);
  const [bio, setBio] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

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

  // Only show public pins if viewing another user's profile
  const visiblePins = isViewingOwnProfile ? userPins : userPins.filter((pin) => !pin.isPrivate);

  // Initialize form when profile data loads or component mounts
  useEffect(() => {
    if (isViewingOwnProfile) {
      if (userProfile) {
        setName(userProfile.name);
        setBio(userProfile.bio || ''); // Load bio from backend
        setIsEditing(false);
      } else {
        setName('');
        setBio('');
        setIsEditing(true); // Start in edit mode if no profile exists
      }
    } else {
      setIsEditing(false); // Never edit mode when viewing others
      if (userProfile) {
        setBio(userProfile.bio || ''); // Load other user's bio from backend
      } else {
        setBio('');
      }
    }
    setError('');
    setProfilePictureFile(null);
    setProfilePicturePreview(null);
  }, [userProfile, isViewingOwnProfile]);

  // Condense header on scroll
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const onScroll = () => {
      setIsCondensed(el.scrollTop > 32);
    };
    el.addEventListener('scroll', onScroll);
    onScroll();
    return () => {
      el.removeEventListener('scroll', onScroll);
    };
  }, []);

  const validateAndSetProfilePicture = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      setToastMessage('Please select an image file');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return false;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image file must be smaller than 5MB');
      setToastMessage('Image file must be smaller than 5MB');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return false;
    }

    setProfilePictureFile(file);
    setError('');
    setRemoveProfilePicture(false);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setProfilePicturePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setToastMessage('Profile picture updated');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    try {
      let finalProfilePictureForBackend: [] | [string] = [];

      if (removeProfilePicture) {
        finalProfilePictureForBackend = [];
      } else if (profilePictureFile) {
        const data = new Uint8Array(await profilePictureFile.arrayBuffer());
        const fileName = `profile-pictures/${identity?.getPrincipal().toString()}-${Date.now()}.${profilePictureFile.name.split('.').pop()}`;
        const uploadedFilePath = sanitizeUrl(fileName);

        await uploadFile(uploadedFilePath, profilePictureFile.type, data);
        finalProfilePictureForBackend = [uploadedFilePath];
      } else {
        // Keep existing profile picture if any
        finalProfilePictureForBackend = userProfile?.profilePicture || [];
      }

      const profileData = {
        name: name.trim(),
        profilePicture: finalProfilePictureForBackend,
        bio: bio.trim(),
      };

      console.log('Saving profile with data:', profileData);
      await saveProfileMutation.mutateAsync(profileData);

      setIsEditing(false);
      setError('');
      setProfilePictureFile(null);
      setProfilePicturePreview(null);
      setRemoveProfilePicture(false);
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
      setIsEditing(false);
    }
    setError('');
    setProfilePictureFile(null);
    setProfilePicturePreview(null);
    setRemoveProfilePicture(false);
  };

  const handleDeletePin = (pin: any) => {
    setPinToDelete(pin);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!pinToDelete) return;

    try {
      await deletePinMutation.mutateAsync(pinToDelete.id);
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

  const handleEditPin = (pin: any) => {
    setPinToEdit(pin);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (pinData: {
    name: string;
    description: string;
    musicLink: string;
    isPrivate: boolean;
  }) => {
    if (!pinToEdit) return;

    try {
      await updatePinMutation.mutateAsync({
        id: pinToEdit.id,
        name: pinData.name || '',
        description: pinData.description || '',
        musicLink: pinData.musicLink || '',
        latitude: pinToEdit.latitude,
        longitude: pinToEdit.longitude,
        isPrivate: pinData.isPrivate,
      });

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

  const handleViewPinOnMap = (pin: any) => {
    const lat = parseFloat(pin.latitude);
    const lng = parseFloat(pin.longitude);
    onViewPinOnMap(pin.id.toString(), lat, lng, true); // Pass fromProfile=true
  };

  const formatDate = (pinId: bigint) => {
    try {
      // Since we don't have a timestamp field, we'll use the pin ID as a rough indicator
      // This is not ideal but works for display purposes
      const date = new Date();
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    } catch {
      return 'Unknown date';
    }
  };

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

  const handleCopyPrincipal = async () => {
    try {
      await navigator.clipboard.writeText(getUserPrincipalId());
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      setToastMessage('Copied ID to clipboard');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 1500);
    } catch (e) {
      console.error('Clipboard copy failed', e);
    }
  };

  const getProfileHeaderGradient = () => {
    // Use darker tones that harmonize with black header
    return 'from-slate-600 via-indigo-600 to-blue-600';
  };

  const getProfileAccentColor = () => {
    // Use a single accent family to match the black header
    return 'indigo';
  };

  return (
    <div className="h-full min-h-0 bg-gray-50 flex flex-col text-gray-800">
      {/* Desktop layout (lg+): card + scrollable list (two-column flex) */}
      <div className="hidden lg:flex h-full min-h-0 px-4 lg:px-8 py-6">
        <div className="w-full max-w-6xl mx-auto h-full min-h-0 flex gap-8">
          <div className="w-full lg:w-1/3 min-h-0 overflow-y-auto">
            <ProfileCard
              name={getDisplayName()}
              principalId={getUserPrincipalId()}
              photoUrl={profilePictureUrl || undefined}
              headerGradient={getProfileHeaderGradient()}
              totalCount={visiblePins?.length || 0}
            />

            {/* Edit Profile Form (Desktop) */}
            {isViewingOwnProfile && isEditing && (
              <div className="mt-4">
                <form
                  onSubmit={handleSave}
                  className="bg-white/95 rounded-xl border border-gray-100 shadow-sm p-6 space-y-4"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Edit Profile</h3>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="text-gray-400 hover:text-gray-600 p-1"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
                      {error}
                    </div>
                  )}

                  {/* Profile Picture Upload */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Profile Picture
                    </label>
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 group">
                          {profilePicturePreview ? (
                            <img
                              src={profilePicturePreview}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          ) : profilePictureUrl ? (
                            <img
                              src={profilePictureUrl}
                              alt="Current"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg
                                className="w-8 h-8 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                        {isUploading && (
                          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <div
                          className={`relative border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                            isDragOver
                              ? 'border-indigo-400 bg-indigo-50'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                        >
                          <svg
                            className="w-8 h-8 text-gray-400 mx-auto mb-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                          <p className="text-sm text-gray-600 mb-2">
                            Drag & drop an image here, or{' '}
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="text-indigo-600 hover:text-indigo-800 font-medium underline"
                            >
                              browse
                            </button>
                          </p>
                          <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
                        </div>

                        <div className="flex gap-2 mt-3">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-sm px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors flex items-center gap-2"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            Choose Photo
                          </button>
                          {(profilePictureUrl || profilePicturePreview) && (
                            <button
                              type="button"
                              onClick={() => {
                                setRemoveProfilePicture(true);
                                setProfilePicturePreview(null);
                                setProfilePictureFile(null);
                                setToastMessage('Profile picture will be removed');
                                setShowToast(true);
                                setTimeout(() => setShowToast(false), 2000);
                              }}
                              className="text-sm px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-colors flex items-center gap-2"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      className="hidden"
                    />
                  </div>

                  {/* Name Field */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Display Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  {/* Bio Field */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Bio</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell others a bit about yourself..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                      rows={3}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isUploading || saveProfileMutation.isPending}
                      className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                    >
                      {isUploading || saveProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Profile extras (desktop) */}
            <div className="mt-4 space-y-4">
              {/* About */}
              <div className="bg-white/95 rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-indigo-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    About
                  </h3>
                  {isViewingOwnProfile && !isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded-full font-medium flex items-center gap-1 transition-colors"
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Edit Profile
                    </button>
                  )}
                </div>
                {isViewingOwnProfile ? (
                  bio?.trim() ? (
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 rounded-lg p-3">
                      {bio}
                    </p>
                  ) : (
                    <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3 text-center border-2 border-dashed border-gray-200">
                      <svg
                        className="w-6 h-6 text-gray-400 mx-auto mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                      Add a short bio to tell others about yourself
                    </div>
                  )
                ) : bio?.trim() ? (
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 rounded-lg p-3">
                    {bio}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No bio available</p>
                )}
              </div>
              {/* Stats */}
              <div className="bg-white/95 rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-lg transition-shadow duration-200">
                <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-emerald-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  Statistics
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {isViewingOwnProfile ? (
                    <>
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm font-medium text-blue-900">Total Memories</span>
                        </div>
                        <span className="text-lg font-bold text-blue-700">
                          {visiblePins?.length || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-100">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                          <span className="text-sm font-medium text-emerald-900">Public</span>
                        </div>
                        <span className="text-lg font-bold text-emerald-700">
                          {(userPins || []).filter((p) => !p.isPrivate).length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-50 to-gray-50 rounded-lg border border-slate-100">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                          <span className="text-sm font-medium text-slate-900">Private</span>
                        </div>
                        <span className="text-lg font-bold text-slate-700">
                          {(userPins || []).filter((p) => p.isPrivate).length}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                        <span className="text-sm font-medium text-indigo-900">Public Memories</span>
                      </div>
                      <span className="text-lg font-bold text-indigo-700">
                        {visiblePins?.length || 0}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              {/* Quick Actions */}
              <div className="bg-white/95 rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-lg transition-shadow duration-200">
                <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={handleCopyPrincipal}
                    className="w-full flex items-center gap-3 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">Copy Profile ID</p>
                      <p className="text-xs text-gray-500">Share your profile with others</p>
                    </div>
                    {copied && <div className="text-xs text-green-600 font-medium">Copied!</div>}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto pr-2">
            <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-md bg-white/95 backdrop-blur-sm">
              <div
                className={`bg-gradient-to-r ${getProfileHeaderGradient()} px-6 py-6 border-b border-gray-200`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-extrabold text-white drop-shadow-sm">
                      {isViewingOwnProfile ? 'Your Spots' : `${getDisplayName()}'s Spots`}
                    </h2>
                    <p className="text-white/90 mt-1 drop-shadow-sm">
                      {isViewingOwnProfile ? 'Manage your spots' : 'Explore spots'}
                    </p>
                  </div>
                  <div className="bg-white/20 rounded-full p-3 backdrop-blur-sm">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="p-6 lg:p-7">
                {isLoading || isLoadingPins ? (
                  <div className="space-y-6">
                    <div className="text-center py-8">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full mb-4">
                        <div className="w-8 h-8 border-3 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Loading memories...
                      </h3>
                      <p className="text-gray-500">Gathering your special moments</p>
                    </div>
                    <div className="grid gap-6">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="animate-pulse rounded-2xl p-6 border border-gray-100 bg-white/90 shadow-sm"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="h-6 w-32 bg-gradient-to-r from-gray-200 to-gray-100 rounded-lg" />
                                <div className="h-5 w-16 bg-gray-100 rounded-full" />
                              </div>
                              <div className="space-y-2">
                                <div className="h-4 w-full bg-gray-100 rounded" />
                                <div className="h-4 w-4/5 bg-gray-100 rounded" />
                                <div className="h-4 w-3/5 bg-gray-100 rounded" />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <div className="h-8 w-8 bg-gray-100 rounded-lg" />
                              <div className="h-8 w-8 bg-gray-100 rounded-lg" />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            <div className="h-16 bg-gradient-to-r from-gray-100 to-gray-50 rounded-lg border border-gray-100" />
                            <div className="h-16 bg-gradient-to-r from-gray-100 to-gray-50 rounded-lg border border-gray-100" />
                          </div>
                          <div className="h-10 w-36 bg-gray-100 rounded-lg" />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : visiblePins.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                      <svg
                        className="w-10 h-10 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      {isViewingOwnProfile ? 'Your journey starts here' : 'No memories yet'}
                    </h3>
                    <p className="text-gray-600 mb-8 leading-relaxed max-w-lg mx-auto">
                      {isViewingOwnProfile
                        ? 'Create your first memory by clicking on the map to mark special places and musical moments that matter to you.'
                        : "This user hasn't shared any memories yet. Check back later to discover their musical journey!"}
                    </p>
                    {isViewingOwnProfile && (
                      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100 max-w-md mx-auto">
                        <h4 className="text-lg font-semibold text-indigo-900 mb-2">Get started</h4>
                        <p className="text-indigo-700 text-sm">
                          Navigate to the map and click anywhere to create your first memory spot!
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid gap-6 justify-items-center">
                    {visiblePins.map((pin, index) => (
                      <div
                        key={pin.id.toString()}
                        className="rounded-2xl p-5 border border-gray-100 bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 transform hover:scale-[1.02] group"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900 tracking-tight">
                                {pin.name || 'Unnamed Memory'}
                              </h3>
                              {isViewingOwnProfile && (
                                <>
                                  {pin.isPrivate ? (
                                    <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 ring-1 ring-slate-200">
                                      <span>🔒</span>
                                      <span>Private</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200">
                                      <span>🌍</span>
                                      <span>Public</span>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                          {isViewingOwnProfile && (
                            <div className="ml-4 flex gap-2">
                              <button
                                onClick={() => handleEditPin(pin)}
                                className="px-2.5 py-2 text-blue-700 bg-blue-50/60 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                                title="Edit memory"
                              >
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeletePin(pin)}
                                className="px-2.5 py-2 text-red-700 bg-red-50/60 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
                                title="Delete memory"
                              >
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                        {pin.description && (
                          <div className="mb-4">
                            <p className="text-gray-700 text-sm leading-relaxed bg-white/60 rounded-lg p-3 border border-gray-100">
                              {pin.description}
                            </p>
                          </div>
                        )}
                        {pin.musicLink && (
                          <div className="mb-4 bg-white/60 rounded-lg p-3 border border-gray-100 flex justify-center">
                            <div className="w-full max-w-md aspect-video">
                              <MusicEmbed musicLink={pin.musicLink} />
                            </div>
                          </div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-[inset_0_1px_0_0_rgba(0,0,0,0.02)]">
                            <span className="font-semibold text-gray-700 flex items-center mb-1">
                              Location
                            </span>
                            <div className="text-[11px] text-gray-600">
                              <LocationDisplay
                                latitude={pin.latitude}
                                longitude={pin.longitude}
                                showIcon={false}
                              />
                            </div>
                          </div>
                          <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-[inset_0_1px_0_0_rgba(0,0,0,0.02)]">
                            <span className="font-semibold text-gray-700 flex items-center mb-1">
                              <svg
                                className="w-4 h-4 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              Created
                            </span>
                            <p className="text-[11px] text-gray-600">{formatDate(pin.id)}</p>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <button
                            onClick={() => handleViewPinOnMap(pin)}
                            className={`text-${getProfileAccentColor()}-700 hover:text-${getProfileAccentColor()}-800 text-sm font-medium flex items-center gap-2 bg-${getProfileAccentColor()}-50/70 hover:bg-${getProfileAccentColor()}-100 px-4 py-2 rounded-lg border border-${getProfileAccentColor()}-100 transition-all`}
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            <span>View on Map</span>
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile + Tablet (base–lg-1): full profile section included in scroll */}
      <div className="lg:hidden h-full min-h-0 overflow-y-auto">
        <div className="w-full max-w-2xl mx-auto px-3 py-3">
          <ProfileCard
            name={getDisplayName()}
            principalId={getUserPrincipalId()}
            photoUrl={profilePictureUrl || undefined}
            headerGradient={getProfileHeaderGradient()}
            totalCount={visiblePins?.length || 0}
          />

          <div className="pt-3 pb-6">
            {/* Profile extras (mobile) */}
            <div className="space-y-3">
              {/* About (Mobile) */}
              <div className="bg-white/95 rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-indigo-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    About
                  </h3>
                  {isViewingOwnProfile && !isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-full font-medium flex items-center gap-1 transition-colors"
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Edit
                    </button>
                  )}
                </div>
                {isViewingOwnProfile ? (
                  bio?.trim() ? (
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 rounded-lg p-3">
                      {bio}
                    </p>
                  ) : (
                    <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-4 text-center border-2 border-dashed border-gray-200">
                      <svg
                        className="w-6 h-6 text-gray-400 mx-auto mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                      Click Edit to add a bio
                    </div>
                  )
                ) : bio?.trim() ? (
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 rounded-lg p-3">
                    {bio}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No bio available</p>
                )}
              </div>
              <div className="bg-white/95 rounded-xl border border-gray-100 shadow-sm p-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Stats</h3>
                <div className="flex flex-wrap gap-2">
                  {isViewingOwnProfile ? (
                    <>
                      <span className="text-[12px] px-2.5 py-1 rounded-full bg-gray-50 text-gray-800 border border-gray-200">
                        Total: {visiblePins?.length || 0}
                      </span>
                      <span className="text-[12px] px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                        Public: {(userPins || []).filter((p) => !p.isPrivate).length}
                      </span>
                      <span className="text-[12px] px-2.5 py-1 rounded-full bg-slate-50 text-slate-700 border border-slate-200">
                        Private (only you): {(userPins || []).filter((p) => p.isPrivate).length}
                      </span>
                    </>
                  ) : (
                    <span className="text-[12px] px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                      Spots: {visiblePins?.length || 0}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Edit Profile Form (Mobile) */}
            {isViewingOwnProfile && isEditing && (
              <div className="mt-4 mx-1">
                <div className="bg-white/95 rounded-xl border border-gray-100 shadow-lg p-5 space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">Edit Profile</h3>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  <form onSubmit={handleSave} className="space-y-5">
                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800 flex items-center gap-2">
                        <svg
                          className="w-4 h-4 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {error}
                      </div>
                    )}

                    {/* Profile Picture Upload (Mobile) */}
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Profile Picture
                      </label>
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                          <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
                            {profilePicturePreview ? (
                              <img
                                src={profilePicturePreview}
                                alt="Preview"
                                className="w-full h-full object-cover"
                              />
                            ) : profilePictureUrl ? (
                              <img
                                src={profilePictureUrl}
                                alt="Current"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <svg
                                  className="w-8 h-8 text-gray-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                  />
                                </svg>
                              </div>
                            )}
                          </div>
                          {isUploading && (
                            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-sm px-4 py-2 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors font-medium"
                          >
                            Change Photo
                          </button>
                          {(profilePictureUrl || profilePicturePreview) && (
                            <button
                              type="button"
                              onClick={() => {
                                setRemoveProfilePicture(true);
                                setProfilePicturePreview(null);
                                setProfilePictureFile(null);
                                setToastMessage('Profile picture will be removed');
                                setShowToast(true);
                                setTimeout(() => setShowToast(false), 2000);
                              }}
                              className="text-sm px-4 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-colors font-medium"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleProfilePictureChange}
                          className="hidden"
                        />
                      </div>
                    </div>

                    {/* Name Field */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base"
                      />
                    </div>

                    {/* Bio Field */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Bio</label>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell others a bit about yourself..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-base"
                        rows={4}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3 pt-4 border-t border-gray-100">
                      <button
                        type="submit"
                        disabled={isUploading || saveProfileMutation.isPending}
                        className="w-full px-4 py-3 text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        {isUploading || saveProfileMutation.isPending ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Saving...
                          </>
                        ) : (
                          'Save Changes'
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="w-full px-4 py-3 text-base font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Spots List */}
            <div className="w-full mt-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                {isViewingOwnProfile ? 'Your Spots' : getDisplayName() + "'s Spots"}
              </h2>
              {isLoading || isLoadingPins ? (
                <div className="flex flex-col gap-4">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="animate-pulse bg-white/90 rounded-2xl border border-gray-100 p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="h-5 w-40 bg-gray-200 rounded" />
                        <div className="h-6 w-16 bg-gray-200 rounded-full" />
                      </div>
                      <div className="h-4 w-full bg-gray-100 rounded mb-2" />
                      <div className="h-4 w-2/3 bg-gray-100 rounded mb-4" />
                      <div className="h-8 w-28 bg-gray-100 rounded" />
                    </div>
                  ))}
                </div>
              ) : visiblePins.length === 0 ? (
                <div className="text-center py-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No spots yet</h3>
                  <p className="text-gray-700 mb-4">
                    {isViewingOwnProfile
                      ? 'Start creating spots by clicking on the map!'
                      : 'No spots yet.'}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4 items-center">
                  {visiblePins
                    .slice()
                    .sort((a, b) => Number(b.id) - Number(a.id))
                    .map((spot) => (
                      <div
                        key={spot.id.toString()}
                        className="w-full bg-white/95 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition border border-gray-100 p-4 flex flex-col gap-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center min-w-0 gap-2 flex-1">
                              <h3
                                className="text-lg font-semibold text-gray-900 truncate overflow-hidden whitespace-nowrap min-w-0 flex-1 max-w-[45vw]"
                                title={spot.name || 'Unnamed Spot'}
                              >
                                {spot.name || 'Unnamed Spot'}
                              </h3>
                              {isViewingOwnProfile && (
                                <>
                                  {spot.isPrivate ? (
                                    <span className="flex-shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 ring-1 ring-slate-200 mr-2">
                                      🔒 Private
                                    </span>
                                  ) : (
                                    <span className="flex-shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 ring-1 ring-emerald-200 mr-2">
                                      🌍 Public
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                          {isViewingOwnProfile && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditPin(spot)}
                                className="text-indigo-700 bg-indigo-50/60 hover:bg-indigo-100 border border-indigo-200 text-sm px-2.5 py-1 rounded-md"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeletePin(spot)}
                                className="text-red-700 bg-red-50/60 hover:bg-red-100 border border-red-200 text-sm px-2.5 py-1 rounded-md"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                        {spot.description && (
                          <p className="text-gray-700 text-sm leading-relaxed bg-white/60 rounded-lg p-3 border border-gray-100">
                            {spot.description}
                          </p>
                        )}
                        {spot.musicLink && (
                          <div className="mb-3 bg-white/60 rounded-lg p-3 border border-gray-100 flex justify-center">
                            <div className="w-full aspect-video">
                              <MusicEmbed musicLink={spot.musicLink} />
                            </div>
                          </div>
                        )}
                        <div className="text-xs text-gray-500">
                          <LocationDisplay
                            latitude={spot.latitude}
                            longitude={spot.longitude}
                            showIcon={true}
                            className="text-gray-500"
                          />
                        </div>
                        <button
                          onClick={() => handleViewPinOnMap(spot)}
                          className="mt-2 inline-flex items-center gap-2 text-indigo-700 hover:text-indigo-800 text-sm font-medium bg-indigo-50/70 hover:bg-indigo-100 px-3 py-1.5 rounded-md border border-indigo-100 transition"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          View on Map
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isDeleting={deletePinMutation.isPending}
        pinName={pinToDelete?.name || 'Unnamed Pin'}
      />

      {/* Pin Edit Modal */}
      <PinEditModal
        isOpen={showEditModal}
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
        onCancel={handleEditCancel}
        isSubmitting={updatePinMutation.isPending}
      />
      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-black/80 text-white text-sm px-3 py-2 rounded shadow">
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
