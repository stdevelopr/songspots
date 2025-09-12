import React, { useState, useEffect, useMemo } from 'react';
import { BottomSheet } from '../../../components/mobile/BottomSheet';
import { getAllMoods } from '@common/types/moods';

interface PinCreateSheetProps {
  isOpen: boolean;
  location: { lat: number; lng: number } | null;
  onSubmit: (data: {
    name: string;
    description: string;
    musicLink: string;
    isPrivate: boolean;
    mood: string;
    lat: number;
    lng: number;
  }) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const PinCreateSheet: React.FC<PinCreateSheetProps> = ({
  isOpen,
  location,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const moods = useMemo(() => getAllMoods(), []); // Memoize moods array
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    musicLink: '',
    isPrivate: false,
    mood: '', // Start with no mood selected
  });

  // Reset form when opening
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        description: '',
        musicLink: '',
        isPrivate: false,
        mood: '', // Start with no mood selected
      });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location) return;

    // Validate required fields
    if (!formData.mood) {
      alert('Please select a mood for your vibe spot');
      return;
    }

    if (!formData.name.trim()) {
      alert('Please enter a name for your vibe spot');
      return;
    }

    try {
      await onSubmit({
        ...formData,
        lat: location.lat,
        lng: location.lng,
      });
    } catch (error) {
      console.error('Failed to create vibe:', error);
    }
  };

  const selectedMood = moods.find(m => m.id === formData.mood);

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onCancel}
      title="Create New Spot"
      snapPoints={[0.9]}
      initialSnapPoint={0}
      showHandle={true}
      closeOnOverlayClick={false}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Location Info */}
        {location && (
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-mobile-sm font-medium text-blue-900">
                  Creating spot at this location
                </p>
                <p className="text-mobile-xs text-blue-600">
                  {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                </p>
              </div>
            </div>
          </div>
        )}

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
            autoFocus
          />
          <p className="text-mobile-xs text-gray-500 mt-1">
            {formData.name.length}/50 characters
          </p>
        </div>

        {/* Mood Selection */}
        <div>
          <label className="block text-mobile-base font-semibold text-gray-900 mb-3">
            What's the vibe? *
          </label>
          {!formData.mood && (
            <p className="text-mobile-sm text-gray-500 mb-3">
              Choose a mood that best describes this spot
            </p>
          )}
          <div className="grid grid-cols-2 gap-3">
            {moods.map((mood) => {
              const isSelected = formData.mood === mood.id;
              
              return (
                <button
                  key={mood.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, mood: mood.id }))}
                  className={`
                    touch-target p-3 rounded-xl border-2 vibe-transition-normal vibe-hover-lift
                    mobile-interactive vibe-gpu
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
                    <div className="text-mobile-xs text-gray-600">
                      {mood.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
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
            placeholder="Describe what makes this place special..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-mobile-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            maxLength={200}
          />
          <p className="text-mobile-xs text-gray-500 mt-1">
            {formData.description.length}/200 characters
          </p>
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
            disabled={isSubmitting || !formData.name.trim() || !formData.mood}
            className="w-full mobile-button touch-target text-mobile-base font-medium disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                Creating...
              </>
            ) : (
              'Create Spot'
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

export default PinCreateSheet;