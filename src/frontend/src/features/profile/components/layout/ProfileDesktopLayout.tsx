import React from 'react';
import ProfileCard from '../shared/ProfileCard';
import ProfileEditForm from '../forms/ProfileEditForm';
import ProfileAbout from '../shared/ProfileAbout';
import ProfileStats from '../shared/ProfileStats';
import ProfileQuickActions from '../shared/ProfileQuickActions';
import { ProfileMap } from '../../map/components/ProfileMap';
import LoadingState from '../shared/LoadingState';
import EmptyState from '../shared/EmptyState';
import PinGrid from '../pins/PinGrid';

interface ProfileDesktopLayoutProps {
  // Profile data
  displayName: string;
  userPrincipalId: string;
  profilePictureUrl?: string;
  headerGradient: string;
  totalCount: number;
  bio: string;
  visiblePins: any[];
  userPins: any[];
  backendPinsForMap: any[];

  // State
  isViewingOwnProfile: boolean;
  isEditing: boolean;
  isLoading: boolean;
  isLoadingPins: boolean;

  // Edit form props
  name: string;
  error: string;
  profilePicturePreview: string | null;
  profilePictureUrl2?: string;
  isUploading: boolean;
  isDragOver: boolean;
  onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBioChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onProfilePictureChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onCancel: () => void;
  onSave: (e: React.FormEvent) => void;

  // Actions
  onEdit: () => void;
  onCopyPrincipal: () => void;
  copied: boolean;

  // Pin operations
  onPinClick: (pinId: string) => void;
  onEditPin: (pin: any) => void;
  onDeletePin: (pin: any) => void;
  onViewPinOnMap: (pin: any) => void;
  spotRefs: React.MutableRefObject<{ [key: string]: HTMLDivElement | null }>;

  // Utility functions
  formatDate: () => string;
  getProfileAccentColor: () => string;

  // Map focus
  focusedMapPinId?: string | null;
}

const ProfileDesktopLayout: React.FC<ProfileDesktopLayoutProps> = ({
  displayName,
  userPrincipalId,
  profilePictureUrl,
  headerGradient,
  totalCount,
  bio,
  visiblePins,
  userPins,
  backendPinsForMap,
  isViewingOwnProfile,
  isEditing,
  isLoading,
  isLoadingPins,
  name,
  error,
  profilePicturePreview,
  profilePictureUrl2,
  isUploading,
  isDragOver,
  onNameChange,
  onBioChange,
  onProfilePictureChange,
  onDragOver,
  onDragLeave,
  onDrop,
  onCancel,
  onSave,
  onEdit,
  onCopyPrincipal,
  copied,
  onPinClick,
  onEditPin,
  onDeletePin,
  onViewPinOnMap,
  spotRefs,
  formatDate,
  getProfileAccentColor,
  focusedMapPinId,
}) => {
  return (
    <div className="hidden lg:flex h-full min-h-0 px-4 lg:px-8 py-6">
      <div className="w-full max-w-6xl mx-auto h-full min-h-0 flex gap-8">
        {/* Left Column - Profile Card and Info */}
        <div className="w-full lg:w-1/3 min-h-0 overflow-y-auto">
          <ProfileCard
            name={displayName}
            principalId={userPrincipalId}
            photoUrl={profilePictureUrl}
            headerGradient={headerGradient}
            totalCount={totalCount}
          />

          {/* Edit Profile Form (Desktop) */}
          {isViewingOwnProfile && isEditing && (
            <div className="mt-4">
              <ProfileEditForm
                name={name}
                bio={bio}
                error={error}
                profilePicturePreview={profilePicturePreview}
                profilePictureUrl={profilePictureUrl2}
                isUploading={isUploading}
                isDragOver={isDragOver}
                onNameChange={onNameChange}
                onBioChange={onBioChange}
                onProfilePictureChange={onProfilePictureChange}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onCancel={onCancel}
                onSave={onSave}
              />
            </div>
          )}

          {/* Profile extras (desktop) */}
          <div className="mt-4 space-y-4">
            <ProfileAbout
              bio={bio}
              isViewingOwnProfile={isViewingOwnProfile}
              isEditing={isEditing}
              onEdit={onEdit}
            />

            <ProfileStats
              visiblePins={visiblePins}
              userPins={userPins}
              isViewingOwnProfile={isViewingOwnProfile}
            />

            <ProfileQuickActions onCopyPrincipal={onCopyPrincipal} copied={copied} />
          </div>
        </div>

        {/* Right Column - Map and Pins */}
        <div className="flex-1 min-h-0 flex flex-col">
          {/* Sticky ProfileMap above the scrollable list */}
          <ProfileMap
            backendPins={backendPinsForMap}
            className="mb-4"
            expandedHeight="270px"
            onPinClick={onPinClick}
            focusedPinId={focusedMapPinId ?? undefined}
          />

          {/* Scrollable container for the spots list */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-md bg-white/95 backdrop-blur-sm">
              <div className="p-6 lg:p-7">
                {isLoading || isLoadingPins ? (
                  <LoadingState />
                ) : visiblePins.length === 0 ? (
                  <EmptyState isViewingOwnProfile={isViewingOwnProfile} />
                ) : (
                  <div className="space-y-4">
                    {visiblePins.map((pin, index) => (
                      <PinGrid
                        key={pin.id.toString()}
                        pin={pin}
                        index={index}
                        isViewingOwnProfile={isViewingOwnProfile}
                        onEdit={onEditPin}
                        onDelete={onDeletePin}
                        onViewOnMap={onViewPinOnMap}
                        formatDate={formatDate}
                        getProfileAccentColor={getProfileAccentColor}
                        spotRef={(el) => (spotRefs.current[pin.id.toString()] = el)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDesktopLayout;
