import { useToast } from '@/context/toastContext';
import { useUpdate } from '@/hooks/useApi';
import { Order, ProductType } from '@/interfaces/interface';
import { OrderStatus } from '@/interfaces/types/types';
import { updateOrderStatus } from '@/services/orders';
import dayjs from 'dayjs';
import { Bike, CheckCircle, ChefHat, ChevronDown, ChevronUp, Clock, CreditCard, FileText, MapPin, Package, Phone, XCircle } from 'lucide-react';
import React, { useState } from 'react';
import { ActivityIndicator, TouchableOpacity } from '@/components/common/ui';
import OrderimgsDisplayer from '@/components/common/OrderImagesDisplayer';

const STATUS_CONFIG: Record<string, {
    label: string;
    icon: React.ReactNode;
    pillBg: string;
    pillp: string;
    dot: string;
}> = {
    pending: { label: 'Pending', icon: <Clock size={12} color='#92400E' />, pillBg: 'bg-amber-100', pillp: 'text-amber-800', dot: 'bg-amber-400' },
    confirmed: { label: 'Confirmed', icon: <CheckCircle size={12} color='#1D4ED8' />, pillBg: 'bg-blue-100', pillp: 'text-blue-800', dot: 'bg-blue-400' },
    preparing: { label: 'Preparing', icon: <ChefHat size={12} color='#6D28D9' />, pillBg: 'bg-violet-100', pillp: 'text-violet-800', dot: 'bg-violet-400' },
    'out for delivery': { label: 'Out for Delivery', icon: <Bike size={12} color='#0369A1' />, pillBg: 'bg-info-100', pillp: 'text-info-700', dot: 'bg-info-500' },
    delivered: { label: 'Delivered', icon: <CheckCircle size={12} color='#065F46' />, pillBg: 'bg-emerald-100', pillp: 'text-emerald-800', dot: 'bg-emerald-400' },
    cancelled: { label: 'Cancelled', icon: <XCircle size={12} color='#991B1B' />, pillBg: 'bg-red-100', pillp: 'text-red-700', dot: 'bg-red-400' },
};

const DEFAULT_CONFIG = {
    label: 'Unknown',
    icon: <Clock size={12} color='#64748B' />,
    pillBg: 'bg-slate-100',
    pillp: 'text-slate-700',
    dot: 'bg-slate-400'
};

const StatusPill = ({ status }: { status: string }) => {
    const normalizedKey = status?.toLowerCase() || '';
    const cfg = STATUS_CONFIG[normalizedKey] || DEFAULT_CONFIG;

    return (
        <div className={`flex flex-row items-center px-2 py-1 rounded-full ${cfg.pillBg}`} style={{ gap: 4 }}>
            {cfg.icon}
            <p className={`text-xs font-jakarta-bold ${cfg.pillp}`}>{cfg.label}</p>
        </div>
    );
};


const OrderCard = ({ order, refetch }: { order: Order, refetch: () => void }) => {
    const [showDetails, setShowDetails] = useState(false);
    
    // Track which action is currently processing ('cancelled' | 'confirmed' | null)
    const [activeAction, setActiveAction] = useState<OrderStatus | null>(null);

    const normalizedKey = order?.status?.toLowerCase() || '';
    const cfg = STATUS_CONFIG[normalizedKey] || DEFAULT_CONFIG;
    const { showError, showSuccess } = useToast();

    const subtotalAmt = order?.subtotal ? Number(order.subtotal) : 0;
    const deliveryFeeAmt = order?.delivery_fee ? Number(order.delivery_fee) : 0;
    const totalAmt = order?.total ? Number(order.total) : (subtotalAmt + deliveryFeeAmt);
    const distanceKm = order?.distance_km ? Number(order.distance_km) : null;
    const paymentMethod = order?.payment_method === 'cod' ? 'Cash on Delivery' : 'Mpesa';

    const { loading: updateLoading, execute: updateOrder } = useUpdate((orderId: string | number, status: OrderStatus) =>
        updateOrderStatus(orderId, status)
    );

    const handleUpdateStatus = async (orderId: string, targetStatus: OrderStatus) => {
        const statusLabels: Record<OrderStatus, string> = {
            pending: 'pending',
            confirmed: 'confirmed',
            cancelled: 'cancelled / rejected',
            delivered: 'delivered',
            'out-for-delivery': 'out_for_delivery'
        };

        try {
            setActiveAction(targetStatus); // Set the target action being executed
            const result = await updateOrder(orderId, targetStatus);

            if (result?.error) {
                showError(result.error);
                return;
            }

            showSuccess(`Order ${orderId} successfully ${statusLabels[targetStatus]}.`);
            refetch();
        } catch (err: any) {
            showError(`Failed to execute order status update transaction: ${err}`);
        } finally {
            setActiveAction(null); // Reset when network call finishes
        }
    };

    return (
        <div className='bg-white border border-sand-200 rounded-lg p-4' style={{ gap: 12 }}>

            {/* Top — order number + status */}
            <div className='flex flex-row items-start justify-between'>
                <div className='flex flex-row items-center' style={{ gap: 8 }}>
                    <div className='w-9 h-9 bg-sand-300 rounded-xl items-center justify-center'>
                        <Package size={16} color='#334155' />
                    </div>
                    <div style={{ gap: 2 }}>
                        <p className='font-jakarta-bold text-xs text-sand-900'>
                            Order {order.unique_identifier}
                        </p>
                        <p className='font-jakarta-semibold text-xs text-sand-600'>
                            {order.buyer_name}
                        </p>
                        {order.phone && (
                            <div className='flex flex-row items-center' style={{ gap: 4, marginTop: 1 }}>
                                <Phone size={10} color='#64748B' />
                                <p className='font-jakarta text-[11px] text-sand-500 select-all'>
                                    {order.phone}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
                <StatusPill status={order.status} />
            </div>

            {/* Total Bill Box */}
            <div className="flex flex-row justify-between items-center bg-sand-300/40 p-3 rounded-xl border border-sand-300/70">
                <p className="font-jakarta-bold text-xs text-sand-900">Total Bill</p>
                <p className="font-jakarta-extrabold text-sm text-brand-600">KES {totalAmt.toLocaleString()}</p>
            </div>

            {/* Collapsible Details Container */}
            {showDetails && (
                <div style={{ gap: 12 }}>

                    {/* Preview img Block */}
                    {order.products?.length > 0 && order.products?.map((product: ProductType) => (
                        <OrderimgsDisplayer key={product.id || Math.random()} product={product} />
                    ))}

                    {/* Distance & Address Strip */}
                    <div className={`flex flex-row items-start px-3 py-2 rounded-xl ${cfg.pillBg}`} style={{ gap: 6 }}>
                        <MapPin size={13} color='#64748B' style={{ marginTop: 1 }} />
                        <div className="flex-1" style={{ gap: 2 }}>
                            <p className="font-jakarta-bold text-[11px] text-sand-800">
                                Destination {distanceKm !== null ? `(${distanceKm} km)` : ''}
                                <p>
                                    Delivery Time {order.delivery_time}
                                </p>
                            </p>
                            <p className="font-jakarta text-xs text-sand-600 leading-4">
                                {order?.delivery_address_text || 'No address text supplied'}
                                {order?.delivery_location ? `, ${order.delivery_location}` : ''}
                            </p>
                        </div>
                    </div>

                    {/* Payment Information Badge Group */}
                    <div className="flex flex-row items-center justify-between bg-sand-300/50 p-2.5 rounded-xl">
                        <div className="flex flex-row items-center" style={{ gap: 6 }}>
                            <CreditCard size={13} color="#64748B" />
                            <p className="font-jakarta-medium text-xs text-sand-700">
                                Method: <p className="font-jakarta-bold">{paymentMethod}</p>
                            </p>
                        </div>
                        <div className={`px-2 py-0.5 rounded-md ${order?.is_paid ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                            <p className={`text-[10px] font-jakarta-bold ${order?.is_paid ? 'text-emerald-700' : 'text-amber-700'}`}>
                                {order?.is_paid ? 'Paid' : 'Unpaid'}
                            </p>
                        </div>
                    </div>

                    {/* Financial Summary Breakdown */}
                    <div className="py-1" style={{ gap: 4 }}>
                        <div className="flex flex-row justify-between">
                            <p className="font-jakarta text-xs text-sand-500">Items Count</p>
                            <p className="font-jakarta text-xs text-sand-700">
                                {order.total_items_count === 1 ? `${order.total_items_count} item` : `${order.quantity} items`}
                            </p>
                        </div>
                        <div className="flex flex-row justify-between">
                            <p className="font-jakarta text-xs text-sand-500">Discount Given</p>
                            <p className="font-jakarta text-xs text-sand-700">
                                {order.discount ? `KES ${Number(order.discount).toLocaleString()}` : 'KES 0'}
                            </p>
                        </div>
                        <div className="flex flex-row justify-between">
                            <p className="font-jakarta text-xs text-sand-500">Subtotal</p>
                            <p className="font-jakarta text-xs text-sand-700">KES {subtotalAmt.toLocaleString()}</p>
                        </div>
                        <div className="flex flex-row justify-between">
                            <p className="font-jakarta text-xs text-sand-500">Delivery Fee</p>
                            <p className="font-jakarta text-xs text-sand-700">
                                {deliveryFeeAmt > 0 ? `KES ${deliveryFeeAmt.toLocaleString()}` : 'Free'}
                            </p>
                        </div>
                    </div>

                    {/* Optional Delivery Note Strip */}
                    {order.notes && (
                        <div className='bg-sand-300/60 flex flex-row items-start px-3 py-2 rounded-xl' style={{ gap: 6 }}>
                            <FileText size={13} color='#64748B' style={{ marginTop: 1 }} />
                            <p className='text-xs font-jakarta text-sand-700 flex-1' numberOfLines={2}>
                                <p className='font-jakarta-bold text-sand-800'>Note: </p>
                                {order.notes}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Action Buttons: Accept / Reject */}
            {order.status !== 'confirmed' && order.status !== 'cancelled' &&
                <div className='flex flex-row items-center justify-between pt-1'>
                    <TouchableOpacity
                        onPress={() => handleUpdateStatus(order.id, 'cancelled')}
                        disabled={updateLoading}
                        className='bg-market-500 px-5 py-2 rounded-lg'>
                        {updateLoading && activeAction === 'cancelled' ? (
                            <ActivityIndicator color="#F8FAFC" />
                        ) : (
                            <p className='text-sand-50 text-sm font-dm-mono'>Reject</p>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => handleUpdateStatus(order.id, 'confirmed')}
                        disabled={updateLoading}
                        className='bg-brand-500 px-5 py-2 rounded-lg'>
                        {updateLoading && activeAction === 'confirmed' ? (
                            <ActivityIndicator color="#F8FAFC" />
                        ) : (
                            <p className='text-sand-50 text-sm font-dm-mono'>Accept</p>
                        )}
                    </TouchableOpacity>
                </div>
            }

            {/* Divider */}
            <div className='h-px bg-sand-300' />

            {/* Bottom Panel Actions & Dropdown Toggle */}
            <div className='flex flex-row items-center justify-between'>
                <div className='flex flex-row items-center' style={{ gap: 4 }}>
                    <Clock size={11} color='#94A3B8' />
                    <p className='text-xs font-jakarta text-sand-600'>
                       {dayjs(order.created_at).format('MMM D, YYYY, h:mm A')}
                    </p>
                </div>

                <div className="flex flex-row items-center" style={{ gap: 12 }}>
                    <TouchableOpacity
                        onPress={() => setShowDetails(!showDetails)}
                        className="flex flex-row items-center bg-sand-300/50 px-2.5 py-1 rounded-xl"
                        style={{ gap: 4 }}
                    >
                        <p className="text-[11px] font-jakarta-bold text-sand-700">
                            {showDetails ? "Hide" : "Details"}
                        </p>
                        {showDetails ? <ChevronUp size={12} color='#475569' /> : <ChevronDown size={12} color='#475569' />}
                    </TouchableOpacity>
                </div>
            </div>

        </div>
    );
};

export default OrderCard;