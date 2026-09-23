import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { EventEmitter } from '@/utils/platform/events';
import * as SecureStore from '@/utils/storage';

const RAW_BASE_URL: string = import.meta.env.VITE_API_URL || 'https://shop.mycompeta.online/api/'; //'http://10.246.155.42:8000/api/'  //

const BASE_URL: string = RAW_BASE_URL.replace(/\/?$/, '/');

if (__DEV__) {
  console.log('API base URL:', BASE_URL);
}

export const authEvents = new EventEmitter();

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/**
 * 1. REQUEST INTERCEPTOR
 */
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    console.log('📤 API Request:', config.method?.toUpperCase(), config.url);
    console.log('📤 Request headers:', config.headers);
    console.log('📤 Request data type:', typeof config.data);

    const accessToken: string | null = await SecureStore.getItemAsync('access_token');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
      console.log('🔑 Access token added to request');
    } else {
      console.log('⚠️ No access token found');
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

/**
 * Shared in-flight refresh promise so concurrent 401s
 * only trigger a single refresh request.
 */
let refreshPromise: Promise<string> | null = null;

const refreshAccessToken = async (): Promise<string> => {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const refreshToken = await SecureStore.getItemAsync('refresh_token');

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post(`${BASE_URL}auth/refresh/`, {
      refresh: refreshToken,
    });

    const newAccessToken: string = response.data.access;
    await SecureStore.setItemAsync('access_token', newAccessToken);

    return newAccessToken;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
};

const logout = async () => {
  await SecureStore.deleteItemAsync('access_token');
  await SecureStore.deleteItemAsync('refresh_token');
  authEvents.emit('logout');
};

/**
 * 2. RESPONSE INTERCEPTOR
 */
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl: string = originalRequest?.url || '';

    // 🔴 1. EXCLUDE AUTH ENDPOINTS FROM TOKEN REFRESH
    // If the request came from login or refresh routes, do NOT attempt to refresh.
    const isAuthRoute =
      requestUrl.includes('auth/login/') || requestUrl.includes('auth/refresh/');

    // Check if error is 401 Unauthorized, not an auth route, and not already retried
    if (error.response?.status === 401 && !isAuthRoute && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newAccessToken = await refreshAccessToken();

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        console.log('Refresh token expired or missing. Logging out.');
        await logout();

        // Reject with refreshError for protected routes so app redirects
        return Promise.reject(refreshError);
      }
    }

    // 🟢 2. PASS ORIGINAL ERROR
    // Returns the actual 401 response from Django REST Framework on login failure
    return Promise.reject(error);
  }
);

export default api;