/** expo-notifications → browser Notification API (best effort). */

export const requestPermissionsAsync = async () => {
  if (typeof Notification === 'undefined') return { status: 'denied', granted: false };
  try {
    const permission = await Notification.requestPermission();
    return { status: permission === 'granted' ? 'granted' : 'denied', granted: permission === 'granted' };
  } catch {
    return { status: 'denied', granted: false };
  }
};

export const getPermissionsAsync = async () => {
  if (typeof Notification === 'undefined') return { status: 'denied', granted: false };
  const granted = Notification.permission === 'granted';
  return { status: granted ? 'granted' : 'denied', granted };
};

export const setNotificationHandler = (_handler: any) => {};

export const addNotificationReceivedListener = (_cb: any) => ({ remove: () => {} });

export const addNotificationResponseReceivedListener = (_cb: any) => ({ remove: () => {} });

export const removeNotificationSubscription = (_sub: any) => {};

export const getExpoPushTokenAsync = async () => ({ data: 'web' });

export const getDevicePushTokenAsync = async () => ({ data: 'web' });

export const setNotificationChannelAsync = async () => null;

export const scheduleNotificationAsync = async () => '';

export const cancelAllScheduledNotificationsAsync = async () => {};

export const setBadgeCountAsync = async () => {};

export const AndroidImportance = { MAX: 5, HIGH: 4, DEFAULT: 3, LOW: 2, MIN: 1 };

export const IosAuthorizationStatus = { AUTHORIZED: 2, PROVISIONAL: 3, DENIED: 0, NOT_DETERMINED: 1 };

export default {
  requestPermissionsAsync,
  getPermissionsAsync,
  setNotificationHandler,
  addNotificationReceivedListener,
  addNotificationResponseReceivedListener,
  getExpoPushTokenAsync,
};
