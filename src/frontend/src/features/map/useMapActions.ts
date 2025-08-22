import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useCreatePin, useDeletePin, useUpdatePin } from '../common';
import { Pin } from './types/map';
import { toNat } from '../common/utils/nat';

export const useMapActions = () => {
  const createPinMutation = useCreatePin();
  const deletePinMutation = useDeletePin();
  const updatePinMutation = useUpdatePin();
  const [pinToEdit, setPinToEdit] = useState<any | null>(null);
  const [pinDetailModalOpen, setPinDetailModalOpen] = useState(false);
  const [selectedPinDetail, setSelectedPinDetail] = useState<Pin | null>(null);
  const [pinCreateModalOpen, setPinCreateModalOpen] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);

  const handleEditSubmit = async (pinData: {
    name: string;
    description: string;
    musicLink: string;
    isPrivate: boolean;
  }) => {
    if (!pinToEdit) return;

    try {
      await updatePinMutation.mutateAsync({
        id: toNat(pinToEdit.id), // nat (bigint)
        name: pinData.name ?? '', // text
        description: pinData.description ?? '', // text
        musicLink: pinData.musicLink ?? '', // text
        latitude: String(pinToEdit.lat), // text
        longitude: String(pinToEdit.lng), // text
        isPrivate: !!pinData.isPrivate, // bool
      });

      setPinToEdit(null);
    } catch (error) {
      console.error('Failed to update pin:', error);
      alert('Failed to update pin. Please try again.');
    }
  };

  return {
    createPinMutation,
    deletePinMutation,
    updatePinMutation,
    pinToEdit,
    setPinToEdit,
    pinDetailModalOpen,
    setPinDetailModalOpen,
    selectedPinDetail,
    setSelectedPinDetail,
    pinCreateModalOpen,
    setPinCreateModalOpen,
    popupOpen,
    setPopupOpen,
    handleEditSubmit,
  };
};
