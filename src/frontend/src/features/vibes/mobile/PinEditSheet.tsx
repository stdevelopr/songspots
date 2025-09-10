import React, { useState, useEffect } from 'react';
import { BottomSheet } from '../../../components/mobile/BottomSheet';
import { getAllMoods } from '@common/types/moods';
import type { Pin } from '../../map/types/map';

interface PinEditSheetProps {
  vibe: {
    id: string;
    name: string;
    description: string;
    musicLink: string;
    isPrivate: boolean;
    mood: { id: string; name: string; emoji: string } | null;
  } | null;
  isOpen: boolean;
  onSubmit: (data: {
    id: string;
    name: string;
    description: string;
    musicLink: string;
    isPrivate: boolean;
    mood: string;
  }) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const PinEditSheet: React.FC<PinEditSheetProps> = ({
  vibe,
  isOpen,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    musicLink: '',
    isPrivate: false,
    mood: '',
  });

  const moods = getAllMoods();

  useEffect(() => {
    if (vibe) {
      setFormData({
        name: vibe.name || '',
        description: vibe.description || '',
        musicLink: vibe.musicLink || '',
        isPrivate: vibe.isPrivate || false,
        mood: vibe.mood?.id || '',
      });
    }
  }, [vibe]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vibe) return;

    try {
      await onSubmit({
        id: vibe.id,
        ...formData,
      });
    } catch (error) {
      console.error('Failed to update vibe:', error);
    }
  };

  const selectedMood = moods.find(m => m.id === formData.mood);

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onCancel}
      title="Edit Spot"
      snapPoints={[0.9]}
      initialSnapPoint={0}
      showHandle={true}
      closeOnOverlayClick={false}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-mobile-base font-semibold text-gray-900 mb-2">
            Spot Name *
          </label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="What's this place called?"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-mobile-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            maxLength={50}
          />
          <p className="text-mobile-xs text-gray-500 mt-1">
            {formData.name.length}/50 characters
          </p>
        </div>

        {/* Description Field */}
        <div>
          <label htmlFor="description" className="block text-mobile-base font-semibold text-gray-900 mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe the vibe of this place..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-mobile-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            maxLength={200}
          />
          <p className="text-mobile-xs text-gray-500 mt-1">
            {formData.description.length}/200 characters
          </p>
        </div>

        {/* Mood Selection */}
        <div>
          <label className="block text-mobile-base font-semibold text-gray-900 mb-3">
            Mood
          </label>
          <div className="grid grid-cols-2 gap-3">
            {moods.map((mood) => {
              const isSelected = formData.mood === mood.id;
              
              return (
                <button
                  key={mood.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, mood: mood.id }))}
                  className={`
                    touch-target p-3 rounded-xl border-2 transition-all duration-200
                    ${isSelected 
                      ? 'border-2 shadow-lg transform scale-105' 
                      : 'border border-gray-200 hover:border-gray-300'
                    }
                  `}
                  style={{
                    borderColor: isSelected ? mood.colors.primary : undefined,
                    backgroundColor: isSelected ? `${mood.colors.primary}15` : 'white',
                  }}
                >
                  <div className="text-center space-y-1">
                    <div className="text-2xl">{mood.emoji}</div>
                    <div className="text-mobile-sm font-medium text-gray-900">
                      {mood.name}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Music Link Field */}
        <div>
          <label htmlFor="musicLink" className="block text-mobile-base font-semibold text-gray-900 mb-2">
            Music Link
          </label>
          <input
            id="musicLink"
            type="url"
            value={formData.musicLink}
            onChange={(e) => setFormData(prev => ({ ...prev, musicLink: e.target.value }))}
            placeholder="https://spotify.com/..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-mobile-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-mobile-xs text-gray-500 mt-1">
            Share a song that captures this spot's vibe
          </p>
        </div>

        {/* Privacy Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex-1">
            <h4 className="text-mobile-base font-semibold text-gray-900">
              Private Spot
            </h4>
            <p className="text-mobile-sm text-gray-600">
              Only you can see this spot
            </p>
          </div>
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, isPrivate: !prev.isPrivate }))}
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              ${formData.isPrivate ? 'bg-blue-600' : 'bg-gray-200'}
            `}
          >
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                ${formData.isPrivate ? 'translate-x-6' : 'translate-x-1'}
              `}
            />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={isSubmitting || !formData.name.trim()}
            className="w-full mobile-button touch-target text-mobile-base font-medium disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                Updating...
              </>
            ) : (
              'Update Spot'
            )}
          </button>
          
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="w-full mobile-button-secondary touch-target text-mobile-base font-medium"
          >
            Cancel
          </button>
        </div>

        {/* Bottom spacing for safe area */}
        <div className="pb-safe" />
      </form>
    </BottomSheet>
  );
};

export default PinEditSheet;