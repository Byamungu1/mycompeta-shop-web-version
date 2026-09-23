import { useGlobalCounts } from '@/context/globalCountContext';
import { ProductType } from '@/interfaces/interface';
import { Tabs, useFocusEffect } from '@/router';
import * as SecureStore from '@/utils/storage';
import { Home, Search, ShoppingCart, User } from 'lucide-react';
import { useCallback, useState } from 'react';
import { SafeAreadiv } from '@/components/layout/SafeArea';

interface TabIconProps {
    focused: boolean;
    icon: any;
    stickNumber?: string;
}

type CartItemType = ProductType & { quantity: number }

export default function BuyerTabsLayout() {
    const [cartItems, setCartItems] = useState<CartItemType[]>([])

    const {counts} = useGlobalCounts()

    useFocusEffect(
    useCallback(() => {
        // 2. Create an inner async function to resolve the Promise safely
        const fetchCart = async () => {
            try {
                const key = (import.meta.env.VITE_CART_STORAGE_KEY as string) || 'user_shopping_cart';
                const rawCartItems = await SecureStore.getItemAsync(key);
                
                if (rawCartItems) {
                    setCartItems(JSON.parse(rawCartItems));
                } else {
                    setCartItems([]); // fallback if storage is empty
                }
            } catch (error) {
                console.error("Error loading cart on focus:", error);
            }
        };

        fetchCart();
    }, [])
);

    const TabIcon = ({ focused, icon, stickNumber }: TabIconProps) => {
        return (
            <div
                className={`relative flex items-center justify-center rounded-xl w-full px-4 py-2 transition-all duration-200 ${
                    focused 
                        ? 'bg-brand-500 shadow-lg scale-105' 
                        : 'bg-transparent hover:bg-sand-100'
                }`}>
                {icon}
                {stickNumber && (
                    <div className='absolute -top-1 -right-1 bg-red-500 text-white
                text-xs rounded-full font-jakarta-bold w-5 h-5 flex items-center justify-center'>
                        {parseInt(stickNumber || '0') > 99 ? '99+' : stickNumber}
                    </div>
                )}
            </div>
        )
    }
    const findTabpStyle = (focused: boolean) => focused ? 'text-sand-950' : 'text-sand-500'


    return (
        <SafeAreadiv className="flex-1 bg-sand-50">
            {/* App Logo Header */}
            <div className="flex-row w-full items-center justify-between px-4 sm:px-6 md:px-8 lg:px-12 py-3 bg-white border-b border-sand-200">
                <img
                    src={require('../../assets/images/logo.png')}
                    className="w-10 h-10 object-cover"
                    resizeMode="cover"
                />
                <p className="font-syne-bold text-brand-600 text-sm tracking-tight">MarketPlace</p>
            </div>

            <Tabs
                initialRouteName='index'
                screenOptions={
                    {
                        tabBarShowLabel: true,
                        tabBarActiveTintColor: '#B45309',
                        tabBarInactiveTintColor: '#78716C',
                        headerShown: false,
                        tabBarStyle: {
                            backgroundColor: '#FAFAF9',
                            position: 'absolute',
                            borderTopColor: '#FCD34D',
                            borderTopWidth: 1,
                            minHeight: 70,
                            paddingBottom: 10,
                            width: '100%',
                        },
                        tabBarLabelStyle: {
                            fontSize: 12,
                            fontFamily: 'PlusJakartaSans-Medium'
                        }
                    }
                }

            >
            <Tabs.Screen
                name='index'
                options={{
                    title: 'Home',
                    tabBarIcon: ({ focused }) => (
                        <TabIcon
                            focused={focused}
                            icon={<Home className={findTabpStyle(focused)} />} />)

                }}
            />
            <Tabs.Screen
                name='cart'
                options={{
                    title: 'Cart',
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon
                            focused={focused}
                            icon={<ShoppingCart className={findTabpStyle(focused)} />}
                            stickNumber={counts.cartItems} />)

                }}
            />
            <Tabs.Screen
                name='search'
                options={{
                    title: 'Search',
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon
                            focused={focused}
                            icon={<Search className={findTabpStyle(focused)} />} />)

                }}
            />
            <Tabs.Screen
                name='profile'
                options={{
                    title: 'Profile',
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon
                            focused={focused}
                            icon={<User className={findTabpStyle(focused)} />}

                        />)

                }}
            />
            </Tabs>
        </SafeAreadiv>
    )
}
