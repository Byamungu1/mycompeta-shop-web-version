// components/NotificationDetailScreen.tsx
import Header from '@/components/layout/Header';
import { useLoadingSpinner } from '@/context/loadingSpinnerContext';
import { Notification } from '@/interfaces/interface';
import { formatDate } from '@/utils/formatDate';
import { useRouter } from '@/router';
import { CreditCard, ShoppingBag, Tag, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Scrolldiv, TouchableOpacity } from '@/components/common/ui';
import { SafeAreadiv } from '@/components/layout/SafeArea';

interface NotificationDetailScreenProps {
    notification: Notification;
}

const CATEGORY_CONFIG: Record<string, {
    icon: React.ReactNode;
    bgClass: string;
    gradientColors: string[];
    titleColor: string;
    brandColor: string;
}> = {
    order_placed: {
        icon: <ShoppingBag size={24} className='text-brand-500' />,
        bgClass: 'bg-brand-100',
        gradientColors: ['#FEF3C7', '#FDE68A'],
        titleColor: '#B45309',
        brandColor: 'brand-500',
    },
    payment: {
        icon: <CreditCard size={24} className="text-brand-500" />,
        bgClass: 'bg-brand-100',
        gradientColors: ['#D1FAE5', '#A7F3D0'],
        titleColor: '#059669',
        brandColor: 'brand-500',
    },
    promo: {
        icon: <Tag size={24} className="text-market-500" />,
        bgClass: 'bg-market-100',
        gradientColors: ['#FEF3C7', '#FDE68A'],
        titleColor: '#D97706',
        brandColor: 'market-500',
    },
    account: {
        icon: <User size={24} className='text-brand-500' />,
        bgClass: 'bg-brand-100',
        gradientColors: ['#EDE9FE', '#DDD6FE'],
        titleColor: '#7C3AED',
        brandColor: 'brand-500',
    },
    system: {
        icon: <User size={24} className='text-sand-600' />,
        bgClass: 'bg-sand-200',
        gradientColors: ['#F1F5F9', '#E2E8F0'],
        titleColor: '#64748B',
        brandColor: 'sand-600',
    },
};

const NotificationDetailScreen = ({ notification }: NotificationDetailScreenProps) => {
    const router = useRouter();
    const { LoadingSpinner } = useLoadingSpinner();
    const [isLoading, setIsLoading] = useState(true);
    const category = notification.notif_type.includes('order') ? 'order_placed' : notification.notif_type;
    const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG['system'];

    useEffect(() => {
        // Simulate loading for better UX
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 300);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return (
            <SafeAreadiv className='bg-sand-100 flex-1'>
                <div className='px-4 pt-4 pb-2'>
                    <Header title="Notification Detail" />
                </div>
                <LoadingSpinner />
            </SafeAreadiv>
        );
    }

    return (
        <SafeAreadiv className='bg-sand-100 flex-1'>
            {/* Header - Always visible */}
            <div className='px-4 pt-4 pb-2 bg-sand-100'>
                <Header title="Notification Detail" subtitle={formatDate(notification.created_at)} />
            </div>

            <Scrolldiv 
                className='flex-1' 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}
            >
                {/* Category Hero Section */}
                <div 
                    className='mx-4 rounded-lg p-5 mb-4'
                    style={{
                        backgroundColor: config.gradientColors[0],
                        borderWidth: 1,
                        borderColor: config.gradientColors[1],
                        shadowColor: config.titleColor,
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.08,
                        shadowRadius: 4,
                        elevation: 2,
                    }}
                >
                    <div className='flex-row items-center justify-between mb-3'>
                        <div className={`w-12 h-12 rounded-xl items-center justify-center ${config.bgClass}`}>
                            {config.icon}
                        </div>
                      
                    </div>
                    
                    <p 
                        className='text-xl font-jakarta-bold mb-2 leading-tight'
                        style={{ color: config.titleColor }}
                    >
                        {notification.title}
                    </p>
                    
                    <div className='h-px bg-white/30 my-2' />
                    
                    <p className='text-sm font-jakarta text-sand-800 leading-relaxed'>
                        {notification.body}
                    </p>
                </div>

                {/* Additional Info Card */}
                <div className='mx-4 bg-white rounded-xl p-4 mb-4  border border-sand-200'>
                    <div className='flex-row items-center mb-3'>
                        <div className='w-1 h-4 rounded-full bg-brand-500' />
                        <p className='ml-3 text-sm font-jakarta-bold text-sand-900 uppercase tracking-wider'>
                            Details
                        </p>
                    </div>
                    
                    <div className='space-y-3'>
                      
                        
                        <div className='flex-row justify-between items-center py-2 border-b border-sand-100'>
                            <p className='text-sm font-jakarta text-sand-500'>Status</p>
                            <div className='flex-row items-center'>
                                <div className='w-2 h-2 rounded-full bg-brand-500 mr-2' />
                                <p className='text-sm font-jakarta-semibold text-sand-900'>
                                    {notification.is_read ? 'Read' : 'Unread'}
                                </p>
                            </div>
                        </div>
                        
                        <div className='flex-row justify-between items-center py-2'>
                            <p className='text-sm font-jakarta text-sand-500'>Received</p>
                            <p className='text-sm font-jakarta-semibold text-sand-900'>
                                {formatDate(notification.created_at)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Reading Tips Card */}
                <div className='mx-4 bg-sand-50 rounded-xl p-4 mb-4 border border-sand-200'>
                    <div className='flex-row items-start'>
                        <div className='w-8 h-8 rounded-full bg-brand-100 items-center justify-center mr-3 mt-0.5'>
                            <p className='text-brand-600 font-jakarta-bold text-sm'>!</p>
                        </div>
                        <div className='flex-1'>
                            <p className='text-sm font-jakarta-bold text-sand-900 mb-1'>
                                Did you know?
                            </p>
                            <p className='text-xs font-jakarta text-sand-600 leading-relaxed'>
                                Keep your notifications organized to stay updated with important updates about your orders, payments, and account activity.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className='mx-4 mb-4 space-y-3'>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        activeOpacity={0.75}
                        className='bg-brand-500 rounded-xl py-3.5 px-6 items-center shadow-md'
                    >
                        <p className='text-base font-jakarta-bold text-sand-800'>
                            Back to Notifications
                        </p>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        onPress={() => {
                            // In a real app, you would call an API to mark as unread
                            // For now, just navigate back
                            router.back();
                        }}
                        activeOpacity={0.75}
                        className='bg-sand-100 rounded-xl py-3.5 px-6 items-center border border-sand-300'
                    >
                        <p className='text-base font-jakarta-semibold text-sand-700'>
                            Mark as Unread
                        </p>
                    </TouchableOpacity>
                </div>
            </Scrolldiv>
        </SafeAreadiv>
    );
};

export default NotificationDetailScreen;