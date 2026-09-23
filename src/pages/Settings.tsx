import Header from '@/components/layout/Header';
import { useToast } from '@/context/toastContext';
import { useFetch, useUpdate } from '@/hooks/useApi';
import { BuyerProfileSettings, Order } from '@/interfaces/interface';
import { getBuyerProfile } from '@/services/auth';
import { getOrders } from '@/services/orders';
import { updatateBuyerProfile } from '@/services/settings';
import * as Notifications from '@/utils/platform/notifications';
import { useFocusEffect } from '@/router';
import { Bell, Moon, Sun } from 'lucide-react';
import { useColorScheme } from '@/utils/platform/colorScheme';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, findNodeHandle, Linking, Platform, Switch, TextInput, TouchableOpacity } from '@/components/common/ui';
import { KeyboardAwareScrolldiv } from '@/components/layout/KeyboardAwareScrollView';
import { SafeAreadiv } from '@/components/layout/SafeArea';

interface OrderContactDetails {
    name: string;
    phone: string;
}

// Reusable Skeleton Pulse Component
const Skeleton = ({ width, height, borderRadius = 8, className = '' }: { width: number | string; height: number; borderRadius?: number; className?: string }) => {
    const opacity = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
                Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
            ])
        );
        animation.start();
        return () => animation.stop();
    }, [opacity]);

    return (
        <Animated.div
            style={{ width: width as any, height, borderRadius, opacity }}
            className={`bg-gray-200 ${className}`}
        />
    );
};

export default function SettingsScreen() {
    // 1. Core form state values
    const [primaryData, setPrimaryData] = useState<Partial<BuyerProfileSettings>>({
        default_address: '',
        default_latitude: '',
        default_longitude: '',
        primary_checkout_phone: '',
        primary_checkout_name: '',
    });

    // 2. Separate independent state for suggestions
    const [suggestedContact, setSuggestedContact] = useState<OrderContactDetails | null>(null);
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);

    // Hooks
    const { data: orders, loading: loadingOrders } = useFetch<Order>(() => getOrders());
    const { execute: performUpdate, loading: isUpdating } = useUpdate<BuyerProfileSettings>(() => updatateBuyerProfile('', primaryData as BuyerProfileSettings));
    const { data: buyerProfile, loading: buyerProfileLoading, refetch: refetchBuyerProfiele } =
        useFetch<BuyerProfileSettings>(() => getBuyerProfile());

    const { showSuccess, showError } = useToast();
    const { colorScheme, toggleColorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    const scrollRef = useRef<KeyboardAwareScrolldiv>(null);

    useFocusEffect(
        useCallback(() => {
            refetchBuyerProfiele(null);
        }, [])
    );

    // Populate state from Buyer Profile first, or fall back to Orders
    useEffect(() => {
        if (buyerProfile) {
            setPrimaryData(prev => ({
                ...prev,
                primary_checkout_name: buyerProfile.primary_checkout_name || '',
                primary_checkout_phone: buyerProfile.primary_checkout_phone || '',
                default_address: buyerProfile.default_address || '',
            }));
        }

        if (orders?.results?.length > 0) {
            const latest = orders.results[0];
            setSuggestedContact({
                name: latest.buyer_name || '',
                phone: latest.phone || '',
            });
        }
    }, [buyerProfile, orders]);

    const handleInputFocus = useCallback((event: any) => {
        const node = findNodeHandle(event.target);
        if (node && scrollRef.current) {
            scrollRef.current.scrollToFocusedInput(node, 120);
        }
    }, []);

    const handleApplySuggestion = (suggestion: OrderContactDetails) => {
        setPrimaryData(prev => ({
            ...prev,
            primary_checkout_name: suggestion.name,
            primary_checkout_phone: suggestion.phone
        }));
    };

    const checkNotificationPermissions = async () => {
        try {
            const { status } = await Notifications.getPermissionsAsync();
            setNotificationsEnabled(status === 'granted');
        } catch (error) {
            console.error('Error checking notification permissions:', error);
            setNotificationsEnabled(false);
        }
    };

    const handleNotificationToggle = async () => {
        if (notificationsEnabled) {
            // If already enabled, do nothing (user would need to disable in system settings)
            return;
        }

        try {
            const { status } = await Notifications.requestPermissionsAsync();
            if (status === 'granted') {
                setNotificationsEnabled(true);
                showSuccess('Notifications enabled successfully!');
            } else {
                // Open app settings if permission was denied
                if (Platform.OS === 'ios') {
                    Linking.openURL('app-settings:');
                } else {
                    Linking.openSettings();
                }
            }
        } catch (error) {
            console.error('Error requesting notification permissions:', error);
            showError('Failed to enable notifications. Please check your app settings.');
        }
    };

    useEffect(() => {
        checkNotificationPermissions();
    }, []);

    const handleSaveConfigurations = async () => {
        const name = primaryData.primary_checkout_name?.trim();
        const phone = primaryData.primary_checkout_phone?.trim();

        // Optional Validation: Only block if ALL fields are completely empty
        if (!name && !phone) {
            showError("Please enter at least a contact name or phone number to save.");
            return;
        }

        // Build clean payload without empty string overwrites
        const updatePayload: Partial<BuyerProfileSettings> = { ...primaryData };
        if (name) updatePayload.primary_checkout_name = name;
        if (phone) updatePayload.primary_checkout_phone = phone;

        const result = await performUpdate('', updatePayload as BuyerProfileSettings);

        if (!result.success) {
            showError(result.error);
            return;
        }

        refetchBuyerProfiele(null);
        showSuccess('Your checkout defaults have been updated successfully.');
    };

    return (
        <SafeAreadiv className={isDark ? 'flex-1 bg-sand-950' : 'flex-1 bg-gray-50'} edges={['top', 'left', 'right']}>
            {/* Instant Rendered Fixed Header */}
            <div className={isDark ? 'px-4 sm:px-6 lg:px-8 pt-3 pb-2 bg-sand-950 border-b border-sand-800' : 'px-4 sm:px-6 lg:px-8 pt-3 pb-2 bg-gray-50 border-b border-gray-100'}>
                <div className="flex flex-row items-center justify-between w-full max-w-3xl mx-auto">
                    <div className="flex-1 mr-3">
                        <Header title='Profile Settings' subtitle='Manage your personal checkout defaults and preferences.' />
                    </div>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={toggleColorScheme}
                        className={isDark ? 'flex-row items-center gap-2 bg-sand-800 px-3 py-2 rounded-full border border-sand-700' : 'flex-row items-center gap-2 bg-white px-3 py-2 rounded-full border border-gray-200 '}
                    >
                        {isDark ? <Sun size={15} color="#FBBF24" /> : <Moon size={15} color="#475569" />}
                        <p className={isDark ? 'text-xs font-jakarta-semibold text-sand-100' : 'text-xs font-jakarta-semibold text-sand-700'}>
                            {isDark ? 'Light' : 'Dark'}
                        </p>
                    </TouchableOpacity>
                </div>
            </div>

            {/* Scrollable Content Body */}
            <KeyboardAwareScrolldiv
                ref={scrollRef}
                className={isDark ? 'flex-1 px-4 sm:px-6 lg:px-8 bg-sand-950 w-full max-w-3xl mx-auto' : 'flex-1 px-4 sm:px-6 lg:px-8 bg-gray-50 w-full max-w-3xl mx-auto'}
                contentContainerStyle={{ paddingTop: 16, paddingBottom: 60, gap: 16 }}
                showsVerticalScrollIndicator={false}
                enableOnAndroid={true}
                enableAutomaticScroll={true}
                extraHeight={120}
                extraScrollHeight={120}
                keyboardShouldPersistTaps='handled'
            >
                {/* 1. Smart Suggestion Section (With Skeleton) */}
                {loadingOrders ? (
                    <div className={isDark ? 'bg-sand-900 rounded-xl p-4 border border-sand-700' : 'bg-brand-50/60 rounded-xl p-4 border border-blue-100'}>
                        <Skeleton width={120} height={14} className="mb-2" />
                        <Skeleton width="80%" height={12} className="mb-3" />
                        <Skeleton width="100%" height={48} borderRadius={8} />
                    </div>
                ) : suggestedContact ? (
                    <div className={isDark ? 'bg-sand-900 rounded-xl p-4 border border-sand-700 ' : 'bg-brand-50/60 rounded-xl p-4 border border-blue-100 '}>
                        <p className={isDark ? 'text-xs font-jakarta-bold text-amber-300 tracking-wider mb-1' : 'text-xs font-jakarta-bold text-blue-800 tracking-wider mb-1'}>
                            Smart Suggestion
                        </p>
                        <p className={isDark ? 'text-xs font-jakarta-medium text-sand-300 mb-3' : 'text-xs font-jakarta-medium text-gray-500 mb-3'}>
                            We found these details from your last order. Tap below to use them as defaults.
                        </p>

                        <div className={isDark ? 'bg-sand-800 rounded-lg p-3 border border-sand-700 flex-row justify-between items-center' : 'bg-white rounded-lg p-3 border border-blue-100/50 flex-row justify-between items-center'}>
                            <div className="flex-1 mr-2">
                                <p className={isDark ? 'text-sm font-jakarta-semibold text-sand-50' : 'text-sm font-jakarta-semibold text-gray-900'} numberOfLines={1}>
                                    {suggestedContact.name}
                                </p>
                                <p className={isDark ? 'text-xs font-jakarta-medium text-sand-400' : 'text-xs font-jakarta-medium text-gray-400'}>
                                    {suggestedContact.phone}
                                </p>
                            </div>

                            <TouchableOpacity
                                className="bg-brand-600 active:bg-brand-700 px-3 py-2 rounded-lg"
                                onPress={() => handleApplySuggestion(suggestedContact)}
                            >
                                <p className="text-white font-jakarta-semibold text-xs">Use These</p>
                            </TouchableOpacity>
                        </div>
                    </div>
                ) : null}

                {/* 2. Current Active Details Section (With Skeleton) */}
                {buyerProfileLoading ? (
                    <div className="bg-white rounded-xl p-4 border border-gray-100 ">
                        <Skeleton width={140} height={14} className="mb-2" />
                        <Skeleton width={100} height={16} className="mb-1" />
                        <Skeleton width={80} height={12} />
                    </div>
                ) : buyerProfile && (buyerProfile.primary_checkout_name || buyerProfile.primary_checkout_phone) ? (
                    <div className={isDark ? 'bg-sand-900 rounded-xl p-4 border border-sand-700 ' : 'bg-white rounded-xl p-4 border border-gray-100 '}>
                        <p className={isDark ? 'text-xs font-jakarta-bold text-amber-300 tracking-wider mb-1' : 'text-xs font-jakarta-bold text-blue-800 tracking-wider mb-1'}>
                            Current Checkout Details
                        </p>
                        <p className={isDark ? 'text-sm font-jakarta-semibold text-sand-50' : 'text-sm font-jakarta-semibold text-gray-900'}>
                            {buyerProfile.primary_checkout_name || 'Not set'}
                        </p>
                        <p className={isDark ? 'text-xs font-jakarta-medium text-sand-400' : 'text-xs font-jakarta-medium text-gray-400'}>
                            {buyerProfile.primary_checkout_phone || 'Not set'}
                        </p>
                    </div>
                ) : null}

                {/* Notification Settings */}
                <div className={isDark ? 'bg-sand-900 rounded-xl p-4 border border-sand-700 ' : 'bg-white rounded-xl p-4 border border-gray-100 '}>
                    <div className="flex flex-row items-center justify-between">
                        <div style={{ gap: 2 }}>
                            <div className="flex flex-row items-center" style={{ gap: 8 }}>
                                <Bell size={16} color="#475569" />
                                <p className="text-xs font-jakarta-bold text-blue-800 tracking-wider">
                                    Push Notifications
                                </p>
                            </div>
                            <p className="text-xs font-jakarta-medium text-gray-500">
                                Receive order updates and promotions
                            </p>
                        </div>
                        <Switch
                            value={notificationsEnabled}
                            onValueChange={handleNotificationToggle}
                            trackColor={{ false: '#CBD5E1', true: '#F59E0B' }}
                            thumbColor="#FAFAF9"
                        />
                    </div>
                </div>

                {/* 3. Primary Configuration Form */}
                <div className={isDark ? 'bg-sand-900 rounded-xl p-5 border border-sand-700 ' : 'bg-white rounded-xl p-5 border border-gray-100 '}>
                    <p className={isDark ? 'text-xs font-jakarta-semibold text-sand-400 tracking-wider mb-4' : 'text-xs font-jakarta-semibold text-gray-400 tracking-wider mb-4'}>
                        Primary Checkout Defaults
                    </p>

                    <div style={{ gap: 16 }}>
                        {/* Name Input Field */}
                        <div>
                            <p className={isDark ? 'text-xs font-jakarta-medium text-sand-300 mb-1.5' : 'text-xs font-jakarta-medium text-gray-500 mb-1.5'}>Default Contact Name (Optional)</p>
                            {buyerProfileLoading ? (
                                <Skeleton width="100%" height={48} borderRadius={8} />
                            ) : (
                                <TextInput
                                    onFocus={handleInputFocus}
                                    className={isDark ? 'w-full bg-sand-800 border border-sand-600 rounded-lg px-4 py-3 text-sm font-jakarta-medium text-sand-50' : 'w-full bg-gray-50 border border-gray-200/80 rounded-lg px-4 py-3 text-sm font-jakarta-medium text-gray-900 focus:border-blue-500'}
                                    placeholder="Enter full checkout name"
                                    placeholderTextColor={isDark ? '#94A3B8' : '#94A3B8'}
                                    value={primaryData.primary_checkout_name || ''}
                                    onChangeText={(text) => setPrimaryData(prev => ({
                                        ...prev,
                                        primary_checkout_name: text
                                    }))}
                                />
                            )}
                        </div>

                        {/* Phone Input Field */}
                        <div>
                            <p className={isDark ? 'text-xs font-jakarta-medium text-sand-300 mb-1.5' : 'text-xs font-jakarta-medium text-gray-500 mb-1.5'}>Default Phone Number (Optional)</p>
                            {buyerProfileLoading ? (
                                <Skeleton width="100%" height={48} borderRadius={8} />
                            ) : (
                                <TextInput
                                    onFocus={handleInputFocus}
                                    className={isDark ? 'w-full bg-sand-800 border border-sand-600 rounded-lg px-4 py-3 text-sm font-jakarta-medium text-sand-50' : 'w-full bg-gray-50 border border-gray-200/80 rounded-lg px-4 py-3 text-sm font-jakarta-medium text-gray-900 focus:border-blue-500'}
                                    placeholder="Enter phone number"
                                    placeholderTextColor={isDark ? '#94A3B8' : '#94A3B8'}
                                    keyboardType="phone-pad"
                                    value={primaryData.primary_checkout_phone || ''}
                                    onChangeText={(text) => setPrimaryData(prev => ({
                                        ...prev,
                                        primary_checkout_phone: text
                                    }))}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Form Submission Trigger */}
                <TouchableOpacity
                    className={`w-full py-4 rounded-xl items-center justify-center  ${
                        isUpdating ? 'bg-blue-400' : 'bg-brand-500 active:bg-brand-700'
                    }`}
                    onPress={handleSaveConfigurations}
                    disabled={isUpdating || buyerProfileLoading}
                >
                    {isUpdating ? (
                        <ActivityIndicator color="#ffffff" />
                    ) : (
                        <p className="text-white font-jakarta-semibold text-base">
                            Save Primary Configuration
                        </p>
                    )}
                </TouchableOpacity>
            </KeyboardAwareScrolldiv>
        </SafeAreadiv>
    );
}