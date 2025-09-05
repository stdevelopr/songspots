import React, { useRef, useState } from 'react';
import ProfileCard from '../shared/ProfileCard';
import ProfileEditForm from '../forms/ProfileEditForm';
import ProfileAbout from '../shared/ProfileAbout';
import ProfileStats from '../shared/ProfileStats';
import ProfileQuickActions from '../shared/ProfileQuickActions';
import SocialMediaManager, { SocialMediaLink, getPlatformMeta } from '../shared/SocialMediaManager';
import { ProfileMap, ProfileMapRef } from '../../map/components/ProfileMap';
import LoadingState from '../shared/LoadingState';
import EmptyState from '../shared/EmptyState';
import PinGrid from '../pins/PinGrid';
import { useActor } from '../../../common/useActor';
import { useGetUserProfile, useGetUserProfileByPrincipal } from '../../../common/useQueries';
import type { UserProfile } from '../../../../backend/backend.did';

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

  const [socialLinks, setSocialLinks] = useState<SocialMediaLink[]>([]);
  const [isEditingSocial, setIsEditingSocial] = useState(false);
  const { actor } = useActor();

  // Load social links from backend profile (own or other user's)
  const { data: ownProfile } = useGetUserProfile();

  const { data: otherProfile } = useGetUserProfileByPrincipal(userPrincipalId);
  const profileForLinks = isViewingOwnProfile ? ownProfile : otherProfile;

  React.useEffect(() => {
    if (!profileForLinks) {
      setSocialLinks([]);
      return;
    }
    const links: SocialMediaLink[] = [];
    const pushIf = (platform: string, optUrl: [] | [string]) => {
      if (
        Array.isArray(optUrl) &&
        optUrl.length > 0 &&
        typeof optUrl[0] === 'string' &&
        optUrl[0].trim().length > 0
      ) {
        const meta = getPlatformMeta(platform);
        links.push({
          id: platform.toLowerCase(),
          platform,
          url: optUrl[0].trim(),
          icon: meta.icon,
          color: meta.color,
        });
      }
    };
    pushIf('Twitter', profileForLinks.socialMedia?.twitter ?? []);
    pushIf('Facebook', profileForLinks.socialMedia?.facebook ?? []);
    pushIf('Instagram', profileForLinks.socialMedia?.instagram ?? []);
    pushIf('TikTok', profileForLinks.socialMedia?.tiktok ?? []);
    pushIf('YouTube', profileForLinks.socialMedia?.youtube ?? []);
    pushIf('Website', profileForLinks.socialMedia?.website ?? []);
    pushIf('Spotify', profileForLinks.socialMedia?.spotify ?? []);
    pushIf('GitHub', profileForLinks.socialMedia?.github ?? []);
    setSocialLinks(links);
  }, [profileForLinks]);

  const handleRestoreBounds = () => {
    profileMapRef.current?.restoreBounds();
  };

  const handleSocialLinksUpdate = async (newLinks: SocialMediaLink[]) => {
    setSocialLinks(newLinks);
    try {
      if (!actor) return;
      const getUrl = (platform: string): [] | [string] => {
        const found = newLinks.find((l) => l.platform.toLowerCase() === platform.toLowerCase());
        if (found && found.url && found.url.trim().length > 0) {
          return [found.url.trim()];
        }
        return [];
      };
      const rawProfile = await actor.getUserProfile();
      const currentProfile = Array.isArray(rawProfile)
        ? (rawProfile[0] ?? null)
        : (rawProfile ?? null);
      const mergedProfile: UserProfile = {
        name: currentProfile?.name ?? displayName ?? '',
        bio: currentProfile?.bio ?? bio ?? '',
        profilePicture: currentProfile?.profilePicture ?? ([] as [] | [string]),
        socialMedia: {
          facebook: getUrl('Facebook'),
          instagram: getUrl('Instagram'),
          tiktok: getUrl('TikTok'),
          twitter: getUrl('Twitter'),
          website: getUrl('Website'),
          youtube: getUrl('YouTube'),
          spotify: getUrl('Spotify'),
          github: getUrl('GitHub'),
        },
      };
      await actor.saveUserProfile(mergedProfile);
    } catch (e) {
      console.error('Failed to save social links', e);
    }
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

            {/* Stats always visible */}
            <ProfileStats
              visiblePins={visiblePins}
              userPins={userPins}
              isViewingOwnProfile={isViewingOwnProfile}
              isMobile={false}
            />

            {/* Social links visible for own and public profiles; editable only by owner */}
            <SocialMediaManager
              socialLinks={socialLinks}
              onUpdate={handleSocialLinksUpdate}
              isEditing={isViewingOwnProfile ? isEditingSocial : false}
              onToggleEdit={isViewingOwnProfile ? handleToggleSocialEdit : () => {}}
              canEdit={isViewingOwnProfile}
            />
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
