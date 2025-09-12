import React, { useState } from 'react';
import { FloatingActionButton } from '../mobile/FloatingActionButton';
import { ActionSheet } from '../mobile/ActionSheet';
import { BottomSheet } from '../mobile/BottomSheet';
import MusicVisualizer from './MusicVisualizer';

const AnimationShowcase: React.FC = () => {
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center vibe-animate-fade-up">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Vibes Animation Showcase</h1>
          <p className="text-gray-600">Experience the enhanced animations and micro-interactions</p>
        </div>

        {/* Entrance Animations Demo */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 vibe-animate-fade-up">Entrance Animations</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="mobile-card vibe-animate-scale-in" style={{ animationDelay: '0ms' }}>
              <h3 className="font-medium mb-2">Scale In</h3>
              <p className="text-sm text-gray-600">Gentle scale with slight vertical movement</p>
            </div>
            <div className="mobile-card vibe-animate-bounce-in" style={{ animationDelay: '100ms' }}>
              <h3 className="font-medium mb-2">Bounce In</h3>
              <p className="text-sm text-gray-600">Playful bounce effect for interactive elements</p>
            </div>
            <div className="mobile-card vibe-animate-slide-in-up" style={{ animationDelay: '200ms' }}>
              <h3 className="font-medium mb-2">Slide Up</h3>
              <p className="text-sm text-gray-600">Smooth slide from bottom with easing</p>
            </div>
          </div>
        </section>

        {/* Interactive Elements */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 vibe-animate-fade-up">Interactive Elements</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="mobile-button vibe-hover-lift vibe-ripple-container">
              Hover Lift
            </button>
            <button 
              className="mobile-card p-4 cursor-pointer vibe-transition-normal hover:shadow-lg"
              onClick={() => setShowActionSheet(true)}
            >
              Action Sheet
            </button>
            <button 
              className="mobile-card p-4 cursor-pointer vibe-transition-normal hover:shadow-lg"
              onClick={() => setShowBottomSheet(true)}
            >
              Bottom Sheet
            </button>
            <button 
              className="mobile-card p-4 cursor-pointer vibe-transition-normal hover:shadow-lg mobile-interactive"
            >
              Touch Feedback
            </button>
          </div>
        </section>

        {/* Loading & State Animations */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 vibe-animate-fade-up">Loading & State Animations</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="mobile-card text-center">
              <div className="vibe-animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2" />
              <p className="text-sm">Loading Spin</p>
            </div>
            <div className="mobile-card text-center">
              <div className="vibe-animate-shimmer w-full h-4 rounded mb-2" />
              <p className="text-sm">Shimmer Effect</p>
            </div>
            <div className="mobile-card text-center">
              <div className="vibe-animate-breathe w-6 h-6 bg-green-500 rounded-full mx-auto mb-2" />
              <p className="text-sm">Breathing Pulse</p>
            </div>
            <div className="mobile-card text-center">
              <div className="vibe-animate-pulse-glow w-6 h-6 bg-blue-500 rounded-full mx-auto mb-2" />
              <p className="text-sm">Glow Pulse</p>
            </div>
          </div>
        </section>

        {/* Music Visualizations */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 vibe-animate-fade-up">Music Visualizations</h2>
          <div className="mobile-card">
            <div className="flex items-center justify-between mb-4">
              <span className="font-medium">Music Player</span>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="mobile-button-secondary px-4 py-2"
              >
                {isPlaying ? 'Pause' : 'Play'}
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <MusicVisualizer isPlaying={isPlaying} variant="bars" size="lg" className="mx-auto mb-2" />
                <p className="text-sm text-gray-600">Music Bars</p>
              </div>
              <div className="text-center">
                <MusicVisualizer isPlaying={isPlaying} variant="pulse" size="lg" className="mx-auto mb-2" />
                <p className="text-sm text-gray-600">Pulse Effect</p>
              </div>
              <div className="text-center">
                <MusicVisualizer isPlaying={isPlaying} variant="wave" size="lg" className="mx-auto mb-2" />
                <p className="text-sm text-gray-600">Wave Animation</p>
              </div>
            </div>
          </div>
        </section>

        {/* Micro-Interactions */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 vibe-animate-fade-up">Micro-Interactions</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="mobile-card cursor-pointer vibe-hover-lift">
              <h3 className="font-medium mb-2">Hover to Lift</h3>
              <p className="text-sm text-gray-600">Gentle elevation on hover with smooth transitions</p>
            </div>
            <div 
              className="mobile-card cursor-pointer mobile-interactive"
              onClick={() => {
                const el = document.querySelector('.vibe-wiggle-demo');
                el?.classList.remove('vibe-animate-wiggle');
                setTimeout(() => el?.classList.add('vibe-animate-wiggle'), 10);
              }}
            >
              <h3 className="font-medium mb-2">Click to Wiggle</h3>
              <div className="vibe-wiggle-demo text-2xl">🎯</div>
            </div>
          </div>
        </section>
      </div>

      {/* Floating Action Buttons */}
      <FloatingActionButton
        icon={<span className="text-xl">🎵</span>}
        onClick={() => setIsPlaying(!isPlaying)}
        position="bottom-right"
        label="Toggle Music"
      />

      <FloatingActionButton
        icon={<span className="text-xl">✨</span>}
        onClick={() => setShowBottomSheet(true)}
        position="bottom-left"
        variant="secondary"
        label="Show Animations"
      />

      {/* Action Sheet */}
      <ActionSheet
        isOpen={showActionSheet}
        onClose={() => setShowActionSheet(false)}
        title="Animation Options"
        options={[
          {
            label: 'Scale Animation',
            action: () => setShowActionSheet(false),
            icon: <span>📏</span>,
          },
          {
            label: 'Bounce Animation',
            action: () => setShowActionSheet(false),
            icon: <span>🏀</span>,
          },
          {
            label: 'Slide Animation',
            action: () => setShowActionSheet(false),
            icon: <span>⬆️</span>,
          },
          {
            label: 'Cancel',
            action: () => setShowActionSheet(false),
            style: 'cancel',
          },
        ]}
      />

      {/* Bottom Sheet */}
      <BottomSheet
        isOpen={showBottomSheet}
        onClose={() => setShowBottomSheet(false)}
        title="Enhanced Animations"
        snapPoints={[0.6, 0.9]}
      >
        <div className="space-y-4 vibe-animate-fade-up">
          <h3 className="text-lg font-medium">Animation Improvements</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            {[
              'Smooth entrance animations for all components',
              'Enhanced hover and touch interactions',
              'Beautiful loading states with shimmer effects',
              'Music visualization components',
              'GPU-accelerated transforms for better performance',
              'Accessibility support with reduced motion preferences',
              'Consistent timing and easing across all animations',
              'Mobile-optimized touch feedback and haptics',
            ].map((item, index) => (
              <li 
                key={index} 
                className="flex items-start gap-2 vibe-animate-fade-up" 
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <span className="text-green-500 mt-1">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </BottomSheet>
    </div>
  );
};

export default AnimationShowcase;