import { shippingInfo } from '@/assets/constants/data';
import CustomPicker from '@/components/common/CustomPicker';
import DeliverySettingsSegment from '@/components/checkout/DeliverySettings';
import DistanceCalculator from '@/components/checkout/DistanceCalculator';
import Header from '@/components/layout/Header';
import RefetchData from '@/components/common/RefetchData';
import { useFetch, useUpdate } from '@/hooks/useApi';
import useDataInfo from '@/hooks/useDataInfo';
import { getSellerProfile, updateSellerProfile } from '@/services/seller';

import { useToast } from '@/context/toastContext';
import { SellerProfile } from '@/interfaces/interface';
import updateAddress from '@/utils/updateAddress';
import * as Notifications from '@/utils/platform/notifications';
import { useFocusEffect } from '@/router';
import {
    Bell,
    Briefcase,
    Edit2,
    Moon,
    Save,
    Store,
    Sun,
    Truck
} from 'lucide-react';
import { useColorScheme } from '@/utils/platform/colorScheme';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator, Linking, Platform, Scrolldiv,
    Switch,
    TextInput,
    TouchableOpacity
} from '@/components/common/ui';
import { SafeAreadiv } from '@/components/layout/SafeArea';

// ─── Sub-components ───────────────────────────────────────────────────────────

const SectionLabel = ({ text, icon: Icon }: { text: string; icon: React.ComponentType<any> }) => (
    <div className="flex flex-row items-center mb-3 mt-2" style={{ gap: 6 }}>
        <Icon size={16} className="text-sand-500 dark:text-sand-400" color="#71717A" />
        <p className="font-jakarta-bold text-md text-sand-500 dark:text-sand-400 tracking-widest">
            {text}
        </p>
    </div>
);

const FormInput = ({
    label,
    placeholder,
    value,
    onChangeText,
    keyboardType = 'default',
    isDark = false
}: {
    label: string;
    placeholder: string;
    value: string;
    onChangeText: (t: string) => void;
    keyboardType?: 'default' | 'phone-pad' | 'numeric';
    isDark?: boolean;
}) => (
    <div style={{ gap: 6 }} className="mb-4">
        <p className="font-jakarta-semibold text-xs text-sand-700 dark:text-sand-300">{label}</p>
        <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
            keyboardType={keyboardType}
            className="w-full bg-sand-300 dark:bg-sand-900 rounded-xl px-4 py-3 font-jakarta text-sm text-sand-900 dark:text-sand-100 border border-transparent dark:border-sand-800 focus:border-brand-500"
        />
    </div>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

const StoreScreen = () => {
    const [form, setForm] = useState<SellerProfile>({
        shop_name: '',
        shop_description: '',
        coordinates: {
            shop_latitude: 0,
            shop_longitude: 0,
        },
        img: null,
        delivery_radius_km: '',
        delivery_available: true,
        is_active: true,
        delivery_fee: 0,
        address: {
            kakuma: '',
            zone: '',
            block: ''
        },
        whatsapp_number: '',
        phone_number: '',
        physical_location: '',
    });

    const [isEditingLocation, setIsEditingLocation] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);

    const { data: seller, error, loading, refetch } = useFetch<SellerProfile>(() => getSellerProfile());
    const { data: updatedSeller, error: updatedSellerError,
        loading: updatedSellerLoading, execute: updateSeller }
        = useUpdate<SellerProfile>(() => updateSellerProfile(form));

    const { dataInfo, setDataInfo, handleToggle } = useDataInfo(shippingInfo);
    const scrollRef = useRef<Scrolldiv>(null);
    const { showError, showSuccess } = useToast();
    const { colorScheme, toggleColorScheme, setColorScheme } = useColorScheme();

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await refetch(null);
        setIsRefreshing(false);
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

    const isDark = colorScheme === 'dark';

    // Toggle Handler
    const toggleTheme = () => {
        setColorScheme(isDark ? 'light' : 'dark');
    };

    const handleNotificationToggle = async () => {
        if (notificationsEnabled) return;

        try {
            const { status } = await Notifications.requestPermissionsAsync();
            if (status === 'granted') {
                setNotificationsEnabled(true);
                showSuccess('Notifications enabled successfully!');
            } else {
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

    const handleInputChange = <K extends keyof SellerProfile>(key: K, value: SellerProfile[K]) => {
        setForm(prev => ({
            ...prev,
            [key]: value
        }));
    };

    useFocusEffect(
        useCallback(() => {
            refetch(null);
        }, [refetch])
    );

    useEffect(() => {
        if (seller) {
            setForm(seller);
        }
    }, [seller]);

    useEffect(() => {
        setTimeout(() => {
            scrollRef.current?.scrollToEnd({ animated: true });
        }, 0);
    }, [form.delivery_available]);

    const handleSaveSettings = async () => {
        const result = await updateSeller('', form);

        if (!result.success || !result.data) {
            showError(result.error?.phone_number || 'Failed to update the store!');
            return;
        }

        showSuccess('Store updated successfully!');
        setIsEditingLocation(false);
    };

    if (loading || !seller) {
        return (
            <SafeAreadiv className="flex-1 bg-sand-50 dark:bg-sand-950">
                <div className="px-4 md:px-6 lg:px-8 pt-4 pb-2">
                    <div style={{ gap: 2 }} className="flex-row items-center justify-between">
                        <Header title="Store Settings" subtitle="Manage your business presence" />
                        <RefetchData handleRefresh={handleRefresh} isRefreshing={isRefreshing} />
                    </div>
                </div>
                <div className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#F59E0B" />
                </div>
            </SafeAreadiv>
        );
    }

    const handleAddressSelect = (pickerLabel: string, selectedValue: string) => {
        setForm(prev => ({
            ...prev,
            address: {
                ...prev.address,
                [pickerLabel]: selectedValue
            }
        }));
    };

    const handleCaptureCoordinate = (coordinates: { longitude: number; latitude: number }) => {
        setForm(prev => ({
            ...prev,
            coordinates: {
                ...prev.coordinates,
                shop_longitude: coordinates.longitude,
                shop_latitude: coordinates.latitude
            }
        }));
    };

    console.log('RENDER — colorScheme is:', colorScheme);

    return (
        <SafeAreadiv key={colorScheme} className="flex-1 bg-sand-50 dark:bg-sand-950">
            <Scrolldiv
                ref={scrollRef}
                showsVerticalScrollIndicator={false}
                className="bg-sand-50 dark:bg-sand-950"
                key={colorScheme}
                contentContainerStyle={{ paddingBottom: 165 }}
            >
                {/* Header Context */}
                <div className="pt-4 pb-4 px-4 md:px-6 lg:px-8 bg-sand-50 dark:bg-sand-950 border-b border-sand-200" style={{ gap: 4 }}>
                    <div style={{ gap: 2 }} className="flex-row items-center justify-between">
                        <div className="flex-1 mr-3">
                            <Header title="Store Settings" subtitle="Manage your business presence" />
                        </div>
                        <div className="flex-row items-center justify-center gap-2">
                            {/*
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() => toggleTheme()}
                                className="bg-sand-100 dark:bg-sand-900 rounded-full border border-sand-200 dark:border-sand-800 flex-row items-center gap-2 px-3 py-2 "
                            >
                                {isDark ? <Sun size={15} color="#FBBF24" /> : <Moon size={15} color="#78716C" />}
                                <p className="font-jakarta-semibold text-xs text-sand-800 dark:text-sand-100">
                                    {isDark ? 'Light' : 'Dark'}
                                </p>
                            </TouchableOpacity>
                            */}
                            <RefetchData handleRefresh={handleRefresh} isRefreshing={isRefreshing} />

                            <div className="w-10 h-10 bg-brand-500 dark:bg-brand-500 rounded-full items-center justify-center overflow-hidden">
                                <p className="font-jakarta-bold text-lg text-sand-950 dark:text-sand-950">
                                    {form.shop_name ? form.shop_name.charAt(0) : 'S'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Wrapper */}
                <div className="px-4 md:px-6 lg:px-8 mt-4 lg:grid lg:grid-cols-2 lg:gap-x-8">

                    {/* ─── SECTION 1: STORE INFO ─── */}
                    <SectionLabel text="Store Information" icon={Store} />

                    <DistanceCalculator
                        role="seller"
                        profile={seller}
                        onLocationCaptured={(capturedCoordinates) => handleCaptureCoordinate(capturedCoordinates)}
                        autoFetch={false}
                        getCurrentLocationName={(locationName: string) => {
                            setForm(prev => ({
                                ...prev,
                                physical_location: locationName
                            }));
                            updateAddress(locationName, setForm);
                        }}
                        isForNearByProducts={false}
                        presentLocationName={form.physical_location}
                    />

                    {/* Logo Upload Card */}

                    <FormInput
                        label="Store Name"
                        placeholder="e.g. Cham Electronics"
                        value={form.shop_name}
                        onChangeText={(text) => handleInputChange('shop_name', text)}
                        isDark={isDark}
                    />
                    <FormInput
                        label="Description"
                        placeholder="e.g. Phones and Accessories"
                        value={form.shop_description}
                        onChangeText={(text) => handleInputChange('shop_description', text)}
                        isDark={isDark}
                    />

                    {/* ─── SECTION 2: CONTACT INFO ─── */}
                    <div className="mt-2">
                        <SectionLabel text="Contact Information" icon={Briefcase} />
                    </div>

                    <FormInput
                        label="Phone Number"
                        placeholder="+254..."
                        value={form.phone_number as string}
                        onChangeText={(text) => handleInputChange('phone_number', text)}
                        keyboardType="phone-pad"
                        isDark={isDark}
                    />
                    <FormInput
                        label="WhatsApp Number"
                        placeholder="+254..."
                        value={form.whatsapp_number as string}
                        onChangeText={(text) => handleInputChange('whatsapp_number', text)}
                        keyboardType="phone-pad"
                        isDark={isDark}
                    />

                    {/* ─── PHYSICAL LOCATION UPDATE BLOCK ─── */}
                    <p className="font-jakarta-semibold text-xs text-sand-600 dark:text-sand-400 mb-2">Physical Location</p>

                    <div className="bg-sand-100 dark:bg-sand-900 rounded-xl p-4 mb-4 flex flex-row items-center justify-between border border-sand-200 dark:border-sand-800">
                        <div style={{ flex: 1, paddingRight: 8 }}>
                            <p className="font-jakarta text-sm text-sand-900 dark:text-sand-100">
                                {form.physical_location || 'No physical location set'}
                            </p>
                        </div>
                        <TouchableOpacity
                            onPress={() => setIsEditingLocation(!isEditingLocation)}
                            className="flex flex-row items-center bg-brand-500 px-3 py-2 rounded-lg"
                            style={{ gap: 4 }}
                        >
                            <Edit2 size={12} color="#FAFAF9" />
                            <p className="font-jakarta-semibold text-xs text-white">
                                {isEditingLocation ? 'Cancel' : 'Modify'}
                            </p>
                        </TouchableOpacity>
                    </div>

                    {/* Pickers when 'Modify' is toggled */}
                    {isEditingLocation && (
                        <div className="flex flex-col mb-4" style={{ gap: 12 }}>
                            {dataInfo.map((item, index) => (
                                <CustomPicker
                                    key={index}
                                    options={item.options}
                                    isOpen={item.isOpen}
                                    onToggle={() => handleToggle(index)}
                                    onSelect={(selectedItem: string) => handleAddressSelect(item.label, selectedItem)}
                                    setDataInfo={setDataInfo}
                                />
                            ))}
                        </div>
                    )}

                    {/* ─── NOTIFICATION SETTINGS ─── */}
                    <div className="mt-2">
                        <SectionLabel text="Notification Settings" icon={Bell} />
                        <div className="flex flex-row items-center justify-between bg-sand-100 dark:bg-sand-900 rounded-xl px-4 py-3 mb-4 border border-sand-200 dark:border-sand-800">
                            <div style={{ gap: 2 }}>
                                <p className="font-jakarta-semibold text-sm text-sand-900 dark:text-sand-100">Push Notifications</p>
                                <p className="font-jakarta text-xs text-sand-600 dark:text-sand-400">Receive order and customer updates</p>
                            </div>
                            <Switch
                                value={notificationsEnabled}
                                onValueChange={handleNotificationToggle}
                                trackColor={{ false: isDark ? '#44403C' : '#D6D3D1', true: '#F59E0B' }}
                                thumbColor="#FAFAF9"
                            />
                        </div>
                    </div>

                    {/* ─── SECTION 3: DELIVERY SETTINGS ─── */}
                    <div className="mt-2">
                        <SectionLabel text="Delivery Settings" icon={Truck} />
                    </div>

                    {/* Delivery Toggle Row */}
                    <div className="flex flex-row items-center justify-between bg-sand-100 dark:bg-sand-900 rounded-xl px-4 py-3 mb-4 border border-sand-200 dark:border-sand-800">
                        <div style={{ gap: 2 }}>
                            <p className="font-jakarta-semibold text-sm text-sand-900 dark:text-sand-100">Delivery Available</p>
                            <p className="font-jakarta text-xs text-sand-600 dark:text-sand-400">Can you dispatch items to buyers?</p>
                        </div>
                        <Switch
                            value={form.delivery_available}
                            onValueChange={(bool) => handleInputChange('delivery_available', bool)}
                            trackColor={{ false: isDark ? '#44403C' : '#D6D3D1', true: '#F59E0B' }}
                            thumbColor="#FAFAF9"
                        />
                    </div>

                    {/* Nested Conditional Delivery Fields */}
                    {form.delivery_available && (
                        <DeliverySettingsSegment
                            onRadiusChange={
                                (radiusValue: string) => handleInputChange('delivery_radius_km', radiusValue)
                            }
                        />
                    )}

                </div>
            </Scrolldiv>

            {/* Floating Action Save Button Wrapper */}
            <div className="sticky bottom-0 left-0 right-0 p-4 bg-sand-50/95 dark:bg-sand-950/95 pb-6 border-t border-sand-200/50 dark:border-sand-800/50 lg:pl-[calc(50%+1rem)]">
                <TouchableOpacity
                    activeOpacity={0.85}
                    className="w-full bg-info-600 rounded-lg flex flex-row items-center justify-center py-4 "
                    style={{ gap: 8 }}
                    onPress={handleSaveSettings}
                >
                    <Save size={18} color="#FAFAF9" />
                    <p className="font-jakarta-bold text-base text-white">
                        Save Changes
                    </p>
                </TouchableOpacity>
            </div>
        </SafeAreadiv>
    );
};

export default StoreScreen;