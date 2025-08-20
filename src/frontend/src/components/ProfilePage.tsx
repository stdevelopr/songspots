import React from 'react';

interface ProfilePageProps {
  onBackToMap: () => void;
  userId: string | null;
  onViewPinOnMap: (pinId: string, lat: number, lng: number, fromProfileFlag?: boolean) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ onBackToMap, userId, onViewPinOnMap }) => {
  return (
    <div>
      <h2>Profile Page Placeholder</h2>
      <p>User ID: {userId ?? 'No user selected'}</p>
      <button onClick={onBackToMap}>Back to Map</button>
      {/* Add more profile details and functionality here */}
    </div>
  );
};

export default ProfilePage;
