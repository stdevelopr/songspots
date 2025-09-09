import React, { useRef, useState } from 'react';
import ProfileCard from '../shared/ProfileCard';
import ProfileAbout from '../shared/ProfileAbout';
import ProfileStats from '../shared/ProfileStats';
import SocialMediaManager, { SocialMediaLink, getPlatformMeta } from '../shared/SocialMediaManager';
import { ProfileMap, ProfileMapRef } from '../../map/components/ProfileMap';
import ProfileSpotList from '../vibes/ProfileSpotList';
import { useActor, useGetUserProfile, useGetUserProfileByPrincipal } from '@common';
import type { UserProfile } from '@backend/backend.did';

interface ProfileMobileLayoutProps {
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
  selectedPinId: string | null;
  focusedPinId?: string | null;

  // Actions
  onEdit: () => void;

  // Pin operations
  onPinClick: (pinId: string, onRestoreBounds?: () => void) => void; // list item click
  onMapPinClick: (pinId: string) => void; // map marker click
  onEditPin: (pin: any) => void;
  onDeletePin: (pin: any) => void;
  onResetSelection?: () => void;

  // Edit form component
  editFormComponent?: React.ReactNode;
}

const ProfileMobileLayout: React.FC<ProfileMobileLayoutProps> = ({
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
  selectedPinId,
  focusedPinId,
  onEdit,
  onPinClick,
  onMapPinClick,
  onEditPin,
  onDeletePin,
  onResetSelection,
  editFormComponent,
}) => {
  const profileMapRef = useRef<ProfileMapRef>(null);

  // TODO: This should be stored in backend/database and loaded from user profile
  const [socialLinks, setSocialLinks] = useState<SocialMediaLink[]>([
    {
      id: '1',
      platform: 'Twitter',
      url: 'https://twitter.com/username',
      icon: 'M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z',
      color:
        'from-blue-50 to-blue-100 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-blue-200 hover:text-blue-800',
    },
  ]);
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
          url: optUrl[0]!.trim(),
          icon: meta?.icon,
          color: meta?.color,
        });
      }
    };

    pushIf('Twitter', profileForLinks.socialMedia?.twitter ?? []);
    pushIf('Facebook', profileForLinks.socialMedia?.facebook ?? []);
    pushIf('Instagram', profileForLinks.socialMedia?.instagram ?? []);
    pushIf('TikTok', profileForLinks.socialMedia?.tiktok ?? []);
    pushIf('YouTube', profileForLinks.socialMedia?.youtube ?? []);
    pushIf('Website', profileForLinks.socialMedia?.website ?? []);

    setSocialLinks(links);
  }, [profileForLinks]);

  const handleRestoreBounds = () => {
    profileMapRef.current?.restoreBounds();
  };

  const handleSocialLinksUpdate = async (newLinks: SocialMediaLink[]) => {
    setSocialLinks(newLinks);

    try {
      if (!actor) {
        console.warn('Actor not available; cannot save social links');
        return;
      }

      // Map UI links -> backend socialMedia record (opt text as [] | [text])
      const getUrl = (platform: string): [] | [string] => {
        const found = newLinks.find((l) => l.platform.toLowerCase() === platform.toLowerCase());
        if (found && found.url && found.url.trim().length > 0) {
          return [found.url.trim()];
        }
        return [];
      };

      // Fetch current profile to preserve name/bio/profilePicture
      const rawProfile = await actor.getUserProfile();
      const currentProfile = Array.isArray(rawProfile)
        ? (rawProfile[0] ?? null)
        : (rawProfile ?? null);

      const mergedProfile = {
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
        },
      };

      await actor.saveUserProfile(mergedProfile as UserProfile);
      console.log('Social links saved');
    } catch (err) {
      console.error('Failed to save social links', err);
    }
  };

  const handleToggleSocialEdit = () => {
    setIsEditingSocial(!isEditingSocial);
  };

  return (
    <>
      <style>{`
        .mobile-custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .mobile-custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .mobile-custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #d1d5db;
          border-radius: 3px;
        }
        .mobile-custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #9ca3af;
        }
      `}</style>
      <div 
        className="overflow-y-auto mobile-custom-scrollbar" 
        style={{ 
          height: 'calc(100vh - 3rem)',
          scrollbarWidth: 'thin',
          scrollbarColor: '#d1d5db transparent',
          paddingBottom: '1rem'
        }}
      >
      <div className="w-full max-w-2xl mx-auto px-3 py-3">
        <ProfileCard
          name={displayName}
          principalId={userPrincipalId}
          photoUrl={profilePictureUrl}
          headerGradient={headerGradient}
          totalCount={totalCount}
          visiblePins={visiblePins}
          userPins={userPins}
          isViewingOwnProfile={isViewingOwnProfile}
        />

        <div className="pt-3 pb-6">
          {/* Profile extras (mobile) */}
          <div className="space-y-3">
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
              isMobile={true}
            />

            {/* Social links, visible on both own and public profiles. Editable only by owner. */}
            {!isEditing && (
              <SocialMediaManager
                socialLinks={socialLinks}
                onUpdate={handleSocialLinksUpdate}
                isEditing={isViewingOwnProfile ? isEditingSocial : false}
                onToggleEdit={isViewingOwnProfile ? handleToggleSocialEdit : () => {}}
                canEdit={isViewingOwnProfile}
              />
            )}
          </div>

          {/* Edit Profile Form (Mobile) */}
          {editFormComponent}

          {/* ProfileMap for mobile - positioned after all profile info */}
          <ProfileMap
            ref={profileMapRef}
            backendPins={backendPinsForMap}
            className="mt-4 mb-6"
            expandedHeight="200px"
            onPinClick={onMapPinClick}
            focusedPinId={focusedPinId || undefined}
            highlightedPinId={selectedPinId || undefined}
            onResetSelection={onResetSelection}
          />

          {/* Spots List */}
          <div className="w-full">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {isViewingOwnProfile ? 'Your Spots' : displayName + "'s Spots"}
            </h2>
            <ProfileSpotList
              spots={visiblePins}
              isViewingOwnProfile={isViewingOwnProfile}
              isLoading={isLoading || isLoadingPins}
              onEdit={onEditPin}
              onDelete={onDeletePin}
              selectedPinId={selectedPinId}
              focusedPinId={focusedPinId}
              onPinClick={(pinId: string) => {
                // Auto-expand map if collapsed
                profileMapRef.current?.expandMap();
                // Then handle the pin click
                onPinClick(pinId, handleRestoreBounds);
              }}
            />
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default ProfileMobileLayout;
