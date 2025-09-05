import React, { useRef } from 'react';
import ProfileCard from '../shared/ProfileCard';
import ProfileAbout from '../shared/ProfileAbout';
import ProfileStats from '../shared/ProfileStats';
import { ProfileMap, ProfileMapRef } from '../../map/components/ProfileMap';
import ProfileSpotList from '../pins/ProfileSpotList';

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

  const handleRestoreBounds = () => {
    profileMapRef.current?.restoreBounds();
  };

  return (
    <div className="lg:hidden h-full min-h-0 overflow-y-auto">
      <div className="w-full max-w-2xl mx-auto px-3 py-3">
        <ProfileCard
          name={displayName}
          principalId={userPrincipalId}
          photoUrl={profilePictureUrl}
          headerGradient={headerGradient}
          totalCount={totalCount}
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
  );
};

export default ProfileMobileLayout;
