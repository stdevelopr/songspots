import { useCallback } from 'react';
import { usePinModals } from './usePinModals';
import { usePinSelection } from './usePinSelection';
import { usePinKeyboardNavigation } from './usePinKeyboardNavigation';
import { usePinErrorHandler } from './usePinErrorHandler';
import type { UsePinOperationsProps, Pin, PinUpdateData } from './usePinOperations.types';

export const usePinOperations = ({ visiblePins, onViewPinOnMap, onFocusMapPin }: UsePinOperationsProps) => {
  // Compose hooks for different concerns
  const modalOperations = usePinModals();
  const pinSelection = usePinSelection();
  const errorHandler = usePinErrorHandler();

  // Set up keyboard navigation
  usePinKeyboardNavigation({
    visiblePins,
    selectedPinId: pinSelection.selectedPinId,
    onPinClick: pinSelection.handlePinClick,
  });

  // Enhanced delete handler with error handling
  const handleDeleteConfirm = useCallback(async () => {
    const result = await errorHandler.handleAsyncOperation(
      () => modalOperations.handleDeleteConfirm(),
      'Failed to delete pin. Please try again.'
    );
    return result;
  }, [modalOperations, errorHandler]);

  // Enhanced edit handler with error handling
  const handleEditSubmit = useCallback(async (pinData: PinUpdateData) => {
    const result = await errorHandler.handleAsyncOperation(
      () => modalOperations.handleEditSubmit(pinData),
      'Failed to update pin. Please try again.'
    );
    return result;
  }, [modalOperations, errorHandler]);

  // View pin on map with proper type handling
  const handleViewPinOnMap = useCallback((pin: Pin) => {
    if (onFocusMapPin) {
      // Focus on pin in profile map instead of navigating to main map
      onFocusMapPin(pin.id.toString());
    } else {
      // Fallback to original behavior if onFocusMapPin is not provided
      const lat = parseFloat(pin.latitude);
      const lng = parseFloat(pin.longitude);
      onViewPinOnMap(pin.id.toString(), lat, lng, true);
    }
  }, [onViewPinOnMap, onFocusMapPin]);

  return {
    // Error handling
    error: errorHandler.error,
    hideError: errorHandler.hideError,
    
    // Delete modal state
    showDeleteModal: modalOperations.showDeleteModal,
    pinToDelete: modalOperations.pinToDelete,
    handleDeletePin: modalOperations.handleDeletePin,
    handleDeleteConfirm,
    handleDeleteCancel: modalOperations.handleDeleteCancel,
    
    // Edit modal state
    showEditModal: modalOperations.showEditModal,
    pinToEdit: modalOperations.pinToEdit,
    handleEditPin: modalOperations.handleEditPin,
    handleEditSubmit,
    handleEditCancel: modalOperations.handleEditCancel,
    
    // Pin interaction
    selectedPinId: pinSelection.selectedPinId,
    isScrolling: pinSelection.isScrolling,
    spotRefs: pinSelection.spotRefs,
    handlePinClick: pinSelection.handlePinClick,
    handleViewPinOnMap,
    
    // Mutation states
    deletePinMutation: modalOperations.deletePinMutation,
    updatePinMutation: modalOperations.updatePinMutation,
  };
};