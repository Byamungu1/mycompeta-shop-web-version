// app/(root)/notification/[id].tsx
import { useLocalSearchParams, useRouter } from '@/router';
import { TouchableOpacity } from '@/components/common/ui';
import { SafeAreadiv } from '@/components/layout/SafeArea';

import NotificationDetailScreen from '@/components/notifications/NotificationDetailScreen';


export default function NotificationDetail() {
  const router = useRouter();
  const {notificationData} = useLocalSearchParams<{notificationData?: string | undefined}>()

  let notification: Notification | null = null;
  console.log('the raw notification', notificationData)
  if (notificationData) {
    try {
      notification = JSON.parse(decodeURIComponent(notificationData));
    } catch (e) {
      console.error("Failed to parse notification payload:", e);
    }
  }
  // Fallback state if no notification prop is provided
  if (!notification) {
    return (
      <SafeAreadiv className="bg-sand-50 dark:bg-sand-950 flex-1">
        <div className="flex-1 justify-center items-center px-8">
          <div className="w-16 h-16 bg-sand-200 dark:bg-sand-800 rounded-full items-center justify-center mb-4">
            <p className="text-sand-600 dark:text-sand-300 text-2xl font-bold">!</p>
          </div>
          <p className="text-center font-jakarta-bold text-sand-900 dark:text-sand-50 text-base mb-2">
            Notification not found
          </p>
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-brand-500 active:bg-brand-600 rounded-xl py-3 px-6 mt-4"
          >
            <p className="text-sand-900 font-jakarta-semibold">Go Back</p>
          </TouchableOpacity>
        </div>
      </SafeAreadiv>
    );
  }

  // Render detail screen using the passed prop
  return <NotificationDetailScreen notification={notification} />;
}