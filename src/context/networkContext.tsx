/*import React, { createContext, useContext, ReactNode } from 'react';
import { useNetworkState } from '@/utils/platform/network';
import OfflineBanner from '@/components/common/OfflineBanner';

interface NetworkContextType {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  connectionType: string | null;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export const NetworkProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const networkState = useNetworkState();

  const contextValue: NetworkContextType = {
    isConnected: networkState.isConnected ?? false,
    isInternetReachable: networkState.isInternetReachable ?? null,
    connectionType: networkState.type ?? null,
  };

  const isOffline = !networkState.isConnected || networkState.isInternetReachable === false;

  return (
    <NetworkContext.Provider value={contextValue}>
      {children}
      <OfflineBanner visible={isOffline} />
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within NetworkProvider');
  }
  return context;
}; */
