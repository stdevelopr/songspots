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
    // Load bio from localStorage for own profile
    try {
      const principalId = identity?.getPrincipal().toString();
      if (principalId && isViewingOwnProfile) {
        const stored = localStorage.getItem(`profile-bio-${principalId}`) || '';
        setBio(stored);
      } else if (!isViewingOwnProfile) {
        setBio('');
      }
    } catch {}
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

      if (removeProfilePicture) {
        finalProfilePictureForBackend = [];
      } else if (profilePictureFile) {
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

      // Save bio locally for now (no backend field yet)
      try {
        const principalId = identity?.getPrincipal().toString();
        if (principalId) {
          localStorage.setItem(`profile-bio-${principalId}`, bio.trim());
        }
      } catch {}

      setIsEditing(false);
      setError('');
      setProfilePictureFile(null);
      setProfilePicturePreview(null);
      setRemoveProfilePicture(false);
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
    // Harmonize with dark header: cool indigo/blue tones
    if (isViewingOwnProfile) {
      return 'from-indigo-600 via-violet-600 to-sky-600';
    }
    return 'from-blue-700 via-indigo-700 to-slate-800';
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
            {/* Profile extras (desktop) */}
            <div className="mt-4 space-y-4">
              {/* About */}
              <div className="bg-white/95 rounded-xl border border-gray-100 shadow-sm p-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-2">About</h3>
                {isViewingOwnProfile ? (
                  bio?.trim() ? (
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{bio}</p>
                  ) : (
                    <p className="text-sm text-gray-500">Add a short bio to tell others about you.</p>
                  )
                ) : (
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {/* For now, show nothing special for other users if no bio */}
                    {''}
                  </p>
                )}
              </div>
              {/* Stats */}
              <div className="bg-white/95 rounded-xl border border-gray-100 shadow-sm p-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Stats</h3>
                <div className="flex flex-wrap gap-2">
                  {isViewingOwnProfile ? (
                    <>
                      <span className="text-[12px] px-2.5 py-1 rounded-full bg-gray-50 text-gray-800 border border-gray-200">Total: {visiblePins?.length || 0}</span>
                      <span className="text-[12px] px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">Public: {(userPins || []).filter((p) => !p.isPrivate).length}</span>
                      <span className="text-[12px] px-2.5 py-1 rounded-full bg-slate-50 text-slate-700 border border-slate-200">Private (only you): {(userPins || []).filter((p) => p.isPrivate).length}</span>
                    </>
                  ) : (
                    <span className="text-[12px] px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">Spots: {visiblePins?.length || 0}</span>
                  )}
                </div>
              </div>
              {/* Social links (visual only) */}
              <div className="bg-white/95 rounded-xl border border-gray-100 shadow-sm p-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Links</h3>
                <div className="flex items-center gap-3 text-gray-500">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 border border-gray-200">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 13a5.5 5.5 0 007.778 0l1.172-1.172a5.5 5.5 0 000-7.778v0a5.5 5.5 0 00-7.778 0L10.5 5.5"/></svg>
                  </span>
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 border border-gray-200">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M22.46 6c-.77.35-1.6.58-2.46.69a4.3 4.3 0 001.89-2.38 8.6 8.6 0 01-2.73 1.04 4.28 4.28 0 00-7.29 3.9A12.15 12.15 0 013 4.8a4.28 4.28 0 001.32 5.71 4.23 4.23 0 01-1.94-.53v.05a4.28 4.28 0 003.44 4.19 4.3 4.3 0 01-1.93.07 4.28 4.28 0 004 2.97A8.6 8.6 0 012 19.54a12.14 12.14 0 006.57 1.92c7.88 0 12.2-6.53 12.2-12.2l-.01-.56A8.7 8.7 0 0022.46 6z"/></svg>
                  </span>
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 border border-gray-200">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.2c3.18 0 3.56.01 4.82.07 1.17.05 1.95.24 2.41.4.61.24 1.05.53 1.51.99.46.46.75.9.99 1.51.16.46.35 1.24.4 2.41.06 1.26.07 1.64.07 4.82s-.01 3.56-.07 4.82c-.05 1.17-.24 1.95-.4 2.41a3.92 3.92 0 01-.99 1.51 3.92 3.92 0 01-1.51.99c-.46.16-1.24.35-2.41.4-1.26.06-1.64.07-4.82.07s-3.56-.01-4.82-.07c-1.17-.05-1.95-.24-2.41-.4a3.92 3.92 0 01-1.51-.99 3.92 3.92 0 01-.99-1.51c-.16-.46-.35-1.24-.4-2.41C2.21 15.56 2.2 15.18 2.2 12s.01-3.56.07-4.82c.05-1.17.24-1.95.4-2.41.24-.61.53-1.05.99-1.51.46-.46.9-.75 1.51-.99.46-.16 1.24-.35 2.41-.4C8.44 2.21 8.82 2.2 12 2.2zm0 1.8c-3.12 0-3.48.01-4.7.07-.98.04-1.5.21-1.85.34-.47.18-.8.39-1.15.74-.35.35-.56.68-.74 1.15-.13.34-.3.87-.34 1.85-.06 1.22-.07 1.58-.07 4.7s.01 3.48.07 4.7c.04.98.21 1.5.34 1.85.18.47.39.8.74 1.15.35.35.68.56 1.15.74.34.13.87.3 1.85.34 1.22.06 1.58.07 4.7.07s3.48-.01 4.7-.07c.98-.04 1.5-.21 1.85-.34.47-.18.8-.39 1.15-.74.35-.35.56-.68.74-1.15.13-.34.3-.87.34-1.85.06-1.22.07-1.58.07-4.7s-.01-3.48-.07-4.7c-.04-.98-.21-1.5-.34-1.85a2.32 2.32 0 00-.74-1.15 2.32 2.32 0 00-1.15-.74c-.34-.13-.87-.3-1.85-.34-1.22-.06-1.58-.07-4.7-.07zm0 3.3a6.5 6.5 0 110 13 6.5 6.5 0 010-13z"/></svg>
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto pr-2">
            <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-md bg-white/95 backdrop-blur-sm">
              <div className={`bg-gradient-to-r ${getProfileHeaderGradient()} px-6 py-6 border-b border-gray-200`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-extrabold text-white drop-shadow-sm">{isViewingOwnProfile ? 'Your Spots' : `${getDisplayName()}'s Spots`}</h2>
                    <p className="text-white/90 mt-1 drop-shadow-sm">{isViewingOwnProfile ? 'Manage your spots' : 'Explore spots'}</p>
                  </div>
                  <div className="bg-white/20 rounded-full p-3 backdrop-blur-sm">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="p-6 lg:p-7">
                {isLoading || isLoadingPins ? (
                  <div className="grid gap-4">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="animate-pulse rounded-2xl p-5 border border-gray-100 bg-white/80">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="h-5 w-40 bg-gray-200 rounded mb-3" />
                            <div className="h-4 w-full bg-gray-100 rounded mb-2" />
                            <div className="h-4 w-5/6 bg-gray-100 rounded" />
                          </div>
                          <div className="h-6 w-20 bg-gray-200 rounded-full" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="h-14 bg-gray-100 rounded" />
                          <div className="h-14 bg-gray-100 rounded" />
                        </div>
                        <div className="mt-4 h-8 w-32 bg-gray-100 rounded" />
                      </div>
                    ))}
                  </div>
                ) : visiblePins.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                      <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{isViewingOwnProfile ? 'No spots yet' : 'No spots yet'}</h3>
                    <p className="text-gray-700 mb-6 max-w-md mx-auto">
                      {isViewingOwnProfile
                        ? 'Start creating spots by clicking on the map to mark your favorite places and musical moments!'
                        : "This user hasn't created any spots yet. Check back later to see their contributions!"}
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {visiblePins.map((pin) => (
                      <div key={pin.id.toString()} className="rounded-2xl p-5 border border-gray-100 bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900 tracking-tight">{pin.name || 'Unnamed Memory'}</h3>
                              {pin.isPrivate && (
                                <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 ring-1 ring-slate-200">
                                  <span>🔒</span>
                                  <span>Private</span>
                                </div>
                              )}
                            </div>
                            {pin.description && (
                              <p className="text-gray-700 text-sm mb-3 leading-relaxed bg-white/60 rounded-lg p-3 border border-gray-100">{pin.description}</p>
                            )}
                          </div>
                          {isViewingOwnProfile && (
                            <div className="ml-4 flex gap-2">
                              <button onClick={() => handleEditPin(pin)} className="px-2.5 py-2 text-blue-700 bg-blue-50/60 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors" title="Edit memory">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button onClick={() => handleDeletePin(pin)} className="px-2.5 py-2 text-red-700 bg-red-50/60 hover:bg-red-100 border border-red-200 rounded-lg transition-colors" title="Delete memory">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-[inset_0_1px_0_0_rgba(0,0,0,0.02)]">
                            <span className="font-semibold text-gray-700 flex items-center mb-1">
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              </svg>
                              Location
                            </span>
                            <p className="font-mono text-[11px] text-gray-600">{formatCoordinates(pin.latitude, pin.longitude)}</p>
                          </div>
                          <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-[inset_0_1px_0_0_rgba(0,0,0,0.02)]">
                            <span className="font-semibold text-gray-700 flex items-center mb-1">
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Created
                            </span>
                            <p className="text-[11px] text-gray-600">{formatDate(pin.id)}</p>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <button onClick={() => handleViewPinOnMap(pin)} className={`text-${getProfileAccentColor()}-700 hover:text-${getProfileAccentColor()}-800 text-sm font-medium flex items-center gap-2 bg-${getProfileAccentColor()}-50/70 hover:bg-${getProfileAccentColor()}-100 px-4 py-2 rounded-lg border border-${getProfileAccentColor()}-100 transition-all`}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>View on Map</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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
              <div className="bg-white/95 rounded-xl border border-gray-100 shadow-sm p-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-2">About</h3>
                {isViewingOwnProfile ? (
                  bio?.trim() ? (
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{bio}</p>
                  ) : (
                    <p className="text-sm text-gray-500">Add a short bio to tell others about you.</p>
                  )
                ) : (
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{''}</p>
                )}
              </div>
              <div className="bg-white/95 rounded-xl border border-gray-100 shadow-sm p-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Stats</h3>
                <div className="flex flex-wrap gap-2">
                  {isViewingOwnProfile ? (
                    <>
                      <span className="text-[12px] px-2.5 py-1 rounded-full bg-gray-50 text-gray-800 border border-gray-200">Total: {visiblePins?.length || 0}</span>
                      <span className="text-[12px] px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">Public: {(userPins || []).filter((p) => !p.isPrivate).length}</span>
                      <span className="text-[12px] px-2.5 py-1 rounded-full bg-slate-50 text-slate-700 border border-slate-200">Private (only you): {(userPins || []).filter((p) => p.isPrivate).length}</span>
                    </>
                  ) : (
                    <span className="text-[12px] px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">Spots: {visiblePins?.length || 0}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Edit Profile Form */}
            {isViewingOwnProfile && isEditing && (
              <div className="px-1">
                <form onSubmit={handleSave} className="bg-white rounded-lg shadow border border-gray-100 p-4 flex flex-col gap-3">
                  <h3 className="text-base font-semibold text-gray-900">Edit Profile</h3>
                  {error && <div className="text-sm text-red-600">{error}</div>}
                  <label className="text-sm text-gray-700">
                    Display name
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </label>
                  <label className="text-sm text-gray-700">
                    Bio
                    <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell others a bit about you (local only for now)" className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[72px]" />
                  </label>
                  <div className="flex gap-2 justify-end mt-2">
                    <button type="button" onClick={handleCancel} className="text-sm px-4 py-2 rounded border border-gray-200 text-gray-700 hover:bg-gray-50">Cancel</button>
                    <button type="submit" disabled={isUploading || saveProfileMutation.isPending} className="text-sm px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50">
                      {isUploading || saveProfileMutation.isPending ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Spots List */}
            <div className="w-full mt-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4">{isViewingOwnProfile ? 'Your Spots' : getDisplayName() + "'s Spots"}</h2>
            {isLoading || isLoadingPins ? (
              <div className="flex flex-col gap-4">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="animate-pulse bg-white/90 rounded-2xl border border-gray-100 p-4">
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
                <p className="text-gray-700 mb-4">{isViewingOwnProfile ? 'Start creating spots by clicking on the map!' : 'No spots yet.'}</p>
              </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {visiblePins
                    .slice()
                    .sort((a, b) => Number(b.id) - Number(a.id))
                    .map((spot) => (
                      <div key={spot.id.toString()} className="bg-white/95 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition border border-gray-100 p-4 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900">{spot.name || 'Unnamed Spot'}</h3>
                          <div className="flex items-center gap-2">
                          {spot.isPrivate && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 ring-1 ring-slate-200">Private</span>
                          )}
                            {isViewingOwnProfile && (
                              <div className="flex gap-2">
                                <button onClick={() => handleEditPin(spot)} className="text-indigo-700 bg-indigo-50/60 hover:bg-indigo-100 border border-indigo-200 text-sm px-2.5 py-1 rounded-md">Edit</button>
                                <button onClick={() => handleDeletePin(spot)} className="text-red-700 bg-red-50/60 hover:bg-red-100 border border-red-200 text-sm px-2.5 py-1 rounded-md">Delete</button>
                              </div>
                          )}
                          </div>
                        </div>
                        {spot.description && <p className="text-gray-700 text-sm leading-relaxed bg-white/60 rounded-lg p-3 border border-gray-100">{spot.description}</p>}
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>Location: {formatCoordinates(spot.latitude, spot.longitude)}</span>
                        </div>
                        <button onClick={() => handleViewPinOnMap(spot)} className="mt-2 inline-flex items-center gap-2 text-indigo-700 hover:text-indigo-800 text-sm font-medium bg-indigo-50/70 hover:bg-indigo-100 px-3 py-1.5 rounded-md border border-indigo-100 transition">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
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
                musicLink: undefined, // Music links are not stored in backend
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
