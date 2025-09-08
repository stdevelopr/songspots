export type MoodType = 
  | 'energetic'
  | 'chill' 
  | 'creative'
  | 'romantic'
  | 'peaceful'
  | 'party'
  | 'mysterious';

export interface Mood {
  id: MoodType;
  name: string;
  emoji: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    gradient: string;
  };
}

export const MOODS: Record<MoodType, Mood> = {
  energetic: {
    id: 'energetic',
    name: 'Energetic',
    emoji: '🔥',
    description: 'High energy and vibrant vibes',
    colors: {
      primary: '#FF6B35',
      secondary: '#F7931E',
      gradient: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
    },
  },
  chill: {
    id: 'chill',
    name: 'Chill',
    emoji: '🌙',
    description: 'Relaxed and laid-back atmosphere',
    colors: {
      primary: '#4A90E2',
      secondary: '#7B68EE',
      gradient: 'linear-gradient(135deg, #4A90E2 0%, #7B68EE 100%)',
    },
  },
  creative: {
    id: 'creative',
    name: 'Creative',
    emoji: '💫',
    description: 'Inspiring and artistic energy',
    colors: {
      primary: '#9B59B6',
      secondary: '#E74C3C',
      gradient: 'linear-gradient(135deg, #9B59B6 0%, #E74C3C 50%, #F39C12 100%)',
    },
  },
  romantic: {
    id: 'romantic',
    name: 'Romantic',
    emoji: '💝',
    description: 'Intimate and loving vibes',
    colors: {
      primary: '#E91E63',
      secondary: '#FF69B4',
      gradient: 'linear-gradient(135deg, #E91E63 0%, #FF69B4 100%)',
    },
  },
  peaceful: {
    id: 'peaceful',
    name: 'Peaceful',
    emoji: '🌿',
    description: 'Calm and serene atmosphere',
    colors: {
      primary: '#27AE60',
      secondary: '#2ECC71',
      gradient: 'linear-gradient(135deg, #27AE60 0%, #2ECC71 100%)',
    },
  },
  party: {
    id: 'party',
    name: 'Party',
    emoji: '⚡',
    description: 'Fun and celebratory energy',
    colors: {
      primary: '#F1C40F',
      secondary: '#FF8C00',
      gradient: 'linear-gradient(135deg, #F1C40F 0%, #FF8C00 100%)',
    },
  },
  mysterious: {
    id: 'mysterious',
    name: 'Mysterious',
    emoji: '🎭',
    description: 'Intriguing and enigmatic vibes',
    colors: {
      primary: '#2C3E50',
      secondary: '#8E44AD',
      gradient: 'linear-gradient(135deg, #2C3E50 0%, #8E44AD 100%)',
    },
  },
};

export const getMoodById = (id: MoodType): Mood => MOODS[id];
export const getAllMoods = (): Mood[] => Object.values(MOODS);