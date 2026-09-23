import { getNotifications } from '@/services/notifications';
import * as SecureStore from '@/utils/storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

interface GlobalCounts {
  unreadNotifications: number;
  cartItems: number;
  notifications: number;
  // Add other global counts here (e.g., activeDeliveries: number;)
}

interface GlobalCountContextType {
  counts: GlobalCounts;
  loading: boolean;
  refetchNotifications: (notif_type?: string) => Promise<void>;
  refetchCart: () => Promise<void>;
  refetchAll: () => Promise<void>;
  decrementNotifications: (amount?: number) => void;
  decrementCart: (amount?: number) => void;
  setCartCount: (count: number) => void;
}

const GlobalCountContext = createContext<GlobalCountContextType | undefined>(undefined);

export const GlobalCountProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [counts, setCounts] = useState<GlobalCounts>({
    unreadNotifications: 0,
    cartItems: 0,
    notifications: 0
  });
  const [loading, setLoading] = useState(true);

  // 1. Fetcher for Unread Notifications
  const refetchNotifications = useCallback(async (notif_type: string = 'all') => {
    try {
      const response = await getNotifications(notif_type);
      // Assuming your notifications service returns an array of Notification objects
      const unread = response.data.filter((n: any) => !n.is_read).length;
      setCounts((prev) => ({ ...prev, notifications: response.data?.length, unreadNotifications: unread }));
    } catch (error) {
      console.error('Failed to fetch global notification count:', error);
    }
  }, []);

  // 2. Fetcher for Cart Items
  const refetchCart = useCallback(async () => {
    try {
      // Replace with your actual API call
      // const items = await getCartItems();
      // const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
      const rawCartItems = await SecureStore.getItemAsync((import.meta.env.VITE_CART_STORAGE_KEY as string) || 'user_shopping_cart')
      if (!rawCartItems) {
        setCounts((prev) => ({ ...prev, cartItems: 0 }));
        return;
      }
      const cartItems = JSON.parse(rawCartItems as string)
      setCounts((prev) => ({ ...prev, cartItems: cartItems?.length || 0 }));
    } catch (error) {
      console.error('Failed to fetch global cart count:', error);
      setCounts((prev) => ({ ...prev, cartItems: 0 }));
    }
  }, []);

  // 3. Orchestrator to fetch everything
  const refetchAll = useCallback(async () => {
    setLoading(true);
    await Promise.allSettled([refetchNotifications('all'), refetchCart()]);
    setLoading(false);
  }, [refetchNotifications, refetchCart]);

  // Initial fetch on mount
  useEffect(() => {
    refetchAll();
  }, [refetchAll]);

  // 4. Optimistic UI Updaters
  // These allow you to instantly update numbers on the screen without waiting for API roundtrips
  const decrementNotifications = useCallback((amount = 1) => {
    setCounts((prev) => ({
      ...prev,
      unreadNotifications: Math.max(0, prev.unreadNotifications - amount),
    }));
  }, []);

  const decrementCart = useCallback((amount = 1) => {
    setCounts((prev) => ({
      ...prev,
      cartItems: Math.max(0, prev.cartItems - amount),
    }));
  }, []);

  const setCartCount = useCallback((count: number) => {
    setCounts((prev) => ({
      ...prev,
      cartItems: Math.max(0, count),
    }));
  }, []);

  return (
    <GlobalCountContext.Provider
      value={{
        counts,
        loading,
        refetchNotifications,
        refetchCart,
        refetchAll,
        decrementNotifications,
        decrementCart,
        setCartCount,
      }}
    >
      {children}
    </GlobalCountContext.Provider>
  );
};

// 5. Custom Hook for clean consumption
export const useGlobalCounts = () => {
  const context = useContext(GlobalCountContext);
  if (!context) {
    throw new Error('useGlobalCounts must be used within a GlobalCountProvider');
  }
  return context;
};