import { useState } from 'react';
import { useDeleteVibe, useUpdateVibe } from '../../common/useQueries';
import type { Vibe, VibeUpdateData } from './useVibeOperations.types';

export const useVibeModals = () => {
  const deleteVibeMutation = useDeleteVibe();
  const updateVibeMutation = useUpdateVibe();
  
  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [vibeToDelete, setVibeToDelete] = useState<Vibe | null>(null);
  
  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [vibeToEdit, setVibeToEdit] = useState<Vibe | null>(null);

  // Delete operations
  const handleDeleteVibe = (vibe: Vibe) => {
    setVibeToDelete(vibe);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    if (!vibeToDelete) return;

    try {
      await deleteVibeMutation.mutateAsync(vibeToDelete.id);
      setShowDeleteModal(false);
      setVibeToDelete(null);
    } catch (error) {
      console.error('Failed to delete vibe:', error);
      throw new Error('Failed to delete vibe. Please try again.');
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setVibeToDelete(null);
  };

  // Edit operations
  const handleEditVibe = (vibe: Vibe) => {
    setVibeToEdit(vibe);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (vibeData: VibeUpdateData): Promise<void> => {
    if (!vibeToEdit) return;

    try {
      await updateVibeMutation.mutateAsync({
        id: vibeToEdit.id,
        name: vibeData.name || '',
        description: vibeData.description || '',
        musicLink: vibeData.musicLink || '',
        latitude: vibeToEdit.latitude,
        longitude: vibeToEdit.longitude,
        isPrivate: vibeData.isPrivate,
      });

      setShowEditModal(false);
      setVibeToEdit(null);
    } catch (error) {
      console.error('Failed to update vibe:', error);
      throw new Error('Failed to update vibe. Please try again.');
    }
  };

  const handleEditCancel = () => {
    setShowEditModal(false);
    setVibeToEdit(null);
  };

  return {
    // State
    showDeleteModal,
    vibeToDelete,
    showEditModal,
    vibeToEdit,
    
    // Delete operations
    handleDeleteVibe,
    handleDeleteConfirm,
    handleDeleteCancel,
    
    // Edit operations
    handleEditVibe,
    handleEditSubmit,
    handleEditCancel,
    
    // Mutations
    deleteVibeMutation,
    updateVibeMutation,
  };
};