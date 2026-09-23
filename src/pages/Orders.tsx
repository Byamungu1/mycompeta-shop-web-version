import { FILTER_TABS } from '@/assets/constants/data';
import Filters from '@/components/product/ProductFilters';
import Header from '@/components/layout/Header';
import { OrderCard } from '@/components/seller/OrderCard';
import RefetchData from '@/components/common/RefetchData';
import { useToast } from '@/context/toastContext';
import { useFetch, usePost } from '@/hooks/useApi';
import { Order } from '@/interfaces/interface';
import { cancelOrder, getOrders } from '@/services/orders';
import { useFocusEffect } from '@/router';
import { ShoppingBag } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { FlatList } from '@/components/common/ui';
import { SafeAreadiv } from '@/components/layout/SafeArea';

// ─── Skeleton Loaders ─────────────────────────────────────────────────────────

export const OrderCardSkeleton = () => (
  <div className="w-full bg-sand-200 rounded-xl p-4 my-1 animate-pulse" style={{ gap: 12 }}>
    <div className="flex-row items-center justify-between">
      <div className="w-28 h-4 bg-sand-300 rounded" />
      <div className="w-20 h-6 bg-sand-300 rounded-full" />
    </div>
    <div className="w-48 h-3 bg-sand-300 rounded" />
    <div className="flex-row justify-between items-center pt-2 border-t border-sand-300">
      <div className="w-16 h-4 bg-sand-300 rounded" />
      <div className="w-20 h-5 bg-sand-300 rounded" />
    </div>
  </div>
);

// ─── Empty State Component ───────────────────────────────────────────────────

const EmptyState = ({ activeTab }: { activeTab: string }) => (
  <div className="flex-1 items-center justify-center mt-20" style={{ gap: 12 }}>
    <div className="w-16 h-16 bg-sand-100 rounded-full items-center justify-center">
      <ShoppingBag size={28} color="#94A3B8" />
    </div>
    <p className="font-jakarta-bold text-base text-sand-700">No orders found</p>
    <p className="font-jakarta text-sm text-sand-400 text-center px-10">
      {activeTab === 'all'
        ? "You haven't placed any orders yet."
        : `You have no ${activeTab.replace(/_/g, ' ')} orders.`}
    </p>
  </div>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

const Orders = () => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [cancellingOrderId, setCancellingOrderId] = useState<string | number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { showError, showSuccess } = useToast();

  const { data, loading: orderLoading, error: orderError, refetch } =
    useFetch<Order[]>(() => getOrders('buyer', activeTab));

  const { execute: cancelOrderRequest, loading: cancelLoading } = usePost((orderId: string | number) => cancelOrder(orderId));

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch, activeTab])
  );

  const orders = useMemo(() => {
    const results: Order[] = data?.results || [];
    return results;
  }, [data]);

  const counts = useMemo(() => ({
    all: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    out_for_delivery: orders.filter(
      (o) => o.status === 'out-for-delivery'
    ).length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
  }), [orders]);

  const handleCancelOrder = async (orderId: string | number) => {
    setCancellingOrderId(orderId);
    try {
      const result = await cancelOrderRequest(orderId);

      if (result.success) {
        showSuccess('Order cancelled successfully');
        refetch(); // Refresh orders after cancellation
      } else {
        showError(result.error || 'Failed to cancel order');
      }
    } catch (error) {
      showError('Failed to cancel order');
    } finally {
      setCancellingOrderId(null);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  /*if (orderError) {
    return (
      <div className="flex-1 items-center justify-center bg-sand-50">
        <p className="font-jakarta-medium text-sand-600">
          Something went wrong loading your orders.
        </p>
      </div>
    );
  }*/

  console.log('order errors', orderError)
  return (
    <SafeAreadiv className="bg-sand-50 flex-1">
      <div className="px-4 sm:px-6 lg:px-8 pt-2 flex-1 w-full max-w-3xl mx-auto">
        <div className="flex flex-row items-center justify-between mb-4 gap-3">
          <Header
            title="Orders"
            subtitle={`${counts.all} total · ${counts.pending + counts.out_for_delivery} active`}
          />
          <RefetchData
            handleRefresh={handleRefresh}
            isRefreshing={isRefreshing}
          />
        </div>

        <FlatList
          data={orderLoading ? [1, 2, 3, 4] : orders}
          keyExtractor={(item, index) =>
            orderLoading ? `skeleton-${index}` : (item as Order).id?.toString()
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ gap: 12, paddingBottom: 120 }}
          renderItem={({ item, index }) =>
            orderLoading ? (
              <OrderCardSkeleton />
            ) : (
              <OrderCard
                key={index}
                order={item}
                isBuyer={true}
                onCancelOrder={handleCancelOrder}
                refetch={refetch}
                isCancelling={cancellingOrderId === item.id}
              />
            )
          }
          ListEmptyComponent={
            !orderLoading ? <EmptyState activeTab={activeTab} /> : null
          }
          ListHeaderComponent={
            <div className="mb-2">
              <Filters
                filters={FILTER_TABS}
                activeTab={activeTab}
                items={orders}
                onCategoryChange={(selectedTab: string) => setActiveTab(selectedTab)}
              />
            </div>
          }
        />
      </div>
    </SafeAreadiv>
  );
};

export default Orders;