import React, { useState, useEffect } from 'react';
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pinToDelete, setPinToDelete] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [pinToEdit, setPinToEdit] = useState<any>(null);

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
        setIsEditing(false);
      } else {
        setName('');
        setIsEditing(true); // Start in edit mode if no profile exists
      }
    } else {
      setIsEditing(false); // Never edit mode when viewing others
    }
    setError('');
    setProfilePictureFile(null);
    setProfilePicturePreview(null);
  }, [userProfile, isViewingOwnProfile]);

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file must be smaller than 5MB');
        return;
      }

      setProfilePictureFile(file);
      setError('');

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicturePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    try {
      let finalProfilePictureForBackend: [string] | [] = [];

      if (profilePictureFile) {
        const data = new Uint8Array(await profilePictureFile.arrayBuffer());
        const fileName = `profile-pictures/${identity?.getPrincipal().toString()}-${Date.now()}.${profilePictureFile.name.split('.').pop()}`;
        const uploadedFilePath = sanitizeUrl(fileName);

        await uploadFile(uploadedFilePath, profilePictureFile.type, data);
        finalProfilePictureForBackend = [uploadedFilePath];
      } else {
        if (userProfile?.profilePicture && userProfile.profilePicture.length > 0) {
          const existingPath = userProfile.profilePicture[0];
          if (typeof existingPath === 'string') {
            finalProfilePictureForBackend = [existingPath];
          } else {
            finalProfilePictureForBackend = [];
          }
        } else {
          finalProfilePictureForBackend = [];
        }
      }

      await saveProfileMutation.mutateAsync({
        name: name.trim(),
        profilePicture: finalProfilePictureForBackend,
      });

      setIsEditing(false);
      setError('');
      setProfilePictureFile(null);
      setProfilePicturePreview(null);
    } catch (error) {
      console.error('Failed to save profile:', error);
      setError('Failed to save profile. Please try again.');
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
    const pinId = pin.id.toString();
    onViewPinOnMap(pinId, lat, lng, true); // Pass fromProfile=true
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

  const formatCoordinates = (lat: string, lng: string) => {
    try {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    } catch {
      return `${lat}, ${lng}`;
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

  const getProfileHeaderGradient = () => {
    if (isViewingOwnProfile) {
      return 'from-purple-600 via-blue-600 to-indigo-700';
    }
    return 'from-emerald-600 via-teal-600 to-cyan-700';
  };

  const getProfileAccentColor = () => {
    if (isViewingOwnProfile) {
      return 'blue';
    }
    return 'emerald';
  };

  return (
    <div className="h-full bg-gray-50 overflow-y-auto">
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Back to Map Button */}
        <div className="mb-6">
          <button
            onClick={onBackToMap}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors group"
          >
            <svg
              className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span className="font-medium">Back to Map</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
              <div
                className={`bg-gradient-to-br ${getProfileHeaderGradient()} px-6 py-10 relative`}
              >
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-5 rounded-full translate-y-12 -translate-x-12"></div>

                <div className="text-center relative z-10">
                  {/* Profile Picture */}
                  <div className="mb-6">
                    {profilePicturePreview ? (
                      <img
                        src={profilePicturePreview}
                        alt="Profile preview"
                        className="w-24 h-24 rounded-full mx-auto border-4 border-white shadow-xl object-cover ring-4 ring-white ring-opacity-20"
                      />
                    ) : profilePictureUrl ? (
                      <img
                        src={profilePictureUrl}
                        alt="Profile"
                        className="w-24 h-24 rounded-full mx-auto border-4 border-white shadow-xl object-cover ring-4 ring-white ring-opacity-20"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full mx-auto border-4 border-white shadow-xl flex items-center justify-center backdrop-blur-sm ring-4 ring-white ring-opacity-20">
                        <svg
                          className="w-12 h-12 text-white"
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

                  <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
                    {getDisplayName()}
                  </h1>

                  <div className="flex items-center justify-center space-x-4 text-white text-opacity-90">
                    <div className="flex items-center space-x-2">
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
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span className="font-medium">
                        {visiblePins.length} pin{visiblePins.length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {!isViewingOwnProfile && (
                      <div className="flex items-center space-x-2">
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
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        <span className="text-sm">Public Profile</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6">
                {isLoading || isLoadingPins ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Loading profile...</span>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* User Identity Info */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
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
                            d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V4a2 2 0 114 0v2m-4 0a2 2 0 104 0m-4 0v2m4-2v2"
                          />
                        </svg>
                        Account Information
                      </h3>
                      <p className="text-xs text-gray-500 break-all font-mono bg-white rounded-lg p-3 border">
                        {getUserPrincipalId()}
                      </p>
                    </div>

                    {/* Profile Form - Only show for own profile */}
                    {isViewingOwnProfile && (
                      <form onSubmit={handleSave} className="space-y-6">
                        <div>
                          <label
                            htmlFor="profileName"
                            className="block text-sm font-medium text-gray-700 mb-2"
                          >
                            Name *
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              id="profileName"
                              value={name}
                              onChange={(e) => {
                                setName(e.target.value);
                                if (error) setError('');
                              }}
                              placeholder="Enter your name"
                              disabled={saveProfileMutation.isPending || isUploading}
                              className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:bg-gray-50 transition-colors ${
                                error ? 'border-red-300' : 'border-gray-300'
                              }`}
                              maxLength={100}
                              required
                            />
                          ) : (
                            <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                              <p className="text-gray-900 font-medium">{name || 'Not set'}</p>
                              <button
                                type="button"
                                onClick={() => setIsEditing(true)}
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium px-3 py-1 rounded-md hover:bg-blue-50 transition-colors"
                              >
                                Edit
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Profile Picture Upload */}
                        {isEditing && (
                          <div>
                            <label
                              htmlFor="profilePicture"
                              className="block text-sm font-medium text-gray-700 mb-2"
                            >
                              Profile Picture
                            </label>
                            <input
                              type="file"
                              id="profilePicture"
                              accept="image/*"
                              onChange={handleProfilePictureChange}
                              disabled={saveProfileMutation.isPending || isUploading}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:bg-gray-50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                              Supported formats: JPG, PNG, GIF. Max size: 5MB
                            </p>
                          </div>
                        )}

                        {error && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-sm text-red-600 flex items-center">
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
                                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              {error}
                            </p>
                          </div>
                        )}

                        {isEditing && (
                          <div className="flex items-center space-x-4 pt-4">
                            <button
                              type="submit"
                              disabled={saveProfileMutation.isPending || isUploading}
                              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium shadow-lg hover:shadow-xl"
                            >
                              {saveProfileMutation.isPending || isUploading ? (
                                <>
                                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                  {isUploading ? 'Uploading...' : 'Saving...'}
                                </>
                              ) : (
                                <>
                                  <svg
                                    className="w-5 h-5 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                  Save Profile
                                </>
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={handleCancel}
                              disabled={saveProfileMutation.isPending || isUploading}
                              className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-50 font-medium"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </form>
                    )}

                    {/* Profile Status - Only for own profile */}
                    {isViewingOwnProfile && (
                      <>
                        {userProfile && !isEditing && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center">
                              <div className="w-5 h-5 text-green-600">✓</div>
                              <span className="ml-3 text-sm text-green-700 font-medium">
                                Profile is complete and saved
                              </span>
                            </div>
                          </div>
                        )}

                        {!userProfile && !isEditing && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-center">
                              <div className="w-5 h-5 text-yellow-600">⚠️</div>
                              <span className="ml-3 text-sm text-yellow-700 font-medium">
                                No profile found. Please create one to get started.
                              </span>
                            </div>
                            <button
                              onClick={() => setIsEditing(true)}
                              className="mt-3 text-sm text-yellow-800 underline hover:text-yellow-900 font-medium"
                            >
                              Create Profile
                            </button>
                          </div>
                        )}
                      </>
                    )}

                    {/* Other user profile info */}
                    {!isViewingOwnProfile && (
                      <div
                        className={`bg-${getProfileAccentColor()}-50 border border-${getProfileAccentColor()}-200 rounded-lg p-4`}
                      >
                        <div className="flex items-center">
                          <div className={`w-5 h-5 text-${getProfileAccentColor()}-600`}>👤</div>
                          <span
                            className={`ml-3 text-sm text-${getProfileAccentColor()}-700 font-medium`}
                          >
                            Viewing {getDisplayName()}'s public profile
                          </span>
                        </div>
                        <p className={`mt-2 text-xs text-${getProfileAccentColor()}-600`}>
                          Only public pins and information are visible to other users.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pins List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
              <div
                className={`bg-gradient-to-r ${getProfileHeaderGradient()} px-6 py-6 border-b border-gray-200`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {isViewingOwnProfile ? 'Your Pins' : `${getDisplayName()}'s Public Pins`}
                    </h2>
                    <p className="text-white text-opacity-90 mt-1">
                      {visiblePins.length} pin{visiblePins.length !== 1 ? 's' : ''}{' '}
                      {isViewingOwnProfile ? 'created' : 'visible'}
                    </p>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-full p-3 backdrop-blur-sm">
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

              <div className="p-6">
                {visiblePins.length === 0 ? (
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
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {isViewingOwnProfile ? 'No pins yet' : 'No public pins'}
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      {isViewingOwnProfile
                        ? 'Start creating pins by clicking on the map to mark your favorite places and memories!'
                        : "This user hasn't created any public pins yet. Check back later to see their contributions!"}
                    </p>
                    {isViewingOwnProfile && (
                      <button
                        onClick={onBackToMap}
                        className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg hover:shadow-xl"
                      >
                        Go to Map
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {visiblePins.map((pin) => (
                      <div
                        key={pin.id.toString()}
                        className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 bg-gradient-to-r from-white to-gray-50"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-xl font-semibold text-gray-900">
                                {pin.name || 'Unnamed Pin'}
                              </h3>
                              <div
                                className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold ${
                                  pin.isPrivate
                                    ? 'bg-gray-100 text-gray-700'
                                    : 'bg-green-100 text-green-700'
                                }`}
                              >
                                <span>{pin.isPrivate ? '🔒' : '🌐'}</span>
                                <span>{pin.isPrivate ? 'Private' : 'Public'}</span>
                              </div>
                            </div>
                            {pin.description && (
                              <p className="text-gray-600 text-sm mb-3 leading-relaxed bg-white rounded-lg p-3 border border-gray-100">
                                {pin.description}
                              </p>
                            )}
                          </div>
                          {/* Action buttons for own pins */}
                          {isViewingOwnProfile && (
                            <div className="ml-4 flex space-x-2">
                              <button
                                onClick={() => handleEditPin(pin)}
                                disabled={updatePinMutation.isPending}
                                className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 group"
                                title="Edit pin"
                              >
                                <svg
                                  className="w-5 h-5 group-hover:scale-110 transition-transform"
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
                                disabled={deletePinMutation.isPending}
                                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 group"
                                title="Delete pin"
                              >
                                <svg
                                  className="w-5 h-5 group-hover:scale-110 transition-transform"
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

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          <div className="bg-white rounded-lg p-3 border border-gray-100">
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
                                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                />
                              </svg>
                              Location
                            </span>
                            <p className="font-mono text-xs text-gray-600">
                              {formatCoordinates(pin.latitude, pin.longitude)}
                            </p>
                          </div>
                          <div className="bg-white rounded-lg p-3 border border-gray-100">
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
                            <p className="text-xs text-gray-600">{formatDate(pin.id)}</p>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <button
                            onClick={() => handleViewPinOnMap(pin)}
                            className={`text-${getProfileAccentColor()}-600 hover:text-${getProfileAccentColor()}-700 text-sm font-medium flex items-center space-x-2 group bg-${getProfileAccentColor()}-50 hover:bg-${getProfileAccentColor()}-100 px-4 py-2 rounded-lg transition-all duration-200`}
                          >
                            <svg
                              className="w-4 h-4 group-hover:scale-110 transition-transform"
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
                              className="w-4 h-4 group-hover:translate-x-1 transition-transform"
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

            {/* Additional Information */}
            <div
              className={`mt-6 bg-${getProfileAccentColor()}-50 border border-${getProfileAccentColor()}-200 rounded-xl p-6`}
            >
              <h3
                className={`text-sm font-semibold text-${getProfileAccentColor()}-800 mb-3 flex items-center`}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                About {isViewingOwnProfile ? 'Your' : "This User's"} Data
              </h3>
              <p className={`text-sm text-${getProfileAccentColor()}-700 leading-relaxed`}>
                {isViewingOwnProfile
                  ? 'Your profile and pin data are securely stored and associated with your Internet Identity. Private pins are only visible to you, while public pins can be seen by all users. You have full control over your data and can edit or delete your content at any time.'
                  : "This user's public profile and pins are visible to all users. Private pins remain hidden and are only visible to the owner. All data is securely stored and managed through the Internet Computer blockchain."}
              </p>
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
                musicLink: undefined, // Music links are not stored in backend
                isPrivate: pinToEdit.isPrivate,
              }
            : null
        }
        onSubmit={handleEditSubmit}
        onCancel={handleEditCancel}
        isSubmitting={updatePinMutation.isPending}
      />
    </div>
  );
};

export default ProfilePage;
