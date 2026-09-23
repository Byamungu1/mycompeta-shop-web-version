import NotificationsScreen from '@/components/notifications/NotificationScreen'
import { getNotifications } from '@/services/notifications'

const notifications = () => {
  return (
    <NotificationsScreen 
    notif_type='seller'
    fetcher={()=> getNotifications('seller')}
    headerTitle='Seller Activity'
    />
  )
}

export default notifications