import { useState, useCallback } from 'react';

export interface ErrorState {
  message: string | null;
  isVisible: boolean;
}

export const usePinErrorHandler = () => {
  const [error, setError] = useState<ErrorState>({
    message: null,
    isVisible: false
  });

  const showError = useCallback((message: string) => {
    setError({
      message,
      isVisible: true
    });
  }, []);

  const hideError = useCallback(() => {
    setError({
      message: null,
      isVisible: false
    });
  }, []);

  const handleAsyncOperation = useCallback(async <T>(
    operation: () => Promise<T>,
    errorMessage: string
  ): Promise<T | null> => {
    try {
      const result = await operation();
      hideError();
      return result;
    } catch (err) {
      console.error(err);
      showError(errorMessage);
      return null;
    }
  }, [showError, hideError]);

  return {
    error,
    showError,
    hideError,
    handleAsyncOperation,
  };
};