import React, { createContext, ReactNode, useContext } from 'react';
import { ActivityIndicator, StyleSheet } from '@/components/common/ui';

interface LoadingSpinnerProps {
  size?: number | 'small' | 'large';
}

interface LoadingSpinnerContextType {
  LoadingSpinner: React.FC<LoadingSpinnerProps>;
}

const LoadingSpinnerContext = createContext<LoadingSpinnerContextType | undefined>(undefined);

export const LoadingSpinnerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'large' }) => {
    return (
      <div style={styles.container}>
        <ActivityIndicator size={size} color="#F59E0B" />
      </div>
    );
  };

  return (
    <LoadingSpinnerContext.Provider value={{ LoadingSpinner }}>
      {children}
    </LoadingSpinnerContext.Provider>
  );
};

export const useLoadingSpinner = () => {
  const context = useContext(LoadingSpinnerContext);
  if (!context) {
    throw new Error('useLoadingSpinner must be used within a LoadingSpinnerProvider');
  }
  return context;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});