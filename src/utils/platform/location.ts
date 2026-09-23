/** expo-location → navigator.geolocation */

export const Accuracy = {
  Lowest: 1,
  Low: 2,
  Balanced: 3,
  High: 4,
  Highest: 5,
  BestForNavigation: 6,
} as const;

export type LocationObject = {
  coords: {
    latitude: number;
    longitude: number;
    altitude: number | null;
    accuracy: number | null;
    altitudeAccuracy: number | null;
    heading: number | null;
    speed: number | null;
  };
  timestamp: number;
};

export type LocationSubscription = { remove: () => void };
export type PermissionStatus = 'granted' | 'prompt' | 'denied' | 'unsupported';

export class LocationError extends Error {
  code: 'UNSUPPORTED' | 'DENIED' | 'UNAVAILABLE' | 'TIMEOUT' | 'UNKNOWN';

  constructor(code: LocationError['code'], message: string) {
    super(message);
    this.name = 'LocationError';
    this.code = code;
  }
}

const toLocationObject = (position: GeolocationPosition): LocationObject => ({
  coords: {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    altitude: position.coords.altitude,
    accuracy: position.coords.accuracy,
    altitudeAccuracy: position.coords.altitudeAccuracy,
    heading: position.coords.heading,
    speed: position.coords.speed,
  },
  timestamp: position.timestamp,
});

const permissionStatus = async (): Promise<PermissionStatus> => {
  if (typeof navigator === 'undefined' || !navigator.geolocation) return 'unsupported';
  if (!navigator.permissions?.query) return 'prompt';
  try {
    const result = await navigator.permissions.query({ name: 'geolocation' });
    return result.state;
  } catch {
    return 'prompt';
  }
};

const normalizeError = (error: GeolocationPositionError | Error): LocationError => {
  if ('code' in error && typeof error.code === 'number') {
    if (error.code === 1) return new LocationError('DENIED', 'Location access is blocked. Enable it in your browser settings, then retry.');
    if (error.code === 2) return new LocationError('UNAVAILABLE', 'Your device could not determine its location. Move near a window and retry.');
    if (error.code === 3) return new LocationError('TIMEOUT', 'A precise location could not be found in time. Please retry.');
  }
  return new LocationError('UNKNOWN', error.message || 'Unable to capture your location.');
};

export const requestForegroundPermissionsAsync = async () => {
  const before = await permissionStatus();
  if (before === 'unsupported') return { status: before, granted: false };
  if (before === 'denied') return { status: before, granted: false };
  return { status: before, granted: before === 'granted' };
};

export const requestBackgroundPermissionsAsync = requestForegroundPermissionsAsync;

export const getForegroundPermissionsAsync = async () => {
  const status = await permissionStatus();
  return { status, granted: status === 'granted' };
};

export const hasServicesEnabledAsync = async () => !!navigator.geolocation;

export const enableNetworkProviderAsync = async () => {};

export const getCurrentPositionAsync = (options?: any): Promise<LocationObject> =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => resolve(toLocationObject(position)),
      (error) => reject(normalizeError(error)),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0, ...(options || {}), accuracy: undefined }
    );
  });

export const getLastKnownPositionAsync = async (): Promise<LocationObject | null> => null;

export const watchPositionAsync = (
  options: any,
  callback: (location: LocationObject) => void,
  errorCallback?: (error: LocationError) => void
): Promise<LocationSubscription> =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new LocationError('UNSUPPORTED', 'Location is not supported by this browser.'));
      return;
    }
    const id = navigator.geolocation.watchPosition(
      (position) => callback(toLocationObject(position)),
      (error) => errorCallback?.(normalizeError(error)),
      { enableHighAccuracy: true, maximumAge: 0, ...(options || {}), accuracy: undefined, timeInterval: undefined, distanceInterval: undefined }
    );
    resolve({ remove: () => navigator.geolocation.clearWatch(id) });
  });

export const reverseGeocodeAsync = async (_location: any) => [];

export const geocodeAsync = async (_address: string) => [];

export default {
  Accuracy,
  requestForegroundPermissionsAsync,
  getForegroundPermissionsAsync,
  getCurrentPositionAsync,
  watchPositionAsync,
  reverseGeocodeAsync,
  enableNetworkProviderAsync,
};
