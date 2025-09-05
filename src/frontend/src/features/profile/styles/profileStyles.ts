// Profile styling constants and utilities

export const PROFILE_STYLES = {
  // Color schemes
  headerGradients: {
    default: 'from-slate-600 via-indigo-600 to-blue-600',
    blue: 'from-blue-500 via-indigo-500 to-purple-600',
    emerald: 'from-emerald-500 via-teal-500 to-cyan-600',
    purple: 'from-purple-500 via-pink-500 to-rose-600',
  },

  // Accent colors
  accentColors: {
    default: 'indigo',
    blue: 'blue',
    emerald: 'emerald',
    purple: 'purple',
  },

  // Common spacing and sizing
  spacing: {
    cardPadding: 'p-4 lg:p-6',
    sectionGap: 'space-y-4',
    contentGap: 'gap-6',
  },

  // Animation styles
  animations: {
    pinHighlight: {
      transform: 'scale(1.015)',
      boxShadow: '0 8px 25px rgba(250, 204, 21, 0.15), 0 2px 10px rgba(250, 204, 21, 0.1)',
      borderColor: 'rgb(250, 204, 21)',
      borderWidth: '1px',
      background:
        'linear-gradient(135deg, rgba(250, 204, 21, 0.03) 0%, rgba(254, 240, 138, 0.05) 100%)',
      transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    },

    cardHover:
      'hover:shadow-lg hover:-translate-y-1 transition-all duration-300 transform hover:scale-[1.02]',
  },

  // Layout constants
  layout: {
    desktopSidebar: 'w-full lg:w-1/3',
    desktopMain: 'flex-1',
    mobileContainer: 'w-full max-w-2xl mx-auto px-3 py-3',
    desktopContainer: 'w-full max-w-6xl mx-auto h-full min-h-0 flex gap-8',
  },
};

// Utility functions
export const getProfileHeaderGradient = (theme?: string): string => {
  return (
    PROFILE_STYLES.headerGradients[theme as keyof typeof PROFILE_STYLES.headerGradients] ||
    PROFILE_STYLES.headerGradients.default
  );
};

export const getProfileAccentColor = (theme?: string): string => {
  return (
    PROFILE_STYLES.accentColors[theme as keyof typeof PROFILE_STYLES.accentColors] ||
    PROFILE_STYLES.accentColors.default
  );
};

// CSS-in-JS styles for dynamic elements
export const PIN_HIGHLIGHT_STYLES = `
  
  @keyframes pulseHighlight {
    0% { transform: scale(1); }
    50% { transform: scale(1.03); }
    100% { transform: scale(1.02); }
  }
  
  @keyframes smooth-pulse {
    0%, 100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.08);
      opacity: 0.85;
    }
  }
  
  @media (max-width: 768px) {
    .selected-pin-indicator {
      font-size: 0.75rem;
      padding: 0.25rem 0.5rem;
    }
  }
  

  
  .keyboard-hint {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 0.75rem;
    opacity: 0;
    transform: translateY(10px);
    transition: all 0.3s ease;
    z-index: 1000;
  }
  
  .keyboard-hint.show {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Common CSS classes
export const COMMON_CLASSES = {
  card: 'bg-white/95 rounded-xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow duration-200',
  button: {
    primary:
      'bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg transition-colors',
    secondary:
      'bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2 rounded-lg transition-colors',
    outline:
      'border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-4 py-2 rounded-lg transition-colors',
  },
  input:
    'w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
  textarea:
    'w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none',
};
