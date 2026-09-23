import Header from '@/components/layout/Header'
import CartItem from '@/components/cart/CartItem'
import { CartItemType } from '@/interfaces/types/types'
import { findTotalCharge } from '@/utils/findTotalCharge'
import { router, useFocusEffect, useRouter } from '@/router'
import * as SecureStorage from '@/utils/storage'
import { useCallback, useState } from 'react'
import { FlatList, TouchableOpacity } from '@/components/common/ui'
import { SafeAreadiv } from '@/components/layout/SafeArea'

export const CART_STORAGE_KEY = (import.meta.env.VITE_CART_STORAGE_KEY as string) || 'user_shopping_cart'

const EmptyCart = () => (
    <div className="flex-1 items-center justify-center p-6 min-h-[300px]">
        {/* Optional: Add an icon here later if needed */}
        <p className="text-lg font-jakarta-bold text-gray-900 text-center mb-1">
            Your cart is empty
        </p>
        <p className="text-sm font-jakarta-medium text-gray-500 text-center mb-6 max-w-[240px]">
            Add products to your cart to start shopping.
        </p>

        <TouchableOpacity
            className="bg-brand-500 active:bg-brand-600 px-6 py-3.5 rounded-md w-full max-w-xs items-center justify-center"
            onPress={() => router.push('/')}
        >
            <p className="text-sand-950 font-jakarta-bold text-base">
                Browse Products
            </p>
        </TouchableOpacity>
    </div>
)

function Cart() {
    const router = useRouter()


    // 1. Set up state for your cart items
    const [cartItems, setCartItems] = useState<CartItemType[]>([])

    // 2. Fetch the cart contents safely via useEffect when the screen mounts
    useFocusEffect(
        useCallback(() => {
            const loadCart = async () => {
                try {
                    const rawData = await SecureStorage.getItemAsync(CART_STORAGE_KEY)
                    if (rawData) {
                        setCartItems(JSON.parse(rawData))
                    }
                } catch (error) {
                    console.error("Failed to load secure store cart:", error)
                }
            }

            loadCart()
        }, []))

    const { totalItems, finalTotal, subtotal, totalDiscount, deliveryFee } = findTotalCharge(cartItems)


    return (
        <SafeAreadiv className='bg-sand-50 flex-1'>
            <div className="px-4 md:px-6 lg:px-8 flex-1 lg:grid lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.7fr)] lg:gap-6">

                {/* Header */}
                <div className="lg:col-span-2"><Header title="Cart" subtitle='Cart items' /></div>

                {/* Cart Items List */}
                <FlatList
                    data={cartItems}
                    renderItem={({ item }) => (
                        <CartItem key={item.id} item={item} setCartItems={setCartItems} />
                    )}
                    keyExtractor={(item) => item.id?.toString()}
                    ListEmptyComponent={
                        <EmptyCart />
                    }
                    contentContainerStyle={{
                        gap: 10,
                        paddingBottom: 20,
                        marginTop: 20
                    }}
                    showsVerticalScrollIndicator={false}
                    style={{ flex: 1 }}
                />

                {/* Order Summary Summary Details */}
                <div className='bg-white border border-sand-200 px-4 rounded-lg mt-1 py-5 mb-20 lg:mb-0 lg:mt-5 lg:self-start shadow-sm'>
                    <p className='font-jakarta-bold text-lg text-sand-900 mb-4'>
                        Order Summary
                    </p>
                    <div className="flex-row items-center justify-between">
                        <div className='flex-col gap-3'>
                            <p className='font-jakarta-regular text-sand-600 '>Items</p>
                            <p className='font-jakarta-regular text-sand-600'>Subtotal</p>
                            <p className='font-jakarta-regular text-sand-600'>Discount</p>
                            <p className='font-jakarta-regular text-sand-600'>Delivery</p>
                        </div>
                        <div className="flex-col gap-3 items-end">
                            <p className='font-dm-mono-medium text-sand-900'>{totalItems}</p>
                            <p className='font-dm-mono-medium text-sand-900'>KES {subtotal}</p>
                            <p className='font-dm-mono-medium text-market-600'>- KES {totalDiscount}</p>
                            <p className='font-dm-mono-medium text-sand-900'>
                                {deliveryFee === 0 ? 'Free' : `KES ${deliveryFee}`}
                            </p>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className='h-px bg-sand-200 mt-2 mb-2' />

                    {/* Total */}
                    <div className='flex-row items-center justify-between'>
                        <p className='font-jakarta-bold text-sand-900 text-base'>Total</p>
                        <p className='font-dm-mono-medium text-brand-500 text-lg'>KES {finalTotal}</p>
                    </div>

                    {/* Checkout Button */}
                    <TouchableOpacity
                        onPress={() => router.push('/checkout')}
                        disabled={cartItems.length === 0}
                        className={`mt-3 rounded-md py-3.5 items-center ${cartItems.length === 0 ? 'bg-sand-200' : 'bg-brand-500 active:bg-brand-600'}`}
                    >
                        <p className={`font-jakarta-bold text-base ${cartItems.length === 0 ? 'text-sand-400' : 'text-sand-950'}`}>
                            Proceed to Checkout
                        </p>
                    </TouchableOpacity>
                </div>

            </div>
        </SafeAreadiv>
    )
}

export default Cart;