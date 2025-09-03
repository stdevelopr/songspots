import React from 'react';
import ProfileCard from '../ProfileCard';
import ProfileEditForm from '../ProfileEditForm';
import ProfileAbout from './ProfileAbout';
import ProfileStats from './ProfileStats';
import ProfileQuickActions from './ProfileQuickActions';
import { ProfileMap } from '../ProfileMap';
import LoadingState from './LoadingState';
import EmptyState from './EmptyState';
import PinGrid from './PinGrid';

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
  
  // Map focus and hover
  focusedMapPinId?: string | null;
  hoveredMapPinId?: string | null;
  onPinHover?: (pin: any) => void;
  onPinHoverEnd?: () => void;
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
  hoveredMapPinId,
  onPinHover,
  onPinHoverEnd,
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
            
            <ProfileQuickActions
              onCopyPrincipal={onCopyPrincipal}
              copied={copied}
            />
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
            focusedPinId={focusedMapPinId}
            hoveredPinId={hoveredMapPinId}
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
                  <div className="grid grid-cols-2 gap-6">
                    {visiblePins.map((pin, index) => (
                      <PinGrid
                        key={pin.id.toString()}
                        pin={pin}
                        index={index}
                        isViewingOwnProfile={isViewingOwnProfile}
                        onEdit={onEditPin}
                        onDelete={onDeletePin}
                        onViewOnMap={onViewPinOnMap}
                        onMouseEnter={onPinHover}
                        onMouseLeave={onPinHoverEnd}
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