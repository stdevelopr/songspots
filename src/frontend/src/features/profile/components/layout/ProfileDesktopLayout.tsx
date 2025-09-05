import React, { useRef, useState } from 'react';
import ProfileCard from '../shared/ProfileCard';
import ProfileEditForm from '../forms/ProfileEditForm';
import ProfileAbout from '../shared/ProfileAbout';
import ProfileStats from '../shared/ProfileStats';
import ProfileQuickActions from '../shared/ProfileQuickActions';
import SocialMediaManager, { SocialMediaLink } from '../shared/SocialMediaManager';
import { ProfileMap, ProfileMapRef } from '../../map/components/ProfileMap';
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
  onPinClick: (pinId: string, onRestoreBounds?: () => void) => void; // list item click
  onMapPinClick: (pinId: string) => void; // map marker click
  onEditPin: (pin: any) => void;
  onDeletePin: (pin: any) => void;
  onResetSelection?: () => void;
  spotRefs: React.MutableRefObject<{ [key: string]: HTMLDivElement | null }>;
  focusedPinId?: string | null;
  selectedPinId?: string | null;

  // Utility functions
  formatDate: () => string;
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
  onMapPinClick,
  onEditPin,
  onDeletePin,
  onResetSelection,
  spotRefs,
  formatDate,
  focusedPinId,
  selectedPinId,
}) => {
  const profileMapRef = useRef<ProfileMapRef>(null);
  
  // TODO: This should be stored in backend/database and loaded from user profile
  const [socialLinks, setSocialLinks] = useState<SocialMediaLink[]>([
    {
      id: '1',
      platform: 'Twitter',
      url: 'https://twitter.com/username',
      icon: 'M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z',
      color: 'from-blue-50 to-blue-100 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-blue-200 hover:text-blue-800'
    }
  ]);
  const [isEditingSocial, setIsEditingSocial] = useState(false);

  const handleRestoreBounds = () => {
    profileMapRef.current?.restoreBounds();
  };

  const handleSocialLinksUpdate = (newLinks: SocialMediaLink[]) => {
    setSocialLinks(newLinks);
    // TODO: Save to backend/database
    console.log('Social links updated:', newLinks);
  };

  const handleToggleSocialEdit = () => {
    setIsEditingSocial(!isEditingSocial);
  };

  return (
    <div className="hidden lg:flex h-full min-h-0 px-4 lg:px-8 py-6">
      <div className="w-full max-w-7xl mx-auto h-full min-h-0 flex gap-6">
        {/* Left Column - Profile Card and Info */}
        <div className="w-full lg:w-80 xl:w-96 flex-shrink-0 min-h-0 overflow-y-auto">
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

          {/* Enhanced Profile Section */}
          <div className="mt-4 space-y-4">
            <ProfileAbout
              bio={bio}
              isViewingOwnProfile={isViewingOwnProfile}
              isEditing={isEditing}
              onEdit={onEdit}
            />

            {/* Conditional Content: Social Media Manager for own profile, Stats for others */}
            {isViewingOwnProfile && !isEditing ? (
              <SocialMediaManager
                socialLinks={socialLinks}
                onUpdate={handleSocialLinksUpdate}
                isEditing={isEditingSocial}
                onToggleEdit={handleToggleSocialEdit}
              />
            ) : (
              /* ProfileStats for other users' profiles or when editing */
              <ProfileStats
                visiblePins={visiblePins}
                userPins={userPins}
                isViewingOwnProfile={isViewingOwnProfile}
                isMobile={false}
              />
            )}
          </div>
        </div>

        {/* Right Column - Map and Pins */}
        <div className="flex-1 min-h-0 flex flex-col">
          {/* Sticky ProfileMap above the scrollable list */}
          <ProfileMap
            ref={profileMapRef}
            backendPins={backendPinsForMap}
            className="mb-4"
            expandedHeight="270px"
            onPinClick={onMapPinClick}
            focusedPinId={focusedPinId || undefined}
            highlightedPinId={selectedPinId || undefined}
            onResetSelection={onResetSelection}
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
                        formatDate={formatDate}
                        spotRef={(el) => (spotRefs.current[pin.id.toString()] = el)}
                        onPinClick={(pinId: string) => {
                          // Auto-expand map if collapsed
                          profileMapRef.current?.expandMap();
                          // Then handle the pin click
                          onPinClick(pinId, handleRestoreBounds);
                        }}
                        isHighlighted={selectedPinId === pin.id.toString()}
                        isFocused={focusedPinId === pin.id.toString()}
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
