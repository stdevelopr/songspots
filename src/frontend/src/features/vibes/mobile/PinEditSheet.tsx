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
    mood: string;
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
        mood: vibe.mood || '',
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
            {/* Default (no mood) option */}
            {(() => {
              const isSelected = formData.mood === '';
              return (
                <button
                  key="default"
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, mood: '' }))}
                  className={`
                    touch-target p-3 rounded-xl border-2 transition-all duration-200
                    ${isSelected 
                      ? 'border-2 shadow-lg transform scale-105' 
                      : 'border border-gray-200 hover:border-gray-300'
                    }
                  `}
                  style={{
                    borderColor: isSelected ? '#3b82f6' : undefined, // tailwind blue-500
                    backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.08)' : 'white',
                  }}
                >
                  <div className="text-center space-y-1">
                    <div className="text-2xl">⭕️</div>
                    <div className="text-mobile-sm font-medium text-gray-900">
                      Default
                    </div>
                  </div>
                </button>
              );
            })()}
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
        <div className="mobile-card vibe-transition-normal vibe-hover-lift">
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-1">
              <div className="text-2xl mr-3">
                {formData.isPrivate ? '🔒' : '🌍'}
              </div>
              <div className="flex-1">
                <div className="text-mobile-base font-semibold text-gray-900 flex items-center gap-2">
                  {formData.isPrivate ? 'Private Spot' : 'Public Spot'}
                  {formData.isPrivate && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 vibe-animate-bounce-in">
                      Private
                    </span>
                  )}
                </div>
                <div className="text-mobile-sm text-gray-600 mt-1">
                  {formData.isPrivate 
                    ? 'Only visible to you when logged in' 
                    : 'Visible to everyone on the map'
                  }
                </div>
              </div>
            </div>
            
            {/* Enhanced Toggle Switch */}
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, isPrivate: !prev.isPrivate }))}
              className={`
                relative w-16 h-8 rounded-full transition-all duration-300 ease-in-out
                vibe-gpu focus:outline-none focus:ring-4 focus:ring-opacity-25 touch-target
                ${formData.isPrivate 
                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 shadow-lg focus:ring-purple-300' 
                  : 'bg-gray-300 focus:ring-blue-300'
                }
              `}
            >
              <div className={`
                absolute top-1/2 left-1 w-6 h-6 bg-white rounded-full shadow-lg
                transition-all duration-300 ease-in-out vibe-gpu flex items-center justify-center
                -translate-y-1/2 ${formData.isPrivate ? 'translate-x-8' : 'translate-x-0'}
              `}>
                {formData.isPrivate ? (
                  <svg className="w-3 h-3 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              
              {/* Animated background glow effect */}
              <div className={`
                absolute inset-0 rounded-full transition-opacity duration-300
                ${formData.isPrivate 
                  ? 'bg-purple-400 opacity-20 vibe-animate-pulse-glow' 
                  : 'opacity-0'
                }
              `} />
            </button>
          </div>
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
