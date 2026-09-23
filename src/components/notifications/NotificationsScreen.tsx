// components/NotificationsScreen.tsx
import Header from '@/components/layout/Header';
import { useGlobalCounts } from '@/context/globalCountContext';
import { useFetch } from '@/hooks/useApi';
import { useGroupedByDate } from '@/hooks/useGroupedByDate';
import { Notification } from '@/interfaces/interface';
import { NotificationCategory } from '@/interfaces/types/types';
import { getNotifications, markRead } from '@/services/notifications';
import { formatDate } from '@/utils/formatDate';
import { useFocusEffect } from '@/router';
import { Check, CreditCard, ShoppingBag, Tag, User } from 'lucide-react';
import { useCallback } from 'react';
import { ActivityIndicator, SectionList, TouchableOpacity } from '@/components/common/ui';
import { SafeAreadiv } from '@/components/layout/SafeArea';

interface Section {
    title: string;
    data: Notification[];
}

interface NotificationScreenProps {
    fetcher?: (notif_type: string) => Promise<Notification[]>;
    onItemPress?: (notification: Notification) => void;
    headerTitle?: string;
    notif_type?: string;
}

const CATEGORY_CONFIG: Record<NotificationCategory, {
    icon: React.ReactNode;
    bgClass: string;
}> = {
    order: {
        icon: <ShoppingBag size={16} className='text-info-600' />,
        bgClass: 'bg-info-100',
    },
    payment: {
        icon: <CreditCard size={16} className="text-delivery-500" />,
        bgClass: 'bg-emerald-100',
    },
    promo: {
        icon: <Tag size={16} className="text-market-600" />,
        bgClass: 'bg-amber-100',
    },
    account: {
        icon: <User size={16} color='#8B5CF6' />,
        bgClass: 'bg-violet-100',
    },
};

const NotificationItem = ({
    item,
    index,
    onPress,
}: {
    item: Notification;
    onPress: (item: Notification) => void;
    index: number;
}) => {
    const category = item.notif_type.includes('order') ? 'order' : item.notif_type

    const config = CATEGORY_CONFIG[category];

    return (
        <TouchableOpacity
            onPress={() => onPress(item)}
            activeOpacity={0.75}
            className={`flex flex-row border-b border-sand-400 border-1 items-start px-4 py-4 ${!item.is_read ? 'bg-info-400/10' : 'bg-sand-100'}`}
            style={{ gap: 12 }}>

            {/* Icon */}
            <div className={`w-10 h-10 rounded-lg items-center justify-center ${config.bgClass}`}>
                {config.icon}
            </div>

            {/* Content */}
            <div className='flex-1' style={{ gap: 2 }}>
                <div className='flex flex-row items-center justify-between'>
                    <p className={`text-sm ${!item.is_read
                        ? 'font-jakarta-bold text-sand-900'
                        : 'font-jakarta-semibold text-sand-700'}`}>
                        {item.title}
                    </p>
                    {!item.is_read && (
                        <div className='w-2 h-2 rounded-full bg-brand-500' />
                    )}
                </div>
                <p className='text-xs font-jakarta text-sand-600 leading-5' numberOfLines={2}>
                    {item.body}
                </p>
                <p className='text-xs font-jakarta-bold text-sand-500 mt-1'>
                    {formatDate(item.created_at)}
                </p>
            </div>
        </TouchableOpacity>
    );
};

const SectionHeader = ({ title }: { title: string }) => (
    <div className='px-4 py-2 bg-sand-100'>
        <p className='text-xs font-jakarta-bold text-sand-500 uppercase tracking-widest'>
            {title}
        </p>
    </div>
);

const Divider = () => (
    <div className='h-px bg-brand-300 mx-4' />
);

const EmptyState = () => (
    <div className='flex-1 items-center justify-center mt-32' style={{ gap: 12 }}>
        <div className='w-16 h-16 bg-sand-100 rounded-full items-center justify-center'>
            <Check size={28} color='#94A3B8' />
        </div>
        <p className='font-jakarta-bold text-base text-sand-700'>All caught up</p>
        <p className='font-jakarta text-sm text-sand-400 text-center px-8'>
            No new notifications right now. Check back later.
        </p>
    </div>
);

const NotificationsScreen = ({
    fetcher = getNotifications,
    onItemPress,
    headerTitle = "Notifications",
    notif_type='buyer'
}: NotificationScreenProps) => {

    const { data: notifications, loading: notificationLoading, error, refetch } = useFetch(() => fetcher('buyer'));
    const [sections, recalculate] = useGroupedByDate(notifications, (notif) => notif.created_at);
    const { counts, refetchNotifications } = useGlobalCounts();

    useFocusEffect(
        useCallback(() => {
            refetch('buyer');
            refetchNotifications(notif_type);
        }, [recalculate])
    );

    const markAllRead = async () => {
        await markRead('', true);
        await refetch(null);
        refetchNotifications(notif_type);
    };

    const handleMarkRead = async (notification: Notification) => {
        await markRead(notification.id);
        await refetch(null);
        refetchNotifications(notif_type);

        if (onItemPress) {
            onItemPress(notification);
        }
    };

    if (notificationLoading && !error) {
        return (
            <div className='w-full h-full justify-center items-center'>
                <ActivityIndicator />
            </div>
        );
    }

    if (error && (!sections || sections.length === 0)) {
        return (
            <div className='w-full h-full justify-center items-center'>
                <p className='text-market-500 text-sm font-jakarta-bold'>
                    An Error Occurred while loading notifications
                </p>
            </div>
        );
    }

    return (
        <SafeAreadiv className='bg-sand-100 flex-1'>
            <div className='flex flex-row items-center justify-between px-4 pt-4 pb-2'>
                <div style={{ gap: 2 }}>
                    <Header 
                        title={headerTitle} 
                        subtitle={`${counts.unreadNotifications} unread`} 
                    />
                </div>
                {counts.unreadNotifications > 0 && (
                    <TouchableOpacity
                        onPress={markAllRead}
                        activeOpacity={0.7}
                        className='px-3 py-1.5 bg-sand-100 rounded-full'>
                        <p className='text-xs font-jakarta-semibold text-info-600'>
                            Mark all read
                        </p>
                    </TouchableOpacity>
                )}
            </div>

            <SectionList
                sections={sections}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
                renderItem={({ item, index }) => (
                    <NotificationItem 
                        key={item.id || index} 
                        index={index} 
                        item={item} 
                        onPress={() => handleMarkRead(item)} 
                    />
                )}
                renderSectionHeader={({ section }) => (
                    <SectionHeader title={section.title} />
                )}
                ItemSeparatorComponent={Divider}
                ListEmptyComponent={EmptyState}
                contentContainerStyle={{ paddingBottom: 120, gap: 2 }}
                stickySectionHeadersEnabled={true}
            />
        </SafeAreadiv>
    );
};

export default NotificationsScreen;