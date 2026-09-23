import React, { createContext, useCallback, useContext, useState } from 'react';
import ToastBanner from '@/components/common/ToastBanner';

type ToastType = 'success' | 'error';

interface ToastContextType {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'success' as ToastType,
  });

  const showSuccess = useCallback((message: string) => {
    setToast({ visible: true, message, type: 'success' });
  }, []);

  const showError = useCallback((message: string) => {
    setToast({ visible: true, message, type: 'error' });
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

  return (
    <ToastContext.Provider value={{ showSuccess, showError }}>
      {children}
      {/* The banner lives here globally at the absolute root */}
      <ToastBanner
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />
    </ToastContext.Provider>
  );
};

// Custom Hook to ingest context anywhere
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};