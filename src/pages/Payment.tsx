import Header from '@/components/layout/Header';
import { useToast } from '@/context/toastContext';
import { usePost } from '@/hooks/useApi';
import { CheckoutFormData } from '@/interfaces/interface';
import { CartItemType } from '@/interfaces/types/types';
import { createOrder } from '@/services/orders';
import { findTotalCharge } from '@/utils/findTotalCharge';
import { getShippingAddress } from '@/utils/formatAdress';
import { loadCheckoutItems } from '@/utils/loadDirectBuyItems';
import { router, useFocusEffect } from '@/router';
import * as SecureStore from '@/utils/storage';
import { Banknote, MapPin, Phone, User } from 'lucide-react';
import { useCallback, useState } from 'react';
import { ActivityIndicator, BackHandler, Scrolldiv, TouchableOpacity } from '@/components/common/ui';
import { SafeAreadiv } from '@/components/layout/SafeArea';

const ShippingDetails = ({ icon, title, value }: {
    icon: React.ReactNode;
    title: string;
    value: string
}) => {
    return (
        <div className='flex flex-row items-center py-2' style={{ gap: 10 }}>
            <div className='w-8 h-8 bg-brand-300 rounded-full items-center justify-center'>
                {icon}
            </div>
            <div className='flex-1'>
                <p className='font-jakarta text-xs text-sand-500'>{title}</p>
                <p className='font-jakarta-semibold text-sm text-sand-900'>{value}</p>
            </div>
        </div>
    )
}

const ProductInformation = ({ showimg, img, name, price, quantity, variant }:
    {
        showimg: boolean, img: string, name: string,
        price: number, quantity: number, variant: { size: string, color: string, variantId: string }
    }) => {
    return (
        <div className='flex flex-row items-center justify-between py-3 border-b border-brand-300'>
            {showimg &&
                <img
                    className='w-16 h-16 rounded-lg'
                    resizeMode='cover'
                    src={img} />
            }
            <div className='flex-1 flex-col ml-3' style={{ gap: 4 }}>
                <p numberOfLines={1} className='font-jakarta-bold text-sm text-sand-900'>
                    {name}
                </p>
                 {variant && 'size' in variant && variant.size !== undefined && (
                    <p className='text-xs font-jakarta text-sand-500' numberOfLines={2}>Size: {variant.size}</p>
                )}
                {variant?.color && (
                    <p className='text-xs font-jakarta text-sand-500' numberOfLines={2}>Color: {variant.color}</p>
                )}
            </div>
            <p className='text-sm font-jakarta-bold text-brand-700'>KES {price}</p>
        </div>
    )
}

interface PaymentMethodsProps {
    selectedMethod: string;
    onChange: (selectedPaymentMethod: string) => void;
}


const PaymentMethods = ({ selectedMethod, onChange }: PaymentMethodsProps) => {
    return (
        <TouchableOpacity
            onPress={() => onChange('cod')}
            activeOpacity={0.7}
            className={`flex flex-row items-center justify-between w-full p-3 rounded-xl border-2 ${selectedMethod === 'cod'
                ? 'border-brand-400 bg-brand-100'
                : 'border-sand-200 bg-white'
                }`}
        >
            <div className='flex flex-row items-center' style={{ gap: 10 }}>
                <div className='w-9 h-9 bg-brand-300 rounded-full items-center justify-center'>
                    <Banknote size={20} className='text-brand-600' />
                </div>
                <div>
                    <p className='font-jakarta-bold text-sm text-sand-900'>Payment on Delivery</p>
                    <p className='font-jakarta text-xs text-sand-500'>Pay when you receive</p>
                </div>
            </div>

            <div className={`w-5 h-5 rounded-full border-2 items-center justify-center ${selectedMethod === 'cod' ? 'border-brand-600' : 'border-sand-300'
                }`}>
                {selectedMethod === 'cod' && (
                    <div className='w-2.5 h-2.5 rounded-full bg-brand-600' />
                )}
            </div>
        </TouchableOpacity>
    );
};

const SectionCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`w-full bg-white border border-sand-200 rounded-lg p-4 ${className}`}>
        {children}
    </div>
)

const SectionLabel = ({ text }: { text: string }) => (
    <p className='font-jakarta-bold text-md text-sand-500 tracking-widest mb-3'>
        {text}
    </p>
)

const Payment = () => {
    const [shippingInfo, setShippingInfo] = useState<CheckoutFormData>({
        phone: '',
        email: '',
        fullName: '',
        distance: 0,
        deliveryTime: '',
        paymentMethod: 'cod',
        coordinates: { buyer_latitude: 0, buyer_longitude: 0 },
        landmark: '',
        address: {}
    });

    const updatePaymentMethod = (selectedPaymentMethod: string) => {
        setShippingInfo(prev => ({
            ...prev,
            paymentMethod: selectedPaymentMethod
        }))
        console.log('the selected payment', selectedPaymentMethod)
    }

    const { showError, showSuccess } = useToast()
    const [items, setItems] = useState<CartItemType[]>([])
    const { data: orderData, loading: orderLoading, execute: excuteCreateOrdeer } = usePost(() => createOrder(shippingInfo, items))

    const clearDirectBuyStore = async () => {
        try {
            const key = (import.meta.env.VITE_DIRECT_BUY_STORAGE_KEY as string) || 'directBuyProduct';
            if (key) {
                await SecureStore.deleteItemAsync(key);
            }
        } catch (error) {
            console.error('Failed to clear direct buy storage:', error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            const loadStoredShipping = async () => {
                try {
                    const storedData = await SecureStore.getItemAsync('shippingInfo');

                    if (storedData) {
                        const parsedData = JSON.parse(storedData);
                        setShippingInfo(prev => ({
                            phone: parsedData.phone || '',
                            email: parsedData.email || '',
                            fullName: parsedData.fullName || '',
                            landmark: parsedData.landmark || '',
                            deliveryTime: parsedData.deliveryTime || '',
                            distance: parsedData.distance || '',
                            coordinates: parsedData.coordinates || {},
                            address: parsedData.address || {},
                            paymentMethod: parsedData.paymentMethod || prev.paymentMethod || 'cod'
                        }));
                    }
                } catch (error) {
                    console.error('Failed to parse secure store info:', error);
                }
            };

            loadStoredShipping();
            loadCheckoutItems(setItems);

            // Hardware Back Button listener (Android)
            const onBackPress = () => {
                clearDirectBuyStore();
                return false; // Allow standard back navigation
            };

            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

            // Cleanup function fires whenever leaving screen or navigating back
            return () => {
                subscription.remove();
                clearDirectBuyStore();
            };
        }, [])
    );

    const handleConfirmOrder = async () => {
        const result = await excuteCreateOrdeer(shippingInfo)
        if (!result.success) {
            console.log(result.error)
            showError('Unexpected error occured while creating an order')
            return
        }

        const isItemsOfDirectBuy = items.find((item) => item.directBuy === true)

        if (!isItemsOfDirectBuy) {
            await SecureStore.deleteItemAsync((import.meta.env.VITE_CART_STORAGE_KEY as string) || 'user_shopping_cart');
        }

        await clearDirectBuyStore();
        router.push('/')
        showSuccess(`Order ${result.data.unique_identifier} has been created, you'll receive a confirmation message shortly`)
    }

    const { finalTotal } = findTotalCharge(items)

    return (
        <SafeAreadiv className='bg-sand-100 flex-1'>
            <div className='flex-1 mt-4 px-4 sm:px-6 lg:px-8 pb-24 w-full max-w-3xl mx-auto' style={{ gap: 12 }}>
                <Header title="Payment" subtitle='Review and confirm your order' />

                {/* Shipping Details */}
                <SectionCard>
                    <SectionLabel text="Shipping Details" />
                    <ShippingDetails icon={<MapPin size={14} className='text-brand-600' />} title="Location" value={getShippingAddress(shippingInfo)} />
                    <ShippingDetails icon={<Phone size={14} className='text-brand-600' />} title="Phone" value={shippingInfo.phone} />
                    <ShippingDetails icon={<User size={14} className='text-brand-600' />} title="Name" value={shippingInfo.fullName} />
                </SectionCard>

                {/* Order Summary */}
                <div className='flex-1 bg-white border border-sand-200 rounded-lg p-4'>
                    <div className='flex flex-row items-center justify-between mb-1'>
                        <SectionLabel text="Order Summary" />
                    </div>
                    <Scrolldiv showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 8 }}>
                        {items.length > 0 && items.map((item, idx) => (
                            <ProductInformation
                                key={idx}
                                showimg={true}
                                img={item.images?.[0]?.image}
                                name={item.name}
                                quantity={item.quantity}
                                price={item.price}
                                variant={item.variant}
                            />
                        ))}
                    </Scrolldiv>
                    <div className='flex flex-row items-center justify-between pt-3 border-t border-brand-300 mt-1'>
                        <p className='font-jakarta-bold text-sm text-sand-700'>Total</p>
                        <p className='font-jakarta-bold text-base text-sand-900'>KES {finalTotal}</p>
                    </div>
                </div>

                {/* Payment Method */}
                <SectionCard>
                    <SectionLabel text="Payment Method" />
                    <PaymentMethods
                        selectedMethod={shippingInfo.paymentMethod || 'cod'}
                        onChange={(selectedString: string) => updatePaymentMethod(selectedString)}
                    />
                </SectionCard>

                {/* Confirm Button */}
                <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={handleConfirmOrder}
                    disabled={orderLoading}
                    className='w-full bg-info-600 rounded-lg p-4 mb-4 items-center'>
                    {
                        orderLoading ? <ActivityIndicator />
                            : (<p className='font-jakarta-bold text-base text-white'>Confirm Order</p>)
                    }
                </TouchableOpacity>
            </div>
        </SafeAreadiv>
    )
}

export default Payment;