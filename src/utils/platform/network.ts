/** expo-network → navigator.onLine */

import { useEffect, useState } from 'react';

export type NetworkState = {
  type: string;
  isConnected: boolean;
  isInternetReachable: boolean;
};

const readState = (): NetworkState => ({
  type: 'wifi',
  isConnected: typeof navigator !== 'undefined' ? navigator.onLine : true,
  isInternetReachable: typeof navigator !== 'undefined' ? navigator.onLine : true,
});

export const getNetworkStateAsync = async (): Promise<NetworkState> => readState();

export const useNetworkState = (): NetworkState => {
  const [state, setState] = useState<NetworkState>(readState);

  useEffect(() => {
    const update = () => setState(readState());
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  return state;
};

export const addNetworkStateListener = (cb: (state: NetworkState) => void) => {
  const update = () => cb(readState());
  window.addEventListener('online', update);
  window.addEventListener('offline', update);
  return { remove: () => {} };
};

export const NetworkStateType = { WIFI: 'WIFI', CELLULAR: 'CELLULAR', NONE: 'NONE', UNKNOWN: 'UNKNOWN' };

export default { getNetworkStateAsync, useNetworkState };
