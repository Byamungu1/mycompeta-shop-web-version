import { FILTER_TABS } from '@/assets/constants/data';
import Filters, { FilterTab } from '@/components/product/ProductFilters';
import Header from '@/components/layout/Header';
import RefetchData from '@/components/common/RefetchData';
import OrderCard from '@/components/seller/order';
import { useFetch } from '@/hooks/useApi';
import { OrderSummary } from '@/interfaces/interface';
import { getOrders } from '@/services/orders';
import { useFocusEffect } from '@/router';
import { Package } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList } from '@/components/common/ui';
import { SafeAreadiv } from '@/components/layout/SafeArea';
import { OrderCardSkeleton } from '@/pages/Orders';

// ─── Components ───────────────────────────────────────────────────────────────



const EmptyState = ({ tab }: { tab: string }) => (
    <div className='items-center justify-center mt-24' style={{ gap: 10 }}>
        <div className='w-14 h-14 bg-sand-100 rounded-full items-center justify-center'>
            <Package size={24} color='#94A3B8' />
        </div>
        <p className='font-jakarta-bold text-sm text-sand-700'>No orders</p>
        <p className='font-jakarta text-xs text-sand-400 text-center px-10'>
            {tab === 'All' ? 'No orders have come in yet.' : `No ${tab.toLowerCase()} orders right now.`}
        </p>
    </div>
);

// ─── Screen ───────────────────────────────────────────────────────────────────

const SellerOrders = () => {
    const [activeTab, setActiveTab] = useState<FilterTab>('all');
    const [isRefreshing, setIsRefreshing] = useState(false);

    const { data: orderData, loading: orderLoading, error, refetch } = useFetch<OrderSummary>(() => getOrders('seller', activeTab));

    const activeCount = orderData?.results.filter(o =>
        ['pending', 'confirmed', 'preparing', 'out_for_delivery'].includes(o.status)
    ).length;

    const handleRefresh = async () => {
        setIsRefreshing(true)
        await refetch(null)
        setIsRefreshing(false)
    }

    useFocusEffect((
        useCallback(() => {
            refetch(null)
        }, [refetch])
    ))

    useEffect(() => {
        refetch(null);
    }, [activeTab]);

    console.log('the order active status', activeTab)

    // Show loading indicator only during initial load when no data exists yet
    const showInitialLoading = orderLoading && !orderData;

    return (
        <SafeAreadiv className='flex-1 bg-sand-50'>
            <div className='px-4 sm:px-6 lg:px-8 pt-2 w-full max-w-3xl mx-auto'>
                <div style={{ gap: 8 }} className="flex flex-row items-center justify-between">
                    <Header title='Orders' subtitle={`${orderData?.results.length ? orderData.results.length : 0} total · ${activeCount ? activeCount : 0} active`} />
                    <RefetchData handleRefresh={handleRefresh} isRefreshing={isRefreshing} />
                </div>

                {showInitialLoading ? (
                    <div className='flex-1 items-center justify-center pt-20'>
                        <ActivityIndicator size="large" color="#F59E0B" />
                    </div>
                ) : (
                    <FlatList
                        data={orderData?.results || []}
                        keyExtractor={(item, index) => item?.id?.toString() || `order-${index}`}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ gap: 12, paddingBottom: 120 }}
                        renderItem={({ item, index }) => <OrderCard key={index} refetch={refetch} order={item} />}
                        ListEmptyComponent={<EmptyState tab={activeTab as string} />}
                        ListHeaderComponent={
                            <div className='pt-4 pb-2' style={{ gap: 14 }}>

                                {/* Filter tabs */}
                                <Filters filters={FILTER_TABS} items={orderData?.results}
                                    onCategoryChange={(selected: string) => setActiveTab(selected)} />
                            </div>
                        }
                    />
                )}
            </div>
        </SafeAreadiv>
    );
};

export default SellerOrders;