import { shippingInfo } from '@/assets/constants/data'
import CustomPicker from '@/components/common/CustomPicker'
import DistanceCalculator from '@/components/checkout/DistanceCalculator'
import Header from '@/components/layout/Header'
import { useToast } from '@/context/toastContext'
import { useFetch } from '@/hooks/useApi'
import useDataInfo from '@/hooks/useDataInfo'
import useKeyboardActive from '@/hooks/useKeyboardActive'
import { BuyerProfileSettings } from '@/interfaces/interface'
import { CartItemType } from '@/interfaces/types/types'
import { getBuyerProfile } from '@/services/auth'
import { getShippingAddress } from '@/utils/formatAdress'
import { loadCheckoutItems } from '@/utils/loadDirectBuyItems'
import updateAddress from '@/utils/updateAddress'
import { router, useFocusEffect, useLocalSearchParams } from '@/router'
import * as SecureStore from '@/utils/storage'
import { AlignLeft, ChevronDown, Edit3, Mail, MapPin, Phone } from 'lucide-react'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Alert, findNodeHandle, Keyboard, TextInput, TouchableOpacity } from '@/components/common/ui'
import { KeyboardAwareScrolldiv } from '@/components/layout/KeyboardAwareScrollView'
import { SafeAreadiv } from '@/components/layout/SafeArea'

const SectionLabel = ({ text }: { text: string }) => (
    <p className='font-jakarta-bold text-md text-sand-500 tracking-widest mb-1'>
        {text}
    </p>
)

interface ContactInputProps {
    placeholder: string;
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
    icon: React.ReactNode;
    value: string;
    onChangeText: (text: string) => void;
    onFocus?: (event: any) => void;
}

const ContactInput = React.forwardRef<TextInput, ContactInputProps>(({
    placeholder,
    keyboardType = 'default',
    icon,
    value,
    onChangeText,
    onFocus
}, ref) => {
    return (
        <div className='flex flex-row items-center bg-sand-100 rounded-xl px-3' style={{ gap: 10 }}>
            <div className='w-8 h-8 items-center justify-center'>
                {icon}
            </div>
            <TextInput
                ref={ref}
                keyboardType={keyboardType}
                placeholder={placeholder}
                placeholderTextColor='#9CA3AF'
                value={value}
                onChangeText={onChangeText}
                onFocus={onFocus}
                className='flex-1 py-4 font-jakarta-medium text-sand-900 text-sm'
            />
        </div>
    )
})

const Checkout = () => {
    const { isKeyboardActive, setIsKeyboardActive } = useKeyboardActive()
    const { dataInfo, setDataInfo, handleToggle: handledataInfoToggle } = useDataInfo(shippingInfo);
    const [isLocationReady, setIsLocationReady] = useState<boolean>(false);
    const [isEditingAddress, setIsEditingAddress] = useState<boolean>(false);
    const { showError } = useToast()

    const [isLoading, setIsLoading] = useState(true)
    const scrollRef = useRef<KeyboardAwareScrolldiv>(null)

    const [formData, setFormData] = useState({
        phone: '',
        email: '',
        fullName: '',
        landmark: '',
        distance: 0,
        deliveryTime: '',
        coordinates: {
            buyer_latitude: 0,
            buyer_longitude: 0,
        },
        address: { kakuma: 'Kakuma 1', zone: 'Zone 1', block: 'Block 1' } as Record<string, string>
    })
    const [cartItems, setCartItems] = useState<CartItemType[]>([])

    const [directBuyItem, setDirectBuyItem] = useState<CartItemType[]>([])

    const { mode } = useLocalSearchParams<{ mode?: string }>()
    const isDirectMode = mode === 'direct'

    const { data: buyerProfile, refetch: refetchBuyerProfile } =
        useFetch<BuyerProfileSettings>(() => getBuyerProfile())

    useFocusEffect(
        useCallback(() => {
            refetchBuyerProfile()
        }, [refetchBuyerProfile])
    )

    // Load saved store details
    useFocusEffect(
        useCallback(() => {
            let isMounted = true;
            async function loadSavedData() {
                try {
                    const existingShippingData = await SecureStore.getItemAsync('shippingInfo')
                    const existingCartItems = await SecureStore.getItemAsync(
                        (import.meta.env.VITE_CART_STORAGE_KEY as string) || 'user_shopping_cart'
                    )

                    if (isMounted) {
                        if (existingShippingData) {
                            const parsedData = JSON.parse(existingShippingData)
                            setFormData(parsedData)

                            // If address choices are already saved, default view mode to display summary
                            if (parsedData.address && Object.keys(parsedData.address).length > 0) {
                                setIsEditingAddress(false)
                            } else {
                                setIsEditingAddress(true)
                            }
                        } else {
                            setIsEditingAddress(true)
                        }

                        if (existingCartItems) {
                            setCartItems(JSON.parse(existingCartItems))
                        }
                    }
                } catch (error) {
                    console.error("Error reading from secure store:", error);
                } finally {
                    if (isMounted) setIsLoading(false)
                }
            }

            loadCheckoutItems(setDirectBuyItem)
            loadSavedData();
            return () => { isMounted = false; };
        }, [])
    )

    // Merge profile defaults into empty form fields once profile loads
    useEffect(() => {
        if (buyerProfile) {
            setFormData(prev => ({
                ...prev,
                phone: prev.phone || buyerProfile.primary_checkout_phone || '',
                fullName: prev.fullName || buyerProfile.primary_checkout_name || '',
            }))
        }
    }, [buyerProfile])

    const handleInputChange = useCallback((field: 'phone' | 'email' | 'fullName' | 'landmark', value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }, [])

    const handleAddressSelect = useCallback((pickerLabel: string, selectedValue: string) => {
        setFormData(prev => ({
            ...prev,
            address: {
                ...prev.address,
                [pickerLabel]: selectedValue
            }
        }))
    }, [])

    const handleCoordinates = useCallback((coordinates: { longitude: number; latitude: number }, distance: number) => {
        setFormData(prev => ({
            ...prev,
            distance: distance,
            coordinates: {
                buyer_longitude: coordinates.longitude,
                buyer_latitude: coordinates.latitude
            }
        }));
    }, []);

    const handleInputFocus = useCallback((event: any) => {
        const node = findNodeHandle(event.target)
        if (node && scrollRef.current) {
            scrollRef.current.scrollToFocusedInput(node, 120)
        }
    }, [])


    const isFormValid = useCallback(() => {
        const { phone, email, fullName, address } = formData;

        if (!phone.trim() || !email.trim() || !fullName.trim()) {
            return false;
        }

        const allPickersSelected = dataInfo.every((item, index) => {
            const key = item.label || `step_${index}`;
            return address[key] && address[key].trim() !== '';
        });

        return allPickersSelected;
    }, [formData, dataInfo])

    const handleContinue = async () => {
        if (!isFormValid()) {
            showError("Missing Information")
            Alert.alert(
                "Missing Information",
                "Please fill in your contact details and select all shipping address options before continuing.",
                [{ text: "OK" }]
            );
            return;
        }

        await SecureStore.setItemAsync('shippingInfo', JSON.stringify(formData))
        router.push('/payment')
    }

    const valid = isFormValid();
    const formattedAddress = getShippingAddress(formData);
    const hasAddress = Object.keys(formData.address).length > 0 && formattedAddress !== "No address selected yet";

    if (isLoading) {
        return (
            <SafeAreadiv className='bg-sand-100 flex-1 justify-center items-center'>
                <ActivityIndicator size="large" color="#6B7280" />
            </SafeAreadiv>
        );
    }


    if (cartItems.length === 0 && !isDirectMode) {
        return (
            <SafeAreadiv className='bg-sand-100 flex-1 justify-center items-center px-4'>
                <Header title="Checkout" subtitle='Configure delivery settings' />
                <div className="flex-1 justify-center items-center">
                    <p className="font-jakarta-bold text-lg text-sand-900 mb-2">Your cart is empty</p>
                    <p className="font-jakarta-medium text-sm text-sand-500 text-center mb-6">
                        Add items to your cart to continue with the checkout configuration.
                    </p>
                    <TouchableOpacity
                        onPress={() => router.push('/')}
                        className="bg-info-600 px-6 py-3 rounded-xl"
                    >
                        <p className="text-white font-jakarta-bold">Go Shopping</p>
                    </TouchableOpacity>
                </div>
            </SafeAreadiv>
        );
    }

    const hasDirectBuyItem = directBuyItem?.length > 0

    return (
        <SafeAreadiv className='bg-sand-100 flex-1'>
            <div className='mt-4 px-4 md:px-6 lg:px-8'>
                <Header title="Checkout" subtitle='Configure delivery settings' />
            </div>
            <KeyboardAwareScrolldiv
                ref={scrollRef}
                className='flex-1 px-4 md:px-6 lg:px-8 lg:grid lg:grid-cols-2 lg:gap-6'
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ gap: 20, paddingBottom: 60 }}
                enableOnAndroid={true}
                enableAutomaticScroll={true}
                extraHeight={120}
                extraScrollHeight={140}
                keyboardShouldPersistTaps='handled'
            >


                <DistanceCalculator
                    role='buyer'
                    profile={hasDirectBuyItem ? directBuyItem?.[0]?.seller : cartItems?.[0]?.seller}
                    onLocationReadyChanged={(ready: boolean) => setIsLocationReady(ready)}
                    getCurrentLocationName={(locationName: string) =>  updateAddress(locationName, setFormData)}
                    onLocationCaptured={(coordinates, distance) => handleCoordinates(coordinates, distance)}
                    onDeliveryTimeCapture={(deliveryTime: string) => setFormData(prev => ({
                        ...prev,
                        deliveryTime: deliveryTime
                    }
                    
                    ))}
                />

                <div className='bg-white border border-sand-200 rounded-lg p-4 flex-1' style={{ gap: 12 }}>
                    <div className='flex flex-row items-center justify-between'>
                        <SectionLabel text="Shipping Address" />
                        {hasAddress && (
                            <TouchableOpacity
                                onPress={() => setIsEditingAddress(prev => !prev)}
                                className='flex flex-row items-center py-1 px-2.5 bg-sand-100 rounded-md'
                                style={{ gap: 4 }}
                            >
                                <Edit3 size={14} color='#4B5563' />
                                <p className='font-jakarta-bold text-xs text-sand-700'>
                                    {isEditingAddress ? 'Done' : 'Edit'}
                                </p>
                            </TouchableOpacity>
                        )}
                    </div>

                    {isKeyboardActive && (
                        <TouchableOpacity
                            onPress={() => {
                                Keyboard.dismiss();
                                setIsKeyboardActive(false);
                            }}
                            className='flex flex-row items-center mb-2'
                            style={{ gap: 6 }}
                        >
                            <ChevronDown size={18} className='text-sand-500' />
                            <p className='font-jakarta-medium text-sm text-sand-500'>
                                Hide Keyboard
                            </p>
                        </TouchableOpacity>
                    )}

                    {!isEditingAddress ? (
                        <div className='bg-sand-100 p-3.5 rounded-lg flex flex-row items-start' style={{ gap: 10 }}>
                            <MapPin size={18} color='#4B5563' style={{ marginTop: 2 }} />
                            <p className='flex-1 font-jakarta-medium text-sm text-sand-900 leading-5'>
                                {formattedAddress ? formattedAddress : 'No address provided'}
                            </p>
                        </div>
                    ) : !isKeyboardActive ? (
                        dataInfo.map((item, index) => (
                            <CustomPicker
                                key={index}
                                options={item.options}
                                isOpen={item.isOpen}
                                onToggle={() => handledataInfoToggle(index)}
                                onSelect={(selected: string) => handleAddressSelect(item.label || `step_${index}`, selected)}
                                setDataInfo={setDataInfo}
                            />
                        ))
                    ) : null}

                    <ContactInput
                        placeholder='Nearest landmark (e.g., Lokitaung Primary)'
                        keyboardType='default'
                        icon={<MapPin size={16} color='#6B7280' />}
                        value={formData.landmark}
                        onChangeText={(text) => handleInputChange('landmark', text)}
                        onFocus={handleInputFocus}
                    />
                </div>

                <div className='bg-white border border-sand-200 rounded-lg p-4' style={{ gap: 12 }}>
                    <SectionLabel text="Contact Information" />
                    <ContactInput
                        placeholder='Phone Number'
                        keyboardType='phone-pad'
                        icon={<Phone size={16} color='#6B7280' />}
                        value={formData.phone}
                        onChangeText={(text) => handleInputChange('phone', text)}
                        onFocus={handleInputFocus}
                    />
                    <div className='h-px bg-brand-300' />
                    <ContactInput
                        placeholder='Email Address'
                        keyboardType='email-address'
                        icon={<Mail size={16} color='#6B7280' />}
                        value={formData.email}
                        onChangeText={(text) => handleInputChange('email', text)}
                        onFocus={handleInputFocus}
                    />
                    <div className='h-px bg-brand-300' />
                    <ContactInput
                        placeholder='Full Name'
                        keyboardType='default'
                        icon={<AlignLeft size={16} color='#6B7280' />}
                        value={formData.fullName}
                        onChangeText={(text) => handleInputChange('fullName', text)}
                        onFocus={handleInputFocus}
                    />
                </div>

                <TouchableOpacity
                    onPress={handleContinue}
                    disabled={!valid || !isLocationReady}
                    activeOpacity={valid ? 0.85 : 1}
                    className={`w-full rounded-md py-3.5 items-center mb-4 ${valid && isLocationReady ? 'bg-brand-500 active:bg-brand-600' : 'bg-sand-200'
                        }`}
                >
                    <p className={`text-base font-jakarta-bold ${valid && isLocationReady ? 'text-sand-950' : 'text-sand-400'}`}>
                        Continue to Payment
                    </p>
                </TouchableOpacity>
            </KeyboardAwareScrolldiv>
        </SafeAreadiv>
    )
}

export default Checkout;