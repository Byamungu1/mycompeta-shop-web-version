import { Order, ProductType } from "@/interfaces/interface";
import { OrderStatus } from "@/interfaces/types/types";
import { formatDate } from "@/utils/formatDate";
import { Box, CheckCircle, ChevronDown, ChevronUp, Clock, CreditCard, MapPin, Package, X, XCircle } from "lucide-react";
import React, { useState } from 'react';
import { ActivityIndicator, TouchableOpacity } from '@/components/common/ui';
import OrderimgsDisplayer from "@/components/common/OrderImagesDisplayer";

const STATUS_CONFIG: Record<OrderStatus, {
    label: string;
    pillClass: string;
    textClass: string;
    icon: React.ReactNode;
    dotClass: string;
}> = {
    all: {
        label: 'All',
        pillClass: 'bg-sand-200',
        textClass: 'text-sand-700',
        dotClass: 'bg-sand-400',
        icon: <Package size={13} className='text-sand-500' />,
    },
    pending: {
        label: 'Pending',
        pillClass: 'bg-brand-200',
        textClass: 'text-brand-700',
        dotClass: 'bg-brand-500',
        icon: <Clock size={13} className='text-brand-600' />,
    },
    confirmed: {
        label: 'Confirmed',
        pillClass: 'bg-emerald-100',
        textClass: 'text-emerald-700',
        dotClass: 'bg-emerald-400',
        icon: <CheckCircle size={13} className='text-emerald-600' />,
    },
    preparing: {
        label: 'Preparing',
        pillClass: 'bg-amber-100',
        textClass: 'text-amber-700',
        dotClass: 'bg-amber-400',
        icon: <Box size={13} className='text-amber-600' />,
    },
    'out-for-delivery': {
        label: 'On the Way',
        pillClass: 'bg-sky-100',
        textClass: 'text-sky-700',
        dotClass: 'bg-sky-400',
        icon: <MapPin size={13} className='text-sky-600' />,
    },
    delivered: {
        label: 'Delivered',
        pillClass: 'bg-green-100',
        textClass: 'text-green-700',
        dotClass: 'bg-green-500',
        icon: <CheckCircle size={13} className='text-green-600' />,
    },
    cancelled: {
        label: 'Cancelled',
        pillClass: 'bg-red-100',
        textClass: 'text-red-700',
        dotClass: 'bg-red-400',
        icon: <XCircle size={13} className='text-red-600' />
    },
};

const StatusPill = ({ status }: { status: OrderStatus }) => {
    const normalizedStatus = (status ?? 'Pending') as OrderStatus;
    const config = STATUS_CONFIG[normalizedStatus] ?? STATUS_CONFIG['Pending'];
    
    return (
        <div className={`flex flex-row items-center px-2.5 py-1 rounded-full ${config.pillClass}`} style={{ gap: 5 }}>
            {config.icon}
            <p className={`text-xs font-jakarta-bold ${config.textClass}`}>
                {config.label}
            </p>
        </div>
    );
};

export const OrderCard = ({ order, isBuyer = false, onCancelOrder, refetch, isCancelling }: { 
    order: Order; 
    isBuyer?: boolean;
    onCancelOrder?: (orderId: string | number) => void;
    refetch?: (arg: any) => void;
    isCancelling?: boolean;
}) => {
    const [showDetails, setShowDetails] = useState(false);

    const activeStatus = (order?.status ?? 'pending') as OrderStatus;
    
    // Orders that can be cancelled by buyers
    const cancellableStatuses = ['pending', 'confirmed'];
    const canCancel = isBuyer && cancellableStatuses.includes(activeStatus) && onCancelOrder;
   
    const subtotalAmt = order?.subtotal ? Number(order.subtotal) : 0;
    const deliveryFeeAmt = order?.delivery_fee ? Number(order.delivery_fee) : 0;
    const totalAmt = order?.total ? Number(order.total) : (subtotalAmt + deliveryFeeAmt);
    const distanceKm = order?.distance_km ? Number(order.distance_km) : null;
    const paymentMethod = order.payment_method === 'cod' ? 'Cash on Delivery' : 'Mpesa';


    return (
        <div className='bg-white rounded-lg p-4 border border-sand-200' style={{ gap: 14 }}>

            {/* Top Row: Meta Summary Header */}
            <div className='flex flex-row items-start justify-between'>
                <div className='flex flex-row items-center' style={{ gap: 10 }}>
                    <div className='w-10 h-10 bg-sand-200 rounded-xl items-center justify-center'>
                        <Package size={18} className='text-brand-500' />
                    </div>
                    <div style={{ gap: 2 }}>
                        <p className='font-jakarta-bold text-xs text-sand-900'>
                            {order?.unique_identifier || `ORD-${order?.id || '0000'}`}
                        </p>
                        <p className='font-jakarta text-xs text-sand-500'>
                            Buyer: {order?.buyer_name || 'Customer'}
                        </p>
                        <p className='font-jakarta text-sm text-sand-500'>Phone: {order.phone}</p>
                    </div>
                </div>
                <div className='flex flex-row items-center relative' style={{ gap: 8 }}>
                    <StatusPill status={activeStatus} />
                    {canCancel && (
                        <TouchableOpacity
                            onPress={() => onCancelOrder(order.id)}
                            disabled={isCancelling}
                            className={`absolute top-8 ${isCancelling ? 'bg-red-50 opacity-50' : 'bg-red-100'} px-3 py-1.5 rounded-lg flex flex-row items-center`}
                            style={{ gap: 4 }}
                        >
                            {isCancelling ? (
                                <ActivityIndicator size="small" color="#EF4444" />
                            ) : (
                                <>
                                    <X size={14} className='text-red-600' />
                                    <p className='text-xs font-jakarta-bold text-red-600'>Cancel</p>
                                </>
                            )}
                        </TouchableOpacity>
                    )}
                </div>
            </div>

            {/* ALWAYS SHOW: Total Bill (Strictly positioned first before hidden detail sections) */}
            <div className="flex flex-row justify-between items-center bg-sand-200/30 p-3 rounded-xl border border-sand-200/50">
                <p className="font-jakarta-bold text-sm text-sand-900">Total Bill</p>
                <p className="font-jakarta-extrabold text-base text-brand-600">KES {totalAmt.toLocaleString()}</p>
            </div>

            {/* EXPANDABLE SECTION */}
            {showDetails && (
                <div style={{ gap: 14 }}>
                    {/* Preview img Component */}
                    {order.products.length > 0 && order.products.map((product: ProductType, index) =>(
                        (
                        <OrderimgsDisplayer key={index} product={product}/>
                    )
                    )) }

                    {/* Middle Block: Delivery Details */}
                    {(order?.delivery_address_text || order?.delivery_location) && (
                        <div className="bg-sand-50 rounded-xl p-3 border border-sand-200" style={{ gap: 6 }}>
                            <div className="flex flex-row items-center" style={{ gap: 6 }}>
                                <MapPin size={14} className="text-sand-600" />
                                <p className="font-jakarta-bold text-xs text-sand-800">
                                    Delivery Destination {distanceKm !== null ? `(${distanceKm} km)` : ''}
                                </p>
                            </div>
                            <p className="font-jakarta text-xs text-sand-600 leading-4">
                                {order?.delivery_address_text || null}
                                {order?.delivery_location ? `${order.delivery_location}` : ''}
                            </p>
                        </div>
                    )}

                    {/* Payment Meta Information */}
                    <div className="flex flex-row items-center justify-between bg-sand-200/50 p-2.5 rounded-xl">
                        <div className="flex flex-row items-center" style={{ gap: 6 }}>
                            <CreditCard size={14} className="text-sand-500" />
                            <p className="font-jakarta-medium text-xs text-sand-700">
                                Method: <p className="font-jakarta-bold">{paymentMethod || 'Not Specified'}</p>
                            </p>
                        </div>
                        
                        <div className={`px-2 py-0.5 rounded-md ${order?.is_paid ? 'bg-green-100' : 'bg-amber-100'}`}>
                            <p className={`text-[11px] font-jakarta-bold ${order?.is_paid ? 'text-green-700' : 'text-amber-700'}`}>
                                {order?.is_paid ? 'Paid' : 'Unpaid'}
                            </p>
                        </div>
                    </div>

                    {/* Financial Ledger Breakdown */}
                    <div className="py-1" style={{ gap: 4 }}>
                        <div className="flex flex-row justify-between">
                            <p className="font-jakarta text-xs text-sand-500">Quantity</p>
                            <p className="font-jakarta text-xs text-sand-700">{order.total_items_count}</p>
                        </div>
                        {order.discount > 0 &&
                             <div className="flex flex-row justify-between">
                            <p className="font-jakarta text-xs text-sand-500">Discount</p>
                            <p className="font-jakarta text-xs text-sand-700">{order.discount}</p>
                        </div>
                        }   
                       
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
                </div>
            )}

            {/* Footer Row: Placed date and Toggle Button */}
            <div className='flex flex-row items-center justify-between pt-1 border-t border-sand-200/60'>
                <div className='flex flex-row items-center' style={{ gap: 5 }}>
                    <Clock size={12} className="text-sand-400" />
                    <p className='text-xs font-jakarta text-sand-400'>
                        {formatDate(order.created_at)}
                    </p>
                </div>

                {/* Show Details / Hide Details Button */}
                <TouchableOpacity 
                    onPress={() => setShowDetails(!showDetails)}
                    className="flex flex-row items-center bg-brand-50 px-3 py-1.5 rounded-xl border border-brand-200/30"
                    style={{ gap: 4 }}
                >
                    <p className="text-xs font-jakarta-bold text-brand-600">
                        {showDetails ? "Hide Details" : "Show Details"}
                    </p>
                    {showDetails ? (
                        <ChevronUp size={14} className="text-brand-600" />
                    ) : (
                        <ChevronDown size={14} className="text-brand-600" />
                    )}
                </TouchableOpacity>
            </div>

        </div>
    );
};