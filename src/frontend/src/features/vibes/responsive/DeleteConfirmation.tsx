import React from 'react';
import { useIsMobile } from '@common';
import { DeleteConfirmationModal } from '@common';
import { ActionSheet } from '../../../components/mobile/ActionSheet';

interface DeleteConfirmationProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
  pinName: string;
}

export const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  isDeleting,
  pinName,
}) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <ActionSheet
        isOpen={isOpen}
        onClose={onCancel}
        title="Delete Spot"
        message={`Are you sure you want to delete "${pinName}"? This action cannot be undone.`}
        options={[
          {
            label: isDeleting ? 'Deleting...' : 'Delete Spot',
            action: onConfirm,
            style: 'destructive',
            disabled: isDeleting,
            icon: isDeleting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-600 border-t-transparent" />
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            ),
          },
          {
            label: 'Cancel',
            action: onCancel,
            style: 'cancel',
          },
        ]}
      />
    );
  }

  return (
    <DeleteConfirmationModal
      isOpen={isOpen}
      onConfirm={onConfirm}
      onCancel={onCancel}
      isDeleting={isDeleting}
      pinName={pinName}
    />
  );
};

export default DeleteConfirmation;