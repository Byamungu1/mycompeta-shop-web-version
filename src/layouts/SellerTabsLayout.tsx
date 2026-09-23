import { Tabs } from '@/router';
import { CircleGauge, Package, ShoppingBag, Store, Users } from 'lucide-react';
import { SafeAreadiv } from '@/components/layout/SafeArea';

const SellerLayout = () => {

    const TabConfigs: {
        name: string;
        title: string;
        Icon: React.ComponentType<any>;
    }[] = [
        {
            name: 'index',
            title: 'Dashboard',
            Icon: CircleGauge
        },
        {
            name: 'products',
            title: 'Products',
            Icon: Package
        },
        {
            name: 'orders',
            title: 'Orders',
            Icon: ShoppingBag
        },
        {
            name: 'customers',
            title: 'Customers',
            Icon: Users
        },
        {
            name: 'store',
            title: 'Store',
            Icon: Store
        }
    ]

    const TabIcon = ({ focused, icon }: { focused: boolean; icon: React.ReactNode }) => {
        return (
            <div
                className={`relative flex items-center justify-center rounded-xl w-full px-4 py-2 transition-all duration-200 ${
                    focused
                        ? 'bg-brand-500 shadow-lg scale-105'
                        : 'bg-transparent hover:bg-sand-100'
                }`}>
                {icon}
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
                <p className="font-syne-bold text-brand-600 text-sm tracking-tight">Seller Portal</p>
            </div>

            <Tabs
                screenOptions={{
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
                }}
                initialRouteName='index'>

            {TabConfigs.map((tab) => (
                <Tabs.Screen
                    key={tab.name}
                    name={tab.name}
                    options={{
                        title: tab.title,
                        headerShown: false,
                        tabBarIcon: ({ focused }) => (
                            <TabIcon
                                focused={focused}
                                icon={<tab.Icon size={24} className={findTabpStyle(focused)} />}
                            />
                        )
                    }}
                />
            ))}
            </Tabs>
        </SafeAreadiv>
    )
}

export default SellerLayout