import React from 'react';
import ProfileCard from '../ProfileCard';
import ProfileAbout from './ProfileAbout';
import ProfileStats from './ProfileStats';
import { ProfileMap } from '../ProfileMap';
import ProfileSpotList from '../ProfileSpotList';

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
  
  // Actions
  onEdit: () => void;
  
  // Pin operations
  onPinClick: (pinId: string) => void;
  onEditPin: (pin: any) => void;
  onDeletePin: (pin: any) => void;
  onViewPinOnMap: (pin: any) => void;
  
  // Edit form component
  editFormComponent?: React.ReactNode;
  
  // Map focus
  focusedMapPinId?: string | null;
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
  onEdit,
  onPinClick,
  onEditPin,
  onDeletePin,
  onViewPinOnMap,
  editFormComponent,
  focusedMapPinId,
}) => {
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
            backendPins={backendPinsForMap}
            className="mt-4 mb-6"
            expandedHeight="200px"
            onPinClick={onPinClick}
            focusedPinId={focusedMapPinId}
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
              onViewOnMap={onViewPinOnMap}
              selectedPinId={selectedPinId}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileMobileLayout;