import { useFetch } from "@/hooks/useApi";
import { Customer, CustomerProfileData, Purchase } from "@/interfaces/interface";
import { getCustomerDetail } from "@/services/customer";
import { useFocusEffect } from "@/router";
import { BadgeCent, ChevronRight, Crown, ShoppingBag } from "lucide-react";
import { useCallback } from "react";
import { TouchableOpacity } from "@/components/common/ui";

const PurchaseRow = ({ purchase }: { purchase: Purchase }) => (
    <div className='flex flex-col py-2 border-b border-brand-300'>
        <div className='flex flex-row items-center justify-between' style={{ gap: 8 }}>
            <div className="flex-row items-center gap-3">
                <ShoppingBag size={13} color='#475569' />
                <p className='font-jakarta-semibold text-xs text-sand-700'>
                    Order {purchase.unique_identifier}
                </p>
            </div>
            <p className='font-jakarta-bold text-xs text-sand-900'>
                KES {purchase.total.toLocaleString()}
            </p>
        </div>
        <div className='items-start ml-6' style={{ gap: 1 }}>
            <p className='font-jakarta text-[10px] text-sand-400'>{purchase.created_at}</p>
        </div>
    </div>
);


const CustomerProfile = ({ customer }: { customer: Customer }) => {
    const { data: customerDetailData, loading: customerDataLoading, error, refetch } = useFetch<CustomerProfileData>(() => getCustomerDetail(Number(customer.id)))

    useFocusEffect(
        useCallback(() => {
            refetch()
        }, [])
    )

    console.log('the customer data', customerDetailData)

    if (!customerDetailData) return null

    return (
        <div className='mb-2 bg-white border border-sand-200 rounded-lg p-4' style={{ gap: 12 }}>
            {/* Stats row */}
            <div className='flex flex-row' style={{ gap: 10 }}>
                <div className='flex-1 bg-sand-100 rounded-xl p-3 items-center' style={{ gap: 3 }}>
                    <ShoppingBag size={16} color='#0EA5E9' />
                    <p className='font-jakarta-bold text-base text-sand-900'>{customerDetailData.total_orders}</p>
                    <p className='font-jakarta text-xs text-sand-500'>Orders</p>
                </div>
                <div className='flex-1 bg-sand-100 rounded-xl p-3 items-center' style={{ gap: 3 }}>
                    <BadgeCent size={16} color='#10B981' />
                    <p className='font-jakarta-bold text-base text-sand-900'>
                        {customerDetailData.total_spent.toLocaleString()}
                    </p>
                    <p className='font-jakarta text-xs text-sand-500'>KES Spent</p>
                </div>

            </div>

            {/* Phone */}
            <div className='flex flex-row items-center bg-sand-100 rounded-xl px-3 py-2.5' style={{ gap: 8 }}>
                <p className='font-jakarta text-xs text-sand-500'>📞</p>
                <p className='font-jakarta-semibold text-sm text-sand-800'>{customerDetailData.phone_number}</p>
            </div>

            {/* Purchase history */}
            <div>
                <p className='font-jakarta-bold text-xs text-sand-500 mb-2 tracking-widest'>
                    Purchase History
                </p>
                {customerDetailData.purchase_history?.map(p => (
                    <PurchaseRow key={p.unique_identifier as string} purchase={p} />
                ))}
            </div>
        </div>
    )
};


export const CustomerCard = ({
    customer,
    expanded,
    onPress,
    isTop,
}: {
    customer: Customer;
    expanded: boolean;
    onPress: () => void;
    isTop: boolean;
}) => (
    <div>
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.75}
            className='flex flex-row items-center bg-sand-100 rounded-lg px-3 py-3'
            style={{ gap: 12 }}>


            <div className='w-11 h-11 bg-brand-500 rounded-full items-center justify-center'>
                <p className='font-jakarta-bold text-base text-brand-800'>
                    {customer.full_name?.split(' ').map(n => n[0]).join('')}
                </p>
            </div>

            <div className='flex-1' style={{ gap: 3 }}>
                <div className='flex flex-row items-center' style={{ gap: 6 }}>
                    <p className='font-jakarta-bold text-sm text-sand-900'>{customer.full_name}</p>
                    {isTop && <Crown size={12} color='#D97706' />}
                </div>
                <div className='flex flex-row items-center' style={{ gap: 10 }}>
                    <p className='font-jakarta text-xs text-sand-500'>
                        {customer.total_orders} orders
                    </p>
                    <div className='w-1 h-1 rounded-full bg-sand-300' />
                    <p className='font-jakarta text-xs text-sand-500'>
                        KES {customer.total_spent.toLocaleString()}
                    </p>
                </div>
            </div>

            <ChevronRight
                size={16}
                color='#94A3B8'
                style={{ transform: [{ rotate: expanded ? '90deg' : '0deg' }] }}
            />
        </TouchableOpacity>

        {expanded && <CustomerProfile customer={customer} />}
    </div>
);