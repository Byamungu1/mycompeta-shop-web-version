/**
 * @react-native-firebase/messaging → web no-op.
 *
 * Web push needs a VAPID key and a service worker, which this port does not
 * configure, so push registration simply resolves without a token.
 */

const AuthorizationStatus = {
  STATUS_NOT_DETERMINED: -1,
  STATUS_DENIED: 0,
  STATUS_AUTHORIZED: 1,
  STATUS_PROVISIONAL: 2,
  NOT_DETERMINED: -1,
  DENIED: 0,
  AUTHORIZED: 1,
  PROVISIONAL: 2,
};

const messaging = () => ({
  requestPermission: async () => AuthorizationStatus.AUTHORIZED,
  hasPermission: async () => AuthorizationStatus.AUTHORIZED,
  getToken: async () => '',
  deleteToken: async () => true,
  onMessage: (_cb: any) => () => {},
  onNotificationOpenedApp: (_cb: any) => () => {},
  getInitialNotification: async () => null,
  onTokenRefresh: (_cb: any) => () => {},
  setBackgroundMessageHandler: (_cb: any) => {},
  subscribeToTopic: async () => {},
  unsubscribeFromTopic: async () => {},
  AuthorizationStatus,
});

messaging.AuthorizationStatus = AuthorizationStatus;

export { AuthorizationStatus };
export default messaging;
