import { useCallback } from 'react';
import { useVibeModals } from './useVibeModals';
import { useVibeSelection } from './useVibeSelection';
import { useVibeKeyboardNavigation } from './useVibeKeyboardNavigation';
import { useVibeErrorHandler } from './useVibeErrorHandler';
import type { UseVibeOperationsProps, VibeUpdateData } from './useVibeOperations.types';

export const useVibeOperations = ({ visibleVibes }: UseVibeOperationsProps) => {
  // Compose hooks for different concerns
  const modalOperations = useVibeModals();
  const vibeSelection = useVibeSelection();
  const errorHandler = useVibeErrorHandler();

  // Set up keyboard navigation
  useVibeKeyboardNavigation({
    visibleVibes,
    selectedVibeId: vibeSelection.highlightedVibeId,
    onVibeClick: (vibeId: string, onRestoreBounds?: () => void) => 
      vibeSelection.handleListItemClick(vibeId, onRestoreBounds),
  });

  // Enhanced delete handler with error handling
  const handleDeleteConfirm = useCallback(async () => {
    const result = await errorHandler.handleAsyncOperation(
      () => modalOperations.handleDeleteConfirm(),
      'Failed to delete vibe. Please try again.'
    );
    return result;
  }, [modalOperations, errorHandler]);

  // Enhanced edit handler with error handling
  const handleEditSubmit = useCallback(async (vibeData: VibeUpdateData) => {
    const result = await errorHandler.handleAsyncOperation(
      () => modalOperations.handleEditSubmit(vibeData),
      'Failed to update vibe. Please try again.'
    );
    return result;
  }, [modalOperations, errorHandler]);


  return {
    // Error handling
    error: errorHandler.error,
    hideError: errorHandler.hideError,
    
    // Delete modal state
    showDeleteModal: modalOperations.showDeleteModal,
    vibeToDelete: modalOperations.vibeToDelete,
    handleDeleteVibe: modalOperations.handleDeleteVibe,
    handleDeleteConfirm,
    handleDeleteCancel: modalOperations.handleDeleteCancel,
    
    // Edit modal state
    showEditModal: modalOperations.showEditModal,
    vibeToEdit: modalOperations.vibeToEdit,
    handleEditVibe: modalOperations.handleEditVibe,
    handleEditSubmit,
    handleEditCancel: modalOperations.handleEditCancel,
    
    // Vibe interaction
    selectedVibeId: vibeSelection.highlightedVibeId,
    focusedVibeId: vibeSelection.focusedVibeId,
    isScrolling: vibeSelection.isScrolling,
    spotRefs: vibeSelection.spotRefs,
    handleVibeClick: (vibeId: string, onRestoreBounds?: () => void) => 
      vibeSelection.handleListItemClick(vibeId, onRestoreBounds),
    handleMapMarkerClick: vibeSelection.handleMapMarkerClick,
    resetSelection: vibeSelection.resetSelection,
    
    // Mutation states
    deleteVibeMutation: modalOperations.deleteVibeMutation,
    updateVibeMutation: modalOperations.updateVibeMutation,
  };
};
