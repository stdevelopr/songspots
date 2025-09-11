import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

type ToastType = 'info' | 'success' | 'error' | 'warning';

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, timeoutMs?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [message, setMessage] = useState<string | null>(null);
  const [type, setType] = useState<ToastType>('info');

  const showToast = useCallback((msg: string, t: ToastType = 'info', timeoutMs = 3000) => {
    setMessage(msg);
    setType(t);
    if (timeoutMs > 0) {
      window.setTimeout(() => setMessage(null), timeoutMs);
    }
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {message && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[3000]">
          <div
            role="status"
            aria-live="polite"
            className={
              `px-3 py-2 rounded shadow text-sm text-white ` +
              (type === 'success' ? 'bg-green-600' :
               type === 'error' ? 'bg-red-600' :
               type === 'warning' ? 'bg-amber-600' : 'bg-gray-900')
            }
          >
            {message}
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
};

export default ToastProvider;

