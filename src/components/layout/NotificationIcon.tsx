import { useGlobalCounts } from "@/context/globalCountContext";
import { router, useFocusEffect } from "@/router";
import { Bell, ShoppingCart } from "lucide-react";
import { useCallback } from "react";
import { TouchableOpacity } from "@/components/common/ui";


export const NotificationIcon = ({onPress}: {onPress: () => void}) => {
    const {counts, refetchNotifications} = useGlobalCounts()

    useFocusEffect(
        useCallback(async ()=>{
            await refetchNotifications('all')
        }, [])
    )
    return (
        <TouchableOpacity
            onPress={onPress}
            className='w-10 h-10 bg-sand-100 relative rounded-full items-center justify-center' >
            <Bell size={18} color='#1E293B' />
            {counts.unreadNotifications > 0 &&
            <div className='absolute -top-1 -right-1 w-5 h-5 bg-info-600 rounded-full items-center justify-center'>
                <p className='text-white text-xs font-jakarta-bold'>
                    {counts.unreadNotifications > 0 && counts.unreadNotifications}
                    </p>
            </div>
            }
        </TouchableOpacity >
    )
}

export const CartIcon = () => {

    const {counts, refetchCart} = useGlobalCounts()

    useFocusEffect(
        useCallback(async ()=>{
            await refetchCart()
        }, [])
    )
    return (
        <TouchableOpacity
            onPress={()=> router.push('buyer/cart')}
            className='w-10 h-10 bg-sand-100 relative rounded-full items-center justify-center' >
            <ShoppingCart size={18} color='#1E293B' />
            {counts?.cartItems > 0 &&
            <div className='absolute -top-1 -right-1 w-5 h-5 bg-info-600 rounded-full items-center justify-center'>
                <p className='text-white text-xs font-jakarta-bold'>
                    {counts?.cartItems > 0 && counts.cartItems}
                    </p>
            </div>
            }
        </TouchableOpacity >
    )
}

