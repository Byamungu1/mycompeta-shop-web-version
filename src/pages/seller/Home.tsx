import { DashboardStats } from '@/interfaces/interface';
import { router, useFocusEffect } from '@/router';
import {
    BadgeCent,
    Bell,
    ChartColumnDecreasing,
    ClipboardList,
    LogOut,
    Package,
    Plus,
    Settings,
    Store,
    Users
} from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { Scrolldiv, TouchableOpacity } from '@/components/common/ui';
import { SafeAreadiv } from '@/components/layout/SafeArea';

import LogoutDecisionModal from '@/components/common/LogoutDecisionModal';
import RefetchData from '@/components/common/RefetchData';
import StatisticCard from '@/components/seller/statisticCard';
import { StatisticCardSkeleton } from '@/components/seller/statisticalSkeletonCard'; // Adjust import path if needed
import { useGlobalContext } from '@/context/globalContext';
import { useGlobalCounts } from '@/context/globalCountContext';
import { useToast } from '@/context/toastContext';
import { useFetch } from '@/hooks/useApi';
import { fetchDashboardData } from '@/services/stats';
import * as SecureStore from '@/utils/storage';

// ─── MICRO COMPONENTS ────────────────────────────────────────────────────────

const SectionHeader = ({ title, Icon }: { title: string; Icon: React.ComponentType<any> }) => (
    <div className='flex flex-row items-center py-2 mb-3' style={{ gap: 8 }}>
        <Icon size={18} color='#475569' className="sm:hidden" />
        <Icon size={20} color='#475569' className="hidden sm:block" />
        <p className='font-jakarta-bold text-base sm:text-lg text-sand-900 truncate'>{title}</p>
    </div>
);

const SectionHeaderSkeleton = () => (
    <div className='flex flex-row items-center py-2 mb-3' style={{ gap: 8 }}>
        <div className='h-5 w-5 bg-sand-300/70 rounded-full' />
        <div className='h-5 w-32 bg-sand-300/70 rounded-md' />
    </div>
);

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────

const DashboardScreen = () => {
    const { data: stats, error: statsError, loading: statsLoading, refetch } = useFetch<DashboardStats>(() => fetchDashboardData());
    const { showError } = useToast();
    const { user, refreshUserProfile, logout } = useGlobalContext();
    const { counts, refetchNotifications } = useGlobalCounts()
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await refetch(null);
        await refetchNotifications('seller');
        await refreshUserProfile();
        setIsRefreshing(false);
    };

    const handleLogout = async () => {
        setShowLogoutModal(true);
    };

    const confirmLogout = async () => {
        await SecureStore.deleteItemAsync('login_role');
        await logout();
        setShowLogoutModal(false);
    };

    const cancelLogout = () => {
        setShowLogoutModal(false);
    };

    // Initial data fetch
    useEffect(() => {
        refetch(null);
    }, [refetch]);

    // Pull-to-refresh & Screen Focus lifecycle data updates
    useFocusEffect(
        useCallback(() => {
            refetch(null);
            refetchNotifications('seller')
            refreshUserProfile();
        }, [refetch, refreshUserProfile])
    );

    // Render global error states gracefully
    if (statsError) {
        showError('Failed to fetch dashboard updates');
    }
    console.log('low stock products', stats?.low_stock_products)

    return (
        <SafeAreadiv className='flex-1 bg-sand-50'>
            <div className='flex-1 mt-3 px-3 sm:px-4 md:px-6 lg:px-8'>

                {/* ─── HEADER SECTION ─── */}
                <div className='flex flex-row items-center justify-between mb-4 pb-4 border-b border-sand-200'>
                    <div style={{ gap: 4 }} className="flex-1 overflow-hidden">
                        <p className='font-syne-bold text-sm sm:text-2xl text-sand-900 truncate'>
                            {user?.username || 'Seller Account'}
                        </p>
                        <p className='font-syne-semibold text-xs sm:text-sm text-sand-500'>
                            Today's Summary
                        </p>
                    </div>

                    {/* Header Action Buttons Container */}
                    <div className='flex flex-row items-center' style={{ gap: 8 }}>
                        <RefetchData handleRefresh={handleRefresh} isRefreshing={isRefreshing} />
                        <TouchableOpacity
                            onPress={() => router.push('/seller/notification')}
                            className='bg-sand-100 rounded-full w-8 h-8 sm:w-9 sm:h-9 justify-center items-center active:opacity-70 relative flex-shrink-0'>
                            <Bell size={16} color='#475569' className="sm:hidden" />
                            <Bell size={18} color='#475569' className="hidden sm:block" />
                            {counts.unreadNotifications > 0 &&
                            <div className='absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-info-600 rounded-full items-center justify-center'>
                                <p className='text-white text-[10px] sm:text-xs font-jakarta-bold'>
                                    {counts?.unreadNotifications > 0 && counts.unreadNotifications}
                                </p>
                            </div>
                            }

                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleLogout}
                            className='bg-red-50 rounded-full w-8 h-8 sm:w-9 sm:h-9 justify-center items-center active:opacity-70 flex-shrink-0'
                        >
                            <LogOut size={16} color='#ef4444' className="sm:hidden" />
                            <LogOut size={18} color='#ef4444' className="hidden sm:block" />
                        </TouchableOpacity>
                    </div>
                </div>

                {/* ─── MAIN SCROLLABLE CONTENT ─── */}
                {statsLoading ? (
                    <Scrolldiv
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ gap: 20, paddingBottom: 120 }}
                        className="flex-1"
                    >
                        {/* 1. STATISTICS SKELETON */}
                        <div>
                            <SectionHeaderSkeleton />
                            <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                <div>
                                    <StatisticCardSkeleton />
                                </div>
                                <div>
                                    <StatisticCardSkeleton />
                                </div>
                                <div>
                                    <StatisticCardSkeleton />
                                </div>
                            </div>
                        </div>

                        {/* 2. QUICK ACTIONS SKELETON */}
                        <div>
                            <SectionHeaderSkeleton />
                            <div className="flex flex-row justify-between" style={{ gap: 10 }}>
                                <div className="flex-1">
                                    <StatisticCardSkeleton isActionButton />
                                </div>
                                <div className="flex-1">
                                    <StatisticCardSkeleton isActionButton />
                                </div>
                                <div className="flex-1">
                                    <StatisticCardSkeleton isActionButton />
                                </div>
                            </div>
                        </div>

                        {/* 3. RECENT ORDERS SKELETON */}
                        <div>
                            <SectionHeaderSkeleton />
                            <div style={{ gap: 10 }}>
                                <StatisticCardSkeleton />
                                <StatisticCardSkeleton />
                            </div>
                        </div>

                        {/* 4. LOW STOCK PRODUCTS SKELETON */}
                        <div>
                            <SectionHeaderSkeleton />
                             <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                <div>
                                    <StatisticCardSkeleton />
                                </div>
                                <div>
                                    <StatisticCardSkeleton />
                                </div>
                            </div>
                        </div>
                    </Scrolldiv>
                ) : (
                    <Scrolldiv
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ gap: 20, paddingBottom: 120 }}
                        className="flex-1"
                    >

                        {/* 1. STATISTICS SECTION (2-Column Flex Wrap Grid) */}
                        <div>
                            <SectionHeader title="Statistics" Icon={ChartColumnDecreasing} />
                             <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-4">

                                <div>
                                    <StatisticCard
                                        title="Total Sales"
                                        num={Number(stats?.summary?.total_sales?.sales || 0)}
                                        Icon={BadgeCent}
                                        moneyLebal="KES"
                                        label="Revenue"
                                        amount={stats?.summary?.total_sales?.revenue || 0}
                                    />
                                </div>

                                <div>
                                    <StatisticCard
                                        title="Total Orders"
                                        num={Number(stats?.summary?.total_orders || 0)}
                                        Icon={Package}
                                        label="Orders"
                                    />
                                </div>

                                <div>
                                    <StatisticCard
                                        title="Total Customers"
                                        num={Number(stats?.summary?.total_customers || 0)}
                                        Icon={Users}
                                        label="Customers"
                                    />
                                </div>

                                {/* Empty structural layout anchor for keeping the odd grid item cleanly left-aligned */}
                            </div>
                        </div>

                        {/* 2. QUICK ACTIONS SECTION (3-Column Direct Row Map) */}
                        <div>
                            <SectionHeader title="Quick Actions" Icon={Bell} />
                            <div className="grid grid-cols-3 sm:grid-cols-3 gap-3">
                                <TouchableOpacity
                                    onPress={() => router.push('/sellerProduct/addProduct')}
                                    className="flex-1 bg-white p-3 sm:p-4 rounded-lg items-center border
                                border-sand-200  active:bg-sand-100">
                                    <Plus size={18} color='#475569' className="mb-1 sm:hidden" />
                                    <Plus size={20} color='#475569' className="mb-1 hidden sm:block" />
                                    <p className="font-jakarta-medium text-[10px] sm:text-xs text-center text-sand-800">Add Product</p>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => router.push('/orders')}
                                    className="flex-1 bg-white p-3 sm:p-4 rounded-lg items-center border border-sand-200  active:bg-sand-100">
                                    <ClipboardList size={18} color='#475569' className="mb-1 sm:hidden" />
                                    <ClipboardList size={20} color='#475569' className="mb-1 hidden sm:block" />
                                    <p className="font-jakarta-medium text-[10px] sm:text-xs text-center text-sand-800">View Orders</p>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => router.push('/store')}
                                    className="flex-1 bg-white p-3 sm:p-4 rounded-lg items-center border border-sand-200  active:bg-sand-100">
                                    <Settings size={18} color='#475569' className="mb-1 sm:hidden" />
                                    <Settings size={20} color='#475569' className="mb-1 hidden sm:block" />
                                    <p className="font-jakarta-medium text-[10px] sm:text-xs text-center text-sand-800">Manage Store</p>
                                </TouchableOpacity>
                            </div>
                        </div>

                        {/* 3. RECENT ORDERS SECTION (1-Column Vertical Layout) */}
                        {stats?.recent_orders && stats.recent_orders.length > 0 && (
                            <div>
                                <SectionHeader title="Recent Orders" Icon={Package} />
                                <div style={{ gap: 10 }}>
                                    {stats.recent_orders.map((order: any, index: number) => (
                                        <StatisticCard
                                            key={order.id || index}
                                            title={`Order ${order.unique_identifier}`}
                                            Icon={Package}
                                            label={order.status}
                                            createdAt={order.created_at}
                                            amount={order.grand_total}
                                            customer={order.customer}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 4. LOW STOCK PRODUCTS SECTION (2-Column Responsive Layout) */}
                        {stats?.low_stock_products && stats.low_stock_products.length > 0 && (
                            
                            <div>
                                <SectionHeader title="Low Stock Products" Icon={Store} />
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {stats.low_stock_products.map((product: any, index: number) => (
                                        <div key={product.id || index}>
                                            <StatisticCard
                                                title={product.name}
                                                num={Number(product.stockQuantity)}
                                                Icon={Store}
                                                label={product.lebal || "In Stock"}
                                                stockAltert={product.stockAltert ?? true}
                                            />
                                        </div>
                                    ))}
                                    {/* Keeps grid trailing items neat if total count is odd */}
                                </div>
                            </div>
                        )}

                    </Scrolldiv>
                )}
            </div>

            {/* Logout Confirmation Modal */}
            <LogoutDecisionModal
                showLogoutModal={showLogoutModal}
                cancelLogout={cancelLogout}
                confirmLogout={confirmLogout}
            />
        </SafeAreadiv>
    );
};

export default DashboardScreen;