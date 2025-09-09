import React from 'react';
import { ResponsiveComponent } from '@common';
import { useProfileState } from './hooks/useProfileState';
import { useProfilePicture } from './hooks/useProfilePicture';
import { useVibeOperations } from './hooks/useVibeOperations';
import { useProfileActions } from './hooks/useProfileActions';
import ProfileDesktopLayout from './components/layout/ProfileDesktopLayout';
import ProfileMobileLayout from './components/layout/ProfileMobileLayout';
import ProfileMobileEditForm from './components/forms/ProfileMobileEditForm';
import { DeleteConfirmationModal } from '@common';
import { VibeEditModal } from '@features/vibes';
import { PIN_HIGHLIGHT_STYLES } from './styles/profileStyles';
import { MoodType } from '@common/types/moods';

interface ProfilePageProps {
  userId?: string | null;
  onBackToMap?: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ userId, onBackToMap }) => {
  // Initialize all hooks
  const profileState = useProfileState({ userId });
  const profilePicture = useProfilePicture({
    userProfile: profileState.userProfile,
    onToast: (message: string) => profileActions.showToastMessage(message),
  });
  const vibeOperations = useVibeOperations({
    visibleVibes: profileState.visiblePins,
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
      <ResponsiveComponent showOnDesktop hideOnTablet hideOnMobile>
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
          saveProfileMutation={profileActions.saveProfileMutation}
          onNameChange={(e) => profileState.setName(e.target.value)}
          onBioChange={(e) => profileState.setBio(e.target.value)}
          onProfilePictureChange={profilePicture.handleProfilePictureChange}
          onDragOver={profilePicture.handleDragOver}
          onDragLeave={profilePicture.handleDragLeave}
          onDrop={profilePicture.handleDrop}
          onCancel={profileActions.handleCancel}
          onSave={profileActions.handleSave}
          onEdit={() => profileState.setIsEditing(true)}
          onPinClick={vibeOperations.handleVibeClick}
          onMapPinClick={vibeOperations.handleMapMarkerClick}
          onEditPin={vibeOperations.handleEditVibe}
          onDeletePin={vibeOperations.handleDeleteVibe}
          onResetSelection={vibeOperations.resetSelection}
          spotRefs={vibeOperations.spotRefs}
          formatDate={profileActions.formatDate}
          focusedPinId={vibeOperations.focusedVibeId}
          selectedPinId={vibeOperations.selectedVibeId}
          onBackToMap={onBackToMap}
        />
      </ResponsiveComponent>

      {/* Mobile Layout */}
      <ResponsiveComponent showOnMobile showOnTablet hideOnDesktop>
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
          selectedPinId={vibeOperations.selectedVibeId}
          focusedPinId={vibeOperations.focusedVibeId}
          onEdit={() => profileState.setIsEditing(true)}
          onPinClick={vibeOperations.handleVibeClick}
          onMapPinClick={vibeOperations.handleMapMarkerClick}
          onEditPin={vibeOperations.handleEditVibe}
          onDeletePin={vibeOperations.handleDeleteVibe}
          onResetSelection={vibeOperations.resetSelection}
          editFormComponent={mobileEditForm}
        />
      </ResponsiveComponent>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={vibeOperations.showDeleteModal}
        onConfirm={vibeOperations.handleDeleteConfirm}
        onCancel={vibeOperations.handleDeleteCancel}
        isDeleting={vibeOperations.deleteVibeMutation.isPending}
        pinName={vibeOperations.vibeToDelete?.name || 'Unnamed Vibe'}
      />

      {/* Vibe Edit Modal */}
      <VibeEditModal
        isOpen={vibeOperations.showEditModal}
        vibe={
          vibeOperations.vibeToEdit
            ? {
                id: vibeOperations.vibeToEdit.id.toString(),
                name: vibeOperations.vibeToEdit.name,
                description: vibeOperations.vibeToEdit.description,
                musicLink: vibeOperations.vibeToEdit.musicLink,
                isPrivate: vibeOperations.vibeToEdit.isPrivate,
                mood: vibeOperations.vibeToEdit.mood && vibeOperations.vibeToEdit.mood.length > 0 
                  ? vibeOperations.vibeToEdit.mood[0] as MoodType 
                  : undefined,
              }
            : null
        }
        onSubmit={vibeOperations.handleEditSubmit}
        onCancel={vibeOperations.handleEditCancel}
        isSubmitting={vibeOperations.updateVibeMutation.isPending}
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
