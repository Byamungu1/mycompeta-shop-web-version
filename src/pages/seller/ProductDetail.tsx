import Header from '@/components/layout/Header';
import { useDelete, useFetch } from '@/hooks/useApi';
import { ProductType } from '@/interfaces/interface';
import { deleteSellerProduct, fetchSellerProductDetails } from '@/services/products';
import handleDeleteProduct from '@/utils/delete';
import { useFocusEffect, useLocalSearchParams, useRouter } from '@/router';
import {
    BadgeCent,
    Eye,
    Layers,
    Package,
    Percent,
    ShoppingBag,
    Tag
} from 'lucide-react';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Scrolldiv,
    TouchableOpacity
} from '@/components/common/ui';
import { SafeAreadiv } from '@/components/layout/SafeArea';

// ─── Sub-components ───────────────────────────────────────────────────────────

const QuickStatBlock = ({
    label,
    value,
    icon: Icon,
    accentColor
}: {
    label: string;
    value: string | number;
    icon: React.ComponentType<any>;
    accentColor: string;
}) => (
    <div className="flex-1 bg-sand-200 rounded-sm p-3" style={{ gap: 4 }}>
        <div className={`w-7 h-7 rounded-lg items-center justify-center ${accentColor}`}>
            <Icon size={14} className="text-sand-900" />
        </div>
        <p className="font-jakarta text-[11px] text-sand-700 mt-1">{label}</p>
        <p className="font-jakarta-bold text-base text-sand-800">{value}</p>
    </div>
);

const FieldGroupLabel = ({ text }: { text: string }) => (
    <p className="font-jakarta-bold text-md text-sand-500 tracking-widest mb-3 mt-4">
        {text}
    </p>
);

const DetailRow = ({
    label,
    value,
    icon: Icon,
    isPromo = false
}: {
    label: string;
    value: string;
    icon: React.ComponentType<any>;
    isPromo?: boolean;
}) => (
    <div className="flex flex-row items-center justify-between bg-sand-200 rounded-xl px-4 py-3.5 mb-2.5">
        <div className="flex flex-row items-center" style={{ gap: 10 }}>
            <Icon size={16} className='text-sand-800' />
            <p className="font-jakarta-semibold text-sm text-sand-800">{label}</p>
        </div>
        <p className={`font-jakarta-bold text-sm ${isPromo ? 'text-sand-50 bg-info-500 px-1 py-1 rounded-lg' : 'text-sand-900'}`}>
            {value}
        </p>
    </div>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

const ProductDetailScreen = () => {
    const { id } = useLocalSearchParams();
    const productId = id as string;
    const router = useRouter();

    const { data, loading, error, refetch } = useFetch<ProductType>(() => fetchSellerProductDetails(productId));
    const { execute: executeDelete, loading: isDeleting } = useDelete(deleteSellerProduct);

    // Simulated analytical stats (since your API doesn't return metrics right now)
    const [mockMetrics] = useState({
        views: 1420,
        purchases: 840,
    });

    const handlePressFetchDetails = async () => {
        try {
            await refetch();
        } catch (err) {
            console.error('Error executing product detail fetch trigger:', err);
        }
    };

    useFocusEffect(
        useCallback(() => {
            handlePressFetchDetails();
        }, [productId])
    );


    // 1. Safe parsing of pricing values
    const basePrice = Number(data?.price) || 0;
    const discountPrice = Number(data?.discount) || 0;

    console.log('the discount', discountPrice);
    console.log('the price', basePrice);

    // Added "discountPrice > 0" to ensure a zero value doesn't trick the math into 100% OFF
    const discountPercentage = basePrice > 0 && discountPrice > 0 && discountPrice < basePrice
        ? Math.round(((basePrice - discountPrice) / basePrice) * 100)
        : 0;
    console.log('the discount percentge', discountPercentage)

    // 3. Dynamic total stock calculation from variants array
    const totalStock = data?.variants?.reduce((acc: number, variant: any) => acc + (variant.stock_quantity || 0), 0) || 0;

    // Handle Loading State cleanly to prevent null object errors
    if (loading) {
        return (
            <SafeAreadiv className="flex-1 bg-sand-50">
                {/* Top Navigation Row */}
                <div className="px-4 sm:px-6 lg:px-8 pt-4 pb-2 flex flex-row items-center justify-between w-full max-w-3xl mx-auto">
                    <Header title='Product Details' />
                    <div className="w-9 h-9 opacity-0" />
                </div>
                <div className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#F59E0B" />
                </div>
            </SafeAreadiv>
        );
    }

    // Handle Fetch Errors Safely
    if (error || !data) {
        return (
            <SafeAreadiv className="flex-1 bg-sand-50">
                {/* Top Navigation Row */}
                <div className="px-4 sm:px-6 lg:px-8 pt-4 pb-2 flex flex-row items-center justify-between w-full max-w-3xl mx-auto">
                    <Header title='Product Details' />
                    <div className="w-9 h-9 opacity-0" />
                </div>
                <div className="flex-1 items-center justify-center p-4">
                    <p className="font-jakarta-bold text-center text-rose-500">Failed to load product details.</p>
                </div>
            </SafeAreadiv>
        );
    }


    return (
        <SafeAreadiv className="flex-1 bg-sand-50 relative">
            {/* Top Navigation Row */}
            <div className="px-4 sm:px-6 lg:px-8 pt-4 pb-2 flex flex-row items-center justify-between w-full max-w-3xl mx-auto">
                <Header title='Product Details' />
                <div className="w-9 h-9 opacity-0" />
            </div>

            <Scrolldiv
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {/* 1. PRODUCT imgS HERO BANNER */}
                <div className="mx-3 mt-3 rounded-lg overflow-hidden bg-gray-100 relative h-64 border border-brand-300">
                    <img
                        className="w-full h-full"
                        resizeMode="cover"
                        src={data?.images?.[0]?.image}
                    />
                    {/* Active Floating Discount Badge */}
                    {discountPercentage > 0 && (
                        <div className="absolute top-3 right-3 bg-info-500 px-3 py-1.5 rounded-full flex flex-row items-center" style={{ gap: 4 }}>
                            <Percent size={12} color="#FAFAF9" />
                            <p className="font-jakarta-bold text-xs text-white">{discountPercentage}OFF</p>
                        </div>
                    )}
                </div>

                {/* Main Content Info Block */}
                <div className="px-4 mt-3">

                    {/* Title & Core Pricing Identity */}
                    <div className="mb-5" style={{ gap: 6 }}>
                        <p className="font-jakarta-bold text-xl text-sand-900 leading-7">
                            {data?.name}
                        </p>
                        <div className="flex flex-row items-baseline mt-1" style={{ gap: 8 }}>
                            <p className="font-jakarta-bold text-2xl text-brand-800">
                                KES {basePrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </p>
                            {discountPercentage > 0 && (
                                <p className="font-jakarta text-sm text-sand-400 line-through">
                                    KES {discountPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* 2. PERFORMANCE INSIGHTS GRID */}
                    <FieldGroupLabel text="Performance Analytics" />
                    <div className="flex flex-row mb-4" style={{ gap: 8 }}>
                        <QuickStatBlock
                            label="Total divs"
                            value={data.total_views.toLocaleString()}
                            icon={Eye}
                            accentColor="bg-sand-300"
                        />
                        <QuickStatBlock
                            label="Purchases"
                            value={data.total_purchases.toLocaleString()}
                            icon={ShoppingBag}
                            accentColor="bg-sand-300"
                        />
                        <QuickStatBlock
                            label="Remaining Stock"
                            value={totalStock}
                            icon={Package}
                            accentColor={totalStock <= 15 ? 'bg-rose-300' : 'bg-sand-300'}
                        />
                    </div>

                    {/* 3. PRODUCT DESCRIPTION */}
                    <FieldGroupLabel text="Description" />
                    <div className="bg-sand-200 rounded-sm p-4 mb-4">
                        <p className="font-jakarta text-sm text-sand-600 leading-6">
                            {data?.description || "No description provided."}
                        </p>
                    </div>

                    {/* 4. STOCK INVENTORY & CATEGORIES SPECS */}
                    <FieldGroupLabel text="Inventory & Specifications" />
                    <DetailRow label="Category" value={data?.category || "N/A"} icon={Layers} />
                    <DetailRow label="Total Stock Quantity" value={`${totalStock} units`} icon={Package} />
                    <DetailRow label="Standard Base Price" value={`KES ${basePrice.toFixed(2)}`} icon={BadgeCent} />
                    {discountPercentage > 0 && (
                        <DetailRow
                            label="Active Discount Deal"
                            value={`KES ${(discountPrice).toFixed(2)} Saved`}
                            icon={Tag}
                            isPromo={true}
                        />
                    )}

                </div>
            </Scrolldiv>

            {/* Sticky bottom actions layout */}
            <div className="absolute bottom-4 left-4 right-4 flex flex-row" style={{ gap: 10 }}>
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={async() => await handleDeleteProduct(executeDelete, ()=>{}, productId, true)}
                    className="flex-1 bg-sand-100 border border-rose-200 rounded-lg py-3 flex flex-row items-center justify-center"
                >
                    <p className="font-jakarta-bold text-base text-rose-600">
                        Delete Product
                    </p>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => router.push(`/sellerProduct/editProduct/${productId}` as any)}
                    activeOpacity={0.85}
                    className="flex-1 bg-sand-100 border border-info-500 rounded-lg py-3 flex flex-row items-center justify-center"
                >
                    <p className="font-jakarta-bold text-base text-info-500">
                        Edit Details
                    </p>
                </TouchableOpacity>
            </div>
        </SafeAreadiv>
    );
};

export default ProductDetailScreen;