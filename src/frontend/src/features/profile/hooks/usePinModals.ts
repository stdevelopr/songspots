import { useState } from 'react';
import { useDeletePin, useUpdatePin } from '../../common/useQueries';
import type { Pin, PinUpdateData } from './usePinOperations.types';

export const usePinModals = () => {
  const deletePinMutation = useDeletePin();
  const updatePinMutation = useUpdatePin();
  
  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pinToDelete, setPinToDelete] = useState<Pin | null>(null);
  
  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [pinToEdit, setPinToEdit] = useState<Pin | null>(null);

  // Delete operations
  const handleDeletePin = (pin: Pin) => {
    setPinToDelete(pin);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    if (!pinToDelete) return;

    try {
      await deletePinMutation.mutateAsync(pinToDelete.id);
      setShowDeleteModal(false);
      setPinToDelete(null);
    } catch (error) {
      console.error('Failed to delete pin:', error);
      throw new Error('Failed to delete pin. Please try again.');
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setPinToDelete(null);
  };

  // Edit operations
  const handleEditPin = (pin: Pin) => {
    setPinToEdit(pin);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (pinData: PinUpdateData): Promise<void> => {
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
      throw new Error('Failed to update pin. Please try again.');
    }
  };

  const handleEditCancel = () => {
    setShowEditModal(false);
    setPinToEdit(null);
  };

  return {
    // State
    showDeleteModal,
    pinToDelete,
    showEditModal,
    pinToEdit,
    
    // Delete operations
    handleDeletePin,
    handleDeleteConfirm,
    handleDeleteCancel,
    
    // Edit operations
    handleEditPin,
    handleEditSubmit,
    handleEditCancel,
    
    // Mutations
    deletePinMutation,
    updatePinMutation,
  };
};