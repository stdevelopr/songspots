import { useState, useRef, useEffect } from 'react';
import { useDeletePin, useUpdatePin } from '../../common/useQueries';

interface UsePinOperationsProps {
  visiblePins: any[];
  onViewPinOnMap: (pinId: string, lat: number, lng: number, fromProfile?: boolean) => void;
}

export const usePinOperations = ({ visiblePins, onViewPinOnMap }: UsePinOperationsProps) => {
  const deletePinMutation = useDeletePin();
  const updatePinMutation = useUpdatePin();
  
  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pinToDelete, setPinToDelete] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [pinToEdit, setPinToEdit] = useState<any>(null);
  
  // Pin selection and scrolling
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const spotRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Delete operations
  const handleDeletePin = (pin: any) => {
    setPinToDelete(pin);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!pinToDelete) return;

    try {
      await deletePinMutation.mutateAsync(pinToDelete.id);
      setShowDeleteModal(false);
      setPinToDelete(null);
    } catch (error) {
      console.error('Failed to delete pin:', error);
      alert('Failed to delete pin. Please try again.');
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setPinToDelete(null);
  };

  // Edit operations
  const handleEditPin = (pin: any) => {
    setPinToEdit(pin);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (pinData: {
    name: string;
    description: string;
    musicLink: string;
    isPrivate: boolean;
  }) => {
    if (!pinToEdit) return;

    try {
      await updatePinMutation.mutateAsync({
        id: pinToEdit.id,
        name: pinData.name || '',
        description: pinData.description || '',
        musicLink: pinData.musicLink || '',
        latitude: pinToEdit.latitude,
        longitude: pinToEdit.longitude,
        isPrivate: pinData.isPrivate,
      });

      setShowEditModal(false);
      setPinToEdit(null);
    } catch (error) {
      console.error('Failed to update pin:', error);
      alert('Failed to update pin. Please try again.');
    }
  };

  const handleEditCancel = () => {
    setShowEditModal(false);
    setPinToEdit(null);
  };

  // View on map
  const handleViewPinOnMap = (pin: any) => {
    const lat = parseFloat(pin.latitude);
    const lng = parseFloat(pin.longitude);
    onViewPinOnMap(pin.id.toString(), lat, lng, true);
  };

  // Pin click and scroll functionality
  const handlePinClick = (pinId: string) => {
    console.log('Pin clicked, scrolling to:', pinId);
    
    setSelectedPinId(pinId);
    
    // Clear any existing highlights
    Object.values(spotRefs.current).forEach(element => {
      if (element) {
        element.style.transform = '';
        element.style.boxShadow = '';
        element.style.borderColor = '';
        element.style.transition = '';
        const indicator = element.querySelector('.animate-spin');
        if (indicator) {
          indicator.remove();
        }
      }
    });
    
    // Scroll to the corresponding spot
    const element = spotRefs.current[pinId];
    if (element) {
      console.log('Found element, scrolling to:', element);
      
      const isMobile = window.innerWidth < 768;
      element.scrollIntoView({
        behavior: 'smooth',
        block: isMobile ? 'start' : 'center',
        inline: 'nearest'
      });
      
      // Add highlight effect
      element.style.transform = 'scale(1.02)';
      element.style.boxShadow = '0 12px 40px rgba(59, 130, 246, 0.4), 0 4px 20px rgba(59, 130, 246, 0.2)';
      element.style.borderColor = 'rgb(59, 130, 246)';
      element.style.borderWidth = '2px';
      element.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(147, 197, 253, 0.1) 100%)';
      element.style.transition = 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      element.style.position = 'relative';
      
      element.classList.add('animate-pulse-highlight');
      
      // Add selected indicator
      const selectedIndicator = document.createElement('div');
      selectedIndicator.className = 'selected-pin-indicator absolute top-2 left-2 flex items-center gap-1 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg';
      selectedIndicator.innerHTML = `
        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
        </svg>
        Selected
      `;
      selectedIndicator.style.zIndex = '1001';
      element.appendChild(selectedIndicator);
      
      // Remove highlight after animation
      setTimeout(() => {
        if (element) {
          element.style.transform = '';
          element.style.boxShadow = '';
          element.style.borderColor = '';
          element.style.borderWidth = '';
          element.style.background = '';
          element.style.transition = '';
          element.classList.remove('animate-pulse-highlight');
          
          const indicator = element.querySelector('.selected-pin-indicator');
          if (indicator) {
            indicator.remove();
          }
        }
      }, 2500);
    } else {
      console.warn('No element ref found for pinId:', pinId);
      const fallbackElement = document.querySelector(`[data-pin-id="${pinId}"]`) as HTMLElement;
      if (fallbackElement) {
        fallbackElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });
      }
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!visiblePins.length) return;
      
      const currentIndex = selectedPinId ? 
        visiblePins.findIndex(pin => pin.id.toString() === selectedPinId) : -1;
      
      let nextIndex = currentIndex;
      
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          nextIndex = currentIndex > 0 ? currentIndex - 1 : visiblePins.length - 1;
          break;
        case 'ArrowDown':
          e.preventDefault();
          nextIndex = currentIndex < visiblePins.length - 1 ? currentIndex + 1 : 0;
          break;
        case 'Home':
          e.preventDefault();
          nextIndex = 0;
          break;
        case 'End':
          e.preventDefault();
          nextIndex = visiblePins.length - 1;
          break;
        default:
          return;
      }
      
      if (nextIndex !== currentIndex && nextIndex >= 0) {
        handlePinClick(visiblePins[nextIndex].id.toString());
      }
    };

    if (visiblePins.length > 0) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [selectedPinId, visiblePins]);

  return {
    // Delete modal state
    showDeleteModal,
    pinToDelete,
    handleDeletePin,
    handleDeleteConfirm,
    handleDeleteCancel,
    
    // Edit modal state
    showEditModal,
    pinToEdit,
    handleEditPin,
    handleEditSubmit,
    handleEditCancel,
    
    // Pin interaction
    selectedPinId,
    isScrolling,
    spotRefs,
    handlePinClick,
    handleViewPinOnMap,
    
    // Mutation states
    deletePinMutation,
    updatePinMutation,
  };
};