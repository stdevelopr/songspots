import React, { useState, useEffect } from 'react';
import { useProfileState } from './hooks/useProfileState';
import { useProfilePicture } from './hooks/useProfilePicture';
import { usePinOperations } from './hooks/usePinOperations';
import { useProfileActions } from './hooks/useProfileActions';
import ProfileDesktopLayout from './components/layout/ProfileDesktopLayout';
import ProfileMobileLayout from './components/layout/ProfileMobileLayout';
import ProfileMobileEditForm from './components/forms/ProfileMobileEditForm';
import DeleteConfirmationModal from '../common/DeleteConfirmationModal';
import PinEditModal from '../pins/PinEditModal';
import { PIN_HIGHLIGHT_STYLES } from './styles/profileStyles';

interface ProfilePageProps {
  userId?: string | null;
  onViewPinOnMap?: (pinId: string, lat: number, lng: number, fromProfile?: boolean) => void;
  onBackToMap?: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ userId }) => {
  // State for focused and hovered pins in profile map
  const [focusedMapPinId, setFocusedMapPinId] = useState<string | null>(null);

  // Initialize all hooks
  const profileState = useProfileState({ userId });
  const profilePicture = useProfilePicture({
    userProfile: profileState.userProfile,
    onToast: (message: string) => profileActions.showToastMessage(message),
  });
  const pinOperations = usePinOperations({
    visiblePins: profileState.visiblePins,
    onFocusMapPin: setFocusedMapPinId,
  });
  const profileActions = useProfileActions({
    userProfile: profileState.userProfile,
    isViewingOwnProfile: profileState.isViewingOwnProfile,
    name: profileState.name,
    setName: profileState.setName,
    bio: profileState.bio,
    setBio: profileState.setBio,
    setError: profileState.setError,
    setIsEditing: profileState.setIsEditing,
    getProfilePictureForSave: profilePicture.getProfilePictureForSave,
    resetProfilePicture: profilePicture.resetProfilePicture,
  });

  console.log('focused Pin:', focusedMapPinId);

  // Clear focused pin after 5 seconds
  useEffect(() => {
    if (focusedMapPinId) {
      const timer = setTimeout(() => {
        setFocusedMapPinId(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [focusedMapPinId]);

  // Mobile edit form component
  const mobileEditForm =
    profileState.isViewingOwnProfile && profileState.isEditing ? (
      <ProfileMobileEditForm
        name={profileState.name}
        bio={profileState.bio}
        error={profileState.error}
        profilePicturePreview={profilePicture.profilePicturePreview}
        profilePictureUrl={profilePicture.profilePictureUrl}
        isUploading={profilePicture.isUploading}
        saveProfileMutation={profileActions.saveProfileMutation}
        onNameChange={(e) => profileState.setName(e.target.value)}
        onBioChange={(e) => profileState.setBio(e.target.value)}
        onProfilePictureChange={profilePicture.handleProfilePictureChange}
        onCancel={profileActions.handleCancel}
        onSave={profileActions.handleSave}
        onRemoveProfilePicture={profilePicture.handleRemoveProfilePicture}
        showToastMessage={profileActions.showToastMessage}
      />
    ) : null;

  return (
    <div className="h-full min-h-0 bg-gray-50 flex flex-col text-gray-800">
      <style>{PIN_HIGHLIGHT_STYLES}</style>

      {/* Desktop Layout */}
      <ProfileDesktopLayout
        displayName={profileState.getDisplayName()}
        userPrincipalId={profileState.getUserPrincipalId()}
        profilePictureUrl={profilePicture.profilePictureUrl}
        headerGradient={profileActions.getProfileHeaderGradient()}
        totalCount={profileState.visiblePins?.length || 0}
        bio={profileState.bio}
        visiblePins={profileState.visiblePins}
        userPins={profileState.userPins}
        backendPinsForMap={profileState.backendPinsForMap}
        isViewingOwnProfile={profileState.isViewingOwnProfile}
        isEditing={profileState.isEditing}
        isLoading={profileState.isLoading}
        isLoadingPins={profileState.isLoadingPins}
        name={profileState.name}
        error={profileState.error}
        profilePicturePreview={profilePicture.profilePicturePreview}
        profilePictureUrl2={profilePicture.profilePictureUrl}
        isUploading={profilePicture.isUploading}
        isDragOver={profilePicture.isDragOver}
        onNameChange={(e) => profileState.setName(e.target.value)}
        onBioChange={(e) => profileState.setBio(e.target.value)}
        onProfilePictureChange={profilePicture.handleProfilePictureChange}
        onDragOver={profilePicture.handleDragOver}
        onDragLeave={profilePicture.handleDragLeave}
        onDrop={profilePicture.handleDrop}
        onCancel={profileActions.handleCancel}
        onSave={profileActions.handleSave}
        onEdit={() => profileState.setIsEditing(true)}
        onCopyPrincipal={profileActions.handleCopyPrincipal}
        copied={profileActions.copied}
        onPinClick={pinOperations.handlePinClick}
        onEditPin={pinOperations.handleEditPin}
        onDeletePin={pinOperations.handleDeletePin}
        onViewPinOnMap={pinOperations.handleViewPinOnMap}
        spotRefs={pinOperations.spotRefs}
        formatDate={profileActions.formatDate}
        getProfileAccentColor={profileActions.getProfileAccentColor}
        focusedMapPinId={focusedMapPinId}
      />

      {/* Mobile Layout */}
      <ProfileMobileLayout
        displayName={profileState.getDisplayName()}
        userPrincipalId={profileState.getUserPrincipalId()}
        profilePictureUrl={profilePicture.profilePictureUrl}
        headerGradient={profileActions.getProfileHeaderGradient()}
        totalCount={profileState.visiblePins?.length || 0}
        bio={profileState.bio}
        visiblePins={profileState.visiblePins}
        userPins={profileState.userPins}
        backendPinsForMap={profileState.backendPinsForMap}
        isViewingOwnProfile={profileState.isViewingOwnProfile}
        isEditing={profileState.isEditing}
        isLoading={profileState.isLoading}
        isLoadingPins={profileState.isLoadingPins}
        selectedPinId={pinOperations.selectedPinId}
        onEdit={() => profileState.setIsEditing(true)}
        onPinClick={pinOperations.handlePinClick}
        onEditPin={pinOperations.handleEditPin}
        onDeletePin={pinOperations.handleDeletePin}
        onViewPinOnMap={pinOperations.handleViewPinOnMap}
        editFormComponent={mobileEditForm}
        focusedMapPinId={focusedMapPinId}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={pinOperations.showDeleteModal}
        onConfirm={pinOperations.handleDeleteConfirm}
        onCancel={pinOperations.handleDeleteCancel}
        isDeleting={pinOperations.deletePinMutation.isPending}
        pinName={pinOperations.pinToDelete?.name || 'Unnamed Pin'}
      />

      {/* Pin Edit Modal */}
      <PinEditModal
        isOpen={pinOperations.showEditModal}
        pin={
          pinOperations.pinToEdit
            ? {
                id: pinOperations.pinToEdit.id.toString(),
                name: pinOperations.pinToEdit.name,
                description: pinOperations.pinToEdit.description,
                musicLink: pinOperations.pinToEdit.musicLink,
                isPrivate: pinOperations.pinToEdit.isPrivate,
              }
            : null
        }
        onSubmit={pinOperations.handleEditSubmit}
        onCancel={pinOperations.handleEditCancel}
        isSubmitting={pinOperations.updatePinMutation.isPending}
      />

      {/* Toast */}
      {profileActions.showToast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-black/80 text-white text-sm px-3 py-2 rounded shadow">
          {profileActions.toastMessage}
        </div>
      )}

      {/* Keyboard navigation hint */}
      {profileState.visiblePins.length > 0 && (
        <div className="keyboard-hint" id="keyboard-hint">
          ↑↓ Navigate pins • Home/End Jump • Click pin to scroll
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
