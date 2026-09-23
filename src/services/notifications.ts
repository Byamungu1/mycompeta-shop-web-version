import api from '@/utils/api';
import messaging from '@/utils/platform/messaging';

export async function registerForNativePushNotifications() {

    // 1. Prompt the user for OS system permission
    const authStatus = await messaging().requestPermission();
    const isEnabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!isEnabled) {
      console.log('User completely opted-out of device alerts.');
      return null;
    }

    // 2. Request the raw, unique native Firebase device token
    const nativeToken = await messaging().getToken();
    console.log("🚀 Native FCM Device Token:", nativeToken);

    // 3. Post the token string to your Django backend register view path
    const response = await api.post('notification/devices/register/',
      { expo_push_token: nativeToken }, // Reuses your existing model field name
    );


    return response;
  }


export function setupNotificationListeners() {
  // 1. FOREGROUND STATE: When the app is actively open on the screen
  const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
    console.log('🔥 Push received in foreground:', remoteMessage);
    
   /* if (remoteMessage.notification) {
      Alert.alert(
        remoteMessage.notification.title || "Order Update",
        remoteMessage.notification.body || ""
      );
    }*/
  });

  // 2. BACKGROUND/QUIT STATE INTERACTION: When a user clicks the notification banner
  const unsubscribeNotificationClick = messaging().onNotificationOpenedApp(remoteMessage => {
    console.log('Notification caused app to open from background state:', remoteMessage.data);
    // You can handle navigation here using router.push() if you pass custom keys like order_id
  });

  // 3. CLOSED/KILLED STATE: If the app was completely terminated
  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        console.log('Notification caused app to open from completely closed state:', remoteMessage.data);
      }
    });

  // Return a cleanup function to unbind listeners when components unmount
  return () => {
    unsubscribeForeground();
    unsubscribeNotificationClick();
  };
}

export const getNotifications = async(notif_type='')=>{

   const endpoint = notif_type === 'buyer'? 'notification/inbox/': 'seller/notifications/inbox/'
   const response = await api.get(endpoint)
   return response
}

export const markRead = async(notificationId='', markAll=false)=>{
  const endpoint = markAll? 'notification/inbox/read-all/' : `notification/inbox/${notificationId.toString()}/read/`
 const response = await api.put(endpoint)
 return response
}
