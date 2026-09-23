import { CustomerCard } from '@/components/seller/CustomerCard';
import Header from '@/components/layout/Header';
import RefetchData from '@/components/common/RefetchData';
import { InsightCard } from '@/components/seller/insightCard';
import { useFetch } from '@/hooks/useApi';
import { Customer } from '@/interfaces/interface';
import { getCustomers } from '@/services/customer';
import { useFocusEffect } from '@/router';
import { AlertTriangle, Clock, Crown, RefreshCw, ShoppingBag } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, TouchableOpacity } from '@/components/common/ui';
import { SafeAreadiv } from '@/components/layout/SafeArea';

// ─── Types ────────────────────────────────────────────────────────────────────

// ─── Sub-components ───────────────────────────────────────────────────────────

const SectionLabel = ({ text }: { text: string }) => (
    <p className='font-jakarta-bold text-md text-sand-500 tracking-wider mb-3'>
        {text}
    </p>
);

// ─── Screen ───────────────────────────────────────────────────────────────────

const Customers = () => {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    // Destructured 'loading' from hook assuming standard useFetch design pattern
    const { data: customerData, error, refetch, loading: customerLoading } = useFetch<Customer[]>(() => getCustomers());

    const toggle = (id: string) =>
        setExpandedId(prev => prev === id ? null : id);

    const handleRefresh = async () => {
        setIsRefreshing(true)
        await refetch()
        setIsRefreshing(false)
    }

    useFocusEffect(
        useCallback(() => {
            refetch();
        }, [])
    );

    const listData = useMemo(() => {
        if (!customerData || customerData.length === 0) return [];
        return [
            { type: 'insights' as const },
            ...customerData.map(c => ({ type: 'customer' as const, customer: c }))
        ];
    }, [customerData]);

    const topCustomer = useMemo(() => {
        return (customerData && customerData.length > 0 ? [...customerData].sort((a, b) => b.total_spent - a.total_spent)[0] : null);
    }, [customerData]);

    const mostRecent = useMemo(() => {
        return (customerData && customerData.length > 0 ? [...customerData].sort((a, b) => new Date(b.last_order as string).
            getTime() - new Date(a.last_order as string).getTime())[0] : null);
    }, [customerData]);

    const repeatCustomers = useMemo(() => {
        return (customerData ? customerData.filter(c => c.total_orders > 1) : null);
    }, [customerData]); // Added customerData dependency array here to fix infinite loop/stale scope bug

    return (
        <SafeAreadiv className='flex-1 bg-sand-50'>
            <div className='px-4 sm:px-6 lg:px-8 pt-2 flex-1 w-full max-w-4xl mx-auto'>
                <div style={{ gap: 8 }} className="mb-2 flex flex-row items-center justify-between">
                    <Header title="Customers" subtitle={`${customerData?.length || 0} total · ${repeatCustomers?.length || 0} repeat buyers`} />
                    <RefetchData handleRefresh={handleRefresh} isRefreshing={isRefreshing} />
                </div>

                {/* 1. ERROR STATE */}
                {error ? (
                    <div className='flex-1 items-center justify-center px-6 text-center' style={{ gap: 16 }}>
                        <div className='w-16 h-16 bg-red-50 rounded-full items-center justify-center'>
                            <AlertTriangle size={32} color='#EF4444' />
                        </div>
                        <div style={{ gap: 4 }} className="items-center">
                            <p className='font-jakarta-bold text-lg text-sand-900'>Failed to load customers</p>
                            <p className='font-jakarta text-sm text-sand-500 text-center'>
                                {error.message || "An unexpected error occurred. Please try again later."}
                            </p>
                        </div>
                        <TouchableOpacity
                            onPress={handleRefresh}
                            className='bg-brand-500 px-6 py-2.5 rounded-xl active:opacity-80'
                        >
                            <p className='font-jakarta-bold text-sm text-brand-800'>Try Again</p>
                        </TouchableOpacity>
                    </div>
                ) : customerLoading ? (
                    /* 2. LOADING STATE */
                    <div className='flex-1 items-center justify-center'>
                        <ActivityIndicator size="large" color="#F59E0B" />
                    </div>
                ) : !customerData || customerData.length === 0 ? (
                    /* 3. EMPTY STATE (No Customer data & finished loading) */
                    <div className='flex-1 items-center justify-center px-6' style={{ gap: 16 }}>
                        <div className='w-16 h-16 bg-sand-200 rounded-full items-center justify-center'>
                            <ShoppingBag size={28} color='#94A3B8' />
                        </div>
                        <div style={{ gap: 4 }} className="items-center">
                            <p className='font-jakarta-bold text-lg text-sand-900'>No customers yet</p>
                            <p className='font-jakarta text-sm text-sand-500 text-center'>
                                Once transactions begin processing, your customer directory and behaviors will automatically map here.
                            </p>
                        </div>
                    </div>

                ) : (
                    /* 4. SUCCESS STATE (Renders list safely) */
                    <FlatList
                        data={listData}
                        keyExtractor={(item, index) => index.toString()}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ gap: 10, paddingBottom: 120 }}
                        renderItem={({ item }) => {
                            if (item.type === 'insights') {
                                return (
                                    <div style={{ gap: 10 }}>
                                        <SectionLabel text='Customer Insights' />
                                        <div className='grid grid-cols-1 sm:grid-cols-3' style={{ gap: 10 }}>
                                            <InsightCard
                                                icon={<Crown size={16} className='text-brand-700' />}
                                                label='Top Customer'
                                                value={topCustomer?.full_name as string}
                                                sub={`KES ${topCustomer?.total_spent?.toLocaleString()}`}
                                                accent='bg-amber-100'
                                            />
                                            <InsightCard
                                                icon={<Clock size={16} className='text-info-500' />}
                                                label='Most Recent'
                                                value={mostRecent?.full_name as string}
                                                orderData={mostRecent?.last_order}
                                                accent='bg-info-100'
                                                uniqueUi={true}
                                            />
                                            <InsightCard
                                                icon={<RefreshCw size={16} color='#10B981' />}
                                                label='Repeat Buyers'
                                                value={`${repeatCustomers?.length} buyers`}
                                                sub={`${repeatCustomers?.reduce((sum, c) => sum + (c.total_orders || 0), 0)} total orders`}
                                                accent='bg-emerald-100'
                                            />
                                        </div>

                                        <SectionLabel text={`All Customers · ${customerData?.length}`} />
                                    </div>
                                );
                            }

                            return (
                                <CustomerCard
                                    customer={item.customer}
                                    expanded={expandedId === item.customer.id}
                                    onPress={() => toggle(item.customer.id)}
                                    isTop={item.customer.id === topCustomer?.id}
                                />
                            );
                        }}
                    />
                )}
            </div>
        </SafeAreadiv>
    );
};

export default Customers;