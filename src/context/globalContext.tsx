import { SellerProfile, User } from '@/interfaces/interface';
import { getSellerProfile, getUser } from '@/services/auth';
import { registerForNativePushNotifications, setupNotificationListeners } from '@/services/notifications';
import { authEvents } from '@/utils/api';
import { useRouter } from '@/router';
import * as SecureStore from '@/utils/storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

const KEYS = {
  accessToken: 'access_token',
  refreshToken: 'refresh_token',
  user: 'user',
  sellerProfile: 'seller_profile',
  loginRole: 'login_role'
} as const;

interface AuthContextType {
  user: User | null;
  sellerProfile: SellerProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginRole: string;
  refetchLoginRole: () => void;
  saveLoginRole: (role: 'buyer' | 'seller') => Promise<void>;
  saveSession: (access: string, refresh: string) => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  refreshSellerProfile: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [sellerProfile, setSellerProfile] = useState<SellerProfile | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loginRole, setLoginRole] = useState<'seller' | 'buyer'>('buyer')
  const router = useRouter();

  // Load saved session on boot
  useEffect(() => {
    const loadStoredSession = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync(KEYS.accessToken);
        const storedUserJson = await SecureStore.getItemAsync(KEYS.user);
        const storedSellerProfilejson = await SecureStore.getItemAsync(KEYS.sellerProfile);

        if (storedToken) setToken(storedToken);
        if (storedUserJson) setUser(JSON.parse(storedUserJson));
        if (storedSellerProfilejson) setSellerProfile(JSON.parse(storedSellerProfilejson))
      } catch (error) {
        console.error('Failed to load session:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadStoredSession();
  }, []);

  useEffect(() => {
    const syncPushToken = async () => {
      // Don't check until the initial SecureStore lookup finishes
      if (isLoading) return;

      // Only attempt registration if we have a valid authenticated user session
      if (token && user) {
        try {
          setupNotificationListeners()
          await registerForNativePushNotifications();
          console.log('✅ Push notification sync completed successfully.');
        } catch (error: any) {
          console.log('❌ Failed to register push token:', error.response.data);
        }
      }
    };

    syncPushToken();
  }, [token, user, isLoading]);

  // Listen for forced logouts from the axios interceptor
  useEffect(() => {
    const handleForcedLogout = () => logout();
    authEvents.on('logout', handleForcedLogout);
    return () => { authEvents.off('logout', handleForcedLogout); };
  }, []);

  const refreshUserProfile = useCallback(async () => {
    try {
      const response = await getUser();
      const userData: User = response?.data?.data ?? response?.data;
      setUser(userData);
      await SecureStore.setItemAsync(KEYS.user, JSON.stringify(userData));
    } catch (error) {
      console.error('Failed to refresh user profile:', error);
    }
  }, []);

  const refreshSellerProfile = useCallback(async () => { // 1. Added "async" here
    try {
      const response = await getSellerProfile();
      const sellerData: SellerProfile = response?.data?.data ?? response?.data;
      setSellerProfile(sellerData);
      await SecureStore.setItemAsync(KEYS.sellerProfile, JSON.stringify(sellerData));
    } catch (error) {
      console.error('Failed to refresh seller profile:', error);
    }
  }, []); // 2. Correctly placed the closing bracket and dependency array here


  // Saves tokens, updates token state, then fetches + stores full user profile
  const saveSession = useCallback(async (access: string, refresh: string) => {
    await SecureStore.setItemAsync(KEYS.accessToken, access);
    await SecureStore.setItemAsync(KEYS.refreshToken, refresh);
    setToken(access);
    await refreshUserProfile();
    await refreshSellerProfile();
  }, [refreshUserProfile]);

  const saveLoginRole = useCallback(async (role: 'buyer' | 'seller') => {
    await SecureStore.setItemAsync(KEYS.loginRole, role);
    setLoginRole(role);
  }, [])

  const refetchLoginRole = useCallback(async () => {
    const newLoginRole = await SecureStore.getItemAsync(KEYS.loginRole) || 'buyer'
    setLoginRole(newLoginRole as 'buyer' | 'seller')
  }, [])

  const logout = useCallback(async () => {
    try {
      await SecureStore.deleteItemAsync(KEYS.accessToken);
      await SecureStore.deleteItemAsync(KEYS.refreshToken);
      await SecureStore.deleteItemAsync(KEYS.user);
      setToken(null);
      setUser(null);
      router.replace('/login');
    } catch (erro) {
      alert('Failed to logout')
    }

  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      sellerProfile,
      token,
      isAuthenticated: !!token,
      isLoading,
      loginRole,
      refetchLoginRole,
      saveLoginRole,
      saveSession,
      refreshUserProfile,
      refreshSellerProfile,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useGlobalContext = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useGlobalContext must be used inside AuthProvider');
  return context;
};