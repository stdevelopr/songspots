import React, { useState } from 'react';
import { VibeInfoPopup } from '@features/vibes';
import type { Pin } from '@features/map/types/map';

const mockPin: Pin = {
  id: 'demo-1' as any,
  name: 'Demo Memory',
  description: 'A short demo description for the popup refactor.',
  musicLink: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  isOwner: true,
  isPrivate: false,
  lat: 0,
  lng: 0,
  owner: null as any,
  timestamp: Date.now(),
};

const VibeInfoPopupDemo: React.FC = () => {
  const [open, setOpen] = useState(true);

  if (!open) {
    return (
      <div className="p-4">
        <button
          className="px-3 py-2 rounded bg-blue-600 text-white"
          onClick={() => setOpen(true)}
        >
          Open Demo Popup
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
      <VibeInfoPopup
        vibe={mockPin}
        onViewProfile={() => alert('View profile')}
        onEdit={() => alert('Edit')}
        onDelete={() => alert('Delete')}
        onClose={() => setOpen(false)}
        showPrivacy
        showTimestamp
        modalLayout
      />
    </div>
  );
};

export default VibeInfoPopupDemo;
