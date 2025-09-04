import { useCallback } from 'react';
import { usePinModals } from './usePinModals';
import { usePinSelection } from './usePinSelection';
import { usePinKeyboardNavigation } from './usePinKeyboardNavigation';
import { usePinErrorHandler } from './usePinErrorHandler';
import type { UsePinOperationsProps, PinUpdateData } from './usePinOperations.types';

export const usePinOperations = ({ visiblePins }: UsePinOperationsProps) => {
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
    
    // Mutation states
    deletePinMutation: modalOperations.deletePinMutation,
    updatePinMutation: modalOperations.updatePinMutation,
  };
};