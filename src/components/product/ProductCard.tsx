import { ProductType, SellerConflict, Variant } from '@/interfaces/interface';
import getDiscountDetails from '@/utils/getDiscountDetails';
import { ShoppingCart, X } from 'lucide-react';
import { useState } from 'react';
import { Modal, TouchableOpacity } from '@/components/common/ui';
import DeliveryTime from '@/components/checkout/DeliveryWindow';
import SellerConflictModal from '@/components/seller/SellerConflictModal';
/* -------------------------------------------------------------------------- */
/*                            Size Selection Modal Component                   */
/* -------------------------------------------------------------------------- */

import { useHandleAddToCart } from '@/hooks/handleAddToCart';
import { validateProduct } from '@/utils/validateProductt';
import { useEffect, useMemo } from 'react';
import { Scrolldiv } from '@/components/common/ui';


interface VariantModalProps {
    product: ProductType;
    visible: boolean;
    onClose: () => void;
    variants: Variant[];
    onConfirm: (selectedVariant: Variant) => void;
}

const SizeModal = ({
    product,
    visible,
    onClose,
    variants = [],   //Check if the product category falls under clothing and shoes to oblidge varaint
    onConfirm,
}: VariantModalProps) => {
    const [activeSize, setActiveSize] = useState<string>('');
    const [activeColor, setActiveColor] = useState<string>('');

    // Extract unique sizes and colors

    const uniqueSizes = useMemo(() => {
        return Array.from(new Set(variants.map((v) => v.size))).filter(Boolean);
    }, [variants]);

    const uniqueColors = useMemo(() => {
        return Array.from(new Set(variants.map((v) => v.color))).filter(Boolean);
    }, [variants]);

    // Find active variant matching current selections
    const activeVariant = useMemo(() => {
        return variants.find(
            (v) => v.size === activeSize && v.color === activeColor
        );
    }, [variants, activeSize, activeColor]);

    const validation = useMemo(() => {
        // For Clothing & Apparel modal, we need proper variant validation
        if (!variants || variants.length === 0) {
            return {
                success: false,
                message: 'No variants available for this product'
            };
        }

        // If there are no size/color options but variants exist, check stock on any variant
        if (uniqueSizes.length === 0 && uniqueColors.length === 0 && variants.length > 0) {
            const anyInStock = variants.some(v => v.stock_quantity > 0);
            return {
                success: anyInStock,
                message: anyInStock ? '' : 'Product is out of stock'
            };
        }
        console.log('active variant', activeVariant)
        return validateProduct(product, activeVariant);
    }, [product, activeVariant, uniqueSizes, uniqueColors, variants]);

    const isDisabled = !validation.success
    console.log('the validation messasge', validation.message)

    // Auto-select first in-stock or first available variant when modal opens
    useEffect(() => {
        if (visible && variants.length > 0) {
            const firstInStock = variants.find((v) => v.stock_quantity > 0) || variants[0];
            if (firstInStock) {
                setActiveSize(firstInStock.size || '');
                setActiveColor(firstInStock.color || '');
            }
        }
    }, [visible, variants]);

    const handleConfirm = () => {
        // Allow confirmation if variant exists and has stock, even if size/color are empty
        if (!activeVariant || activeVariant.stock_quantity <= 0) {
            console.log('this is where the problem is')
            return;
        }

        console.log('variant is active')

        onConfirm({
            size: activeSize || activeVariant.size || '',
            color: activeColor || activeVariant.color || '',
            variantId: activeVariant.id,
            stock_quantity: activeVariant.stock_quantity,
            sku: activeVariant.sku
        });

        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <div className="flex-1 bg-black/50 justify-end">
                <div className="bg-sand-50 rounded-t-xl p-5 w-full max-h-[85%]">
                    {/* Header */}
                    <div className="flex-row items-center justify-between pb-3 border-b border-sand-200">
                        <div className="flex-1 pr-2">
                            <p className="font-jakarta-bold text-base text-sand-900">
                                Select Variant
                            </p>
                            <p numberOfLines={1} className="font-jakarta text-xs text-sand-500">
                                {product.name}
                            </p>
                        </div>
                        <TouchableOpacity onPress={onClose} className="p-1 rounded-full bg-sand-200">
                            <X size={18} className="text-sand-700" />
                        </TouchableOpacity>
                    </div>

                    <Scrolldiv showsVerticalScrollIndicator={false} className="my-4">
                        {/* Size Selection */}
                        {uniqueSizes.length > 0 && (
                            <div className="mb-4">
                                <p className="font-jakarta-bold text-xs uppercase tracking-wider text-sand-500 mb-2">
                                    Size
                                </p>
                                <div className="flex-row flex-wrap" style={{ gap: 8 }}>
                                    {uniqueSizes.map((size) => {
                                        const isSelected = activeSize === size;
                                        // Check if size has any available stock across variants
                                        const hasStock = variants.some(
                                            (v) => v.size === size && v.stock_quantity > 0
                                        );

                                        return (
                                            <TouchableOpacity
                                                key={size}
                                                onPress={() => setActiveSize(size)}
                                                disabled={!hasStock}
                                                className={`px-4 py-2.5 rounded-lg border items-center justify-center min-w-[50px] ${isSelected
                                                    ? 'bg-brand-500 border-brand-500'
                                                    : hasStock
                                                        ? 'bg-sand-100 border-sand-300'
                                                        : 'bg-sand-100/40 border-sand-200 opacity-40'
                                                    }`}
                                            >
                                                <p
                                                    className={`font-jakarta-bold text-sm ${isSelected
                                                        ? 'text-white'
                                                        : hasStock
                                                            ? 'text-sand-700'
                                                            : 'text-sand-400 line-through'
                                                        }`}
                                                >
                                                    {size}
                                                </p>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Color Selection */}
                        {uniqueColors.length > 0 && (
                            <div className="mb-4">
                                <p className="font-jakarta-bold text-xs uppercase tracking-wider text-sand-500 mb-2">
                                    Color
                                </p>
                                <div className="flex-row flex-wrap" style={{ gap: 8 }}>
                                    {uniqueColors.map((color) => {
                                        const isSelected = activeColor === color;
                                        // Check stock specifically for currently selected size + this color
                                        const colorVariant = variants.find(
                                            (v) => v.size === activeSize && v.color === color
                                        );
                                        const isAvailable = colorVariant && colorVariant.stock_quantity > 0;

                                        return (
                                            <TouchableOpacity
                                                key={color}
                                                onPress={() => setActiveColor(color)}
                                                disabled={!isAvailable}
                                                className={`px-4 py-2 rounded-lg border items-center justify-center ${isSelected
                                                    ? 'bg-brand-500 border-brand-500'
                                                    : isAvailable
                                                        ? 'bg-sand-100 border-sand-300'
                                                        : 'bg-sand-100/40 border-sand-200 opacity-40'
                                                    }`}
                                            >
                                                <p
                                                    className={`font-jakarta-bold text-xs ${isSelected
                                                        ? 'text-white'
                                                        : isAvailable
                                                            ? 'text-sand-700'
                                                            : 'text-sand-400 line-through'
                                                        }`}
                                                >
                                                    {color}
                                                </p>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Message when no variants have size or color */}
                        {uniqueSizes.length === 0 && uniqueColors.length === 0 && variants.length > 0 && (
                            <div className="mb-4 p-3 bg-sand-100 rounded-lg">
                                <p className="font-jakarta text-xs text-sand-600 text-center">
                                    This product has variants but no size or color options specified.
                                </p>
                            </div>
                        )}

                        {/* Stock Availability Indicator */}
                        {activeVariant && (
                            <div className="mt-1 p-2.5 rounded-lg bg-sand-100/70 border border-sand-200">
                                {activeVariant.stock_quantity > 0 ? (
                                    <p className="font-jakarta text-xs text-sand-600">
                                        Availability:{' '}
                                        <p className="font-jakarta-bold text-emerald-600">
                                            {activeVariant.stock_quantity} item{activeVariant.stock_quantity > 1 ? 's' : ''} in stock
                                        </p>
                                    </p>
                                ) : (
                                    <p className="font-jakarta-bold text-xs text-red-500">
                                        Out of stock for this size and color combination
                                    </p>
                                )}
                            </div>
                        )}
                    </Scrolldiv>

                    {/* Confirm Button */}
                    <TouchableOpacity
                        onPress={handleConfirm}
                        disabled={isDisabled}
                        className={`w-full py-3.5 rounded-md items-center justify-center ${!isDisabled
                            ? 'bg-brand-500 active:bg-brand-600'
                            : 'bg-sand-200 opacity-60'
                            }`}
                    >
                        <p className={`font-jakarta-bold text-xs ${!isDisabled ? 'text-sand-950' : 'text-sand-400'}`}>
                            {!isDisabled
                                ? (uniqueSizes.length > 0 || uniqueColors.length > 0
                                    ? `Add (${activeSize || 'N/A'} / ${activeColor || 'N/A'}) to Cart`
                                    : 'Add to Cart')
                                : 'Selection Unavailable'}
                        </p>
                    </TouchableOpacity>
                </div>
            </div>
        </Modal>
    );
};

export default SizeModal;

/* -------------------------------------------------------------------------- */
/*                             Product Trending Card                          */
/* -------------------------------------------------------------------------- */

export const ProductTrendingCard = ({
    SCREEN_WIDTH,
    onPress,
    item: product,
    refetchCart,
    distance = 0,
}: {
    SCREEN_WIDTH: number;
    onPress?: () => void;
    item: ProductType;
    refetchCart: () => Promise<void>;
    distance?: number;
}) => {
    const { finalPrice, percentOff } = getDiscountDetails(product.price, product.discount || 0);
    const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);
    const [sellerConflict, setSellerConflict] = useState<SellerConflict | null>(null);
    const [pendingAddItem, setPendingAddItem] = useState<ProductType | null>(null);

    const { handleAddToCart, handleConflictResolution } = useHandleAddToCart()

    const variants: Variant[] = product.variants?.length > 0 ? product.variants : product.product_variants


    console.log('product distance', product.distance)
    console.log('the seller name', product.seller?.shop_name)
    console.log('product image', product.imgs?.[0]?.img)

    return (
        <>
            <TouchableOpacity
                onPress={onPress}
                style={{
                    width: SCREEN_WIDTH,
                    flexShrink: 0,
                    flexGrow: 0,
                }}
                className="flex-col flex relative my-2 rounded-md overflow-hidden"
            >
                {/* Overlay */}
                <div className="w-full h-full bg-sand-800 absolute top-0 left-0 right-0 bottom-0 opacity-50 z-10 rounded-lg" />

                {/* Discount Badge */}
                {percentOff && (
                    <div className="absolute top-3 left-3 bg-red-500 px-2 py-1 rounded z-20">
                        <p className="text-white text-xs font-jakarta-bold">{percentOff}% OFF</p>
                    </div>
                )}

                {/* img */}
                <img
                    src={
                        product.images?.[0]?.image
                            ? product.images[0].image
                            : require('../../assets/imgs/trending.jpg')
                    }
                    className="w-full h-48 rounded-lg"
                    resizeMode="cover"
                />

                {/* p overlay */}
                <div className="absolute w-44 bottom-3 right-3 flex flex-col items-end z-20" style={{ gap: 4 }}>
                    <p numberOfLines={2} className="text-sand-100 text-xs font-syne-semibold text-right">
                        {product.name}
                    </p>

                    {/* Distance and delivery info for Food & Snacks */}
                    {product.category === "Food & Groceries" && (
                        <DeliveryTime
                            distanceKm={product?.distance}
                            orderTime={Date.now()}
                            getDeliveryTime={() => { }}
                            isForProductCard={true}
                        />
                    )}

                    <div className="flex-row items-baseline content-end" style={{ gap: 6 }}>
                        {product.discount > 0 && (
                            <p className="text-sm font-syne-medium text-sand-300 line-through">
                                KES {product.price}
                            </p>
                        )}
                        <p className="text-xl font-syne-semibold text-market-400">
                            KES {finalPrice}
                        </p>
                    </div>

                    <TouchableOpacity
                        onPress={() => handleAddToCart(
                            product,
                            refetchCart,
                            setIsSizeModalOpen,
                            setPendingAddItem,
                            setSellerConflict,
                            true //shouldShowSizeModal
                        )}
                        className="flex flex-row bg-market-500 rounded-md p-2 items-center justify-center"
                        style={{ gap: 4 }}
                    >
                        <p className="text-center text-sand-100 text-sm font-jakarta-semibold">
                            Add to Cart
                        </p>
                        <ShoppingCart size={20} className="text-sand-100" />
                    </TouchableOpacity>
                </div>
            </TouchableOpacity>

            {/* Size Modal - Only for Clothing & Apparel */}
            {product.category === "Clothing & Apparel" && (
                <SizeModal
                    visible={isSizeModalOpen}
                    onClose={() => setIsSizeModalOpen(false)}
                    variants={variants}
                    product={product}
                    onConfirm={(variant) => handleAddToCart(
                        product,
                        refetchCart,
                        setIsSizeModalOpen,
                        setPendingAddItem,
                        setSellerConflict,
                        false,
                        variant,


                    )}
                />
            )}

            {/* Seller Conflict Modal */}
            <SellerConflictModal
                visible={!!sellerConflict}
                conflict={sellerConflict}
                refetchCart={refetchCart}
                onResolve={handleConflictResolution}
                setPendingAddItem={setPendingAddItem}
                setSellerConflict={setSellerConflict}
                pendingAddItem={pendingAddItem}
                onClose={() => {
                    setSellerConflict(null);
                    setPendingAddItem(null);
                }}
            />
        </>
    );
};

/* -------------------------------------------------------------------------- */
/*                                Standard Product Card                        */
/* -------------------------------------------------------------------------- */


export const ProductCard = ({
    onPress,
    item: product,
    refetchCart,
    searched = false,
    distance = 0,
}: {
    onPress: () => void;
    item: ProductType;
    refetchCart: () => Promise<void>;
    searched?: boolean;
    distance?: number;
}) => {
    const { finalPrice, percentOff } = getDiscountDetails(product.price, product.discount || 0);
    const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);
    const [sellerConflict, setSellerConflict] = useState<SellerConflict | null>(null);
    const [pendingAddItem, setPendingAddItem] = useState<ProductType | null>(null);

    const { handleAddToCart, handleConflictResolution } = useHandleAddToCart();

    const variants = product.variants?.length > 0 ? product.variants : product.product_variants

    return (
        <div className="h-full bg-white border border-sand-200 flex-1 px-3 py-3 overflow-hidden rounded-lg shadow-sm hover:border-info-400 hover:shadow-md transition-all">
            <TouchableOpacity onPress={onPress} className="rounded-lg relative">
                {/* Discount Badge */}
                {percentOff && (
                    <div className="absolute top-2 left-2 bg-brand-500 px-2 py-0.5 rounded-md z-10">
                        <p className="text-sand-800 text-xs font-jakarta-bold">-{percentOff}%</p>
                    </div>
                )}

                <img
                    src={searched
                        ? product.image_urls
                        : product.images?.[0]?.image}
                    className="w-full h-40 md:h-48 rounded-lg object-cover"
                    resizeMode="cover"
                />

                <div className="flex-col flex w-full justify-center items-start mt-2">
                    <p
                        className="text-start text-sm font-syne-semibold text-sand-900 h-5"
                        numberOfLines={2}
                    >
                        {product.name}
                    </p>

                    <p className='text-xs text-sand-600 font-jakarta' numberOfLines={1}>
                        Shop - {product.seller?.shop_name || product.seller_shop_name}
                    </p>

                    {/* Distance and delivery info for Food & Snacks */}
                    {product.category === "Food & Groceries" && (
                        <DeliveryTime
                            distanceKm={product?.distance}
                            orderTime={Date.now()}
                            getDeliveryTime={() => { }}
                            isForProductCard={true}
                        />
                    )}

                    <div className="flex-row flex w-full items-baseline my-1" style={{ gap: 6 }}>
                        <p className="text-lg text-dm-mono-medium text-brand-500">
                            KES {finalPrice}
                        </p>
                        {product.discount > 0 && (
                            <p className="text-xs text-gray-400 text-dm-mono-medium line-through">
                                KES {product.price}
                            </p>
                        )}
                    </div>

                    <TouchableOpacity className="w-full my-1" onPress={() => handleAddToCart(
                        product,
                        refetchCart,
                        setIsSizeModalOpen,
                        setPendingAddItem,
                        setSellerConflict,
                        true//shouldShowSizeModal
                    )}>
                        <div
                            className="bg-brand-500 rounded-md py-2.5 w-full flex-row items-center justify-center"
                            style={{ gap: 6 }}
                        >
                            <p className="font-jakarta-bold text-sm text-sand-950">Add to Cart</p>
                            <ShoppingCart size={18} className="text-sand-950" />
                        </div>
                    </TouchableOpacity>
                </div>
            </TouchableOpacity>

            {/* Size Modal - Only for Clothing & Apparel */}
            {(product?.category_name || product.category || "").toLowerCase() === "clothing & apparel" && (
                <SizeModal
                    visible={isSizeModalOpen}
                    onClose={() => setIsSizeModalOpen(false)}
                    variants={variants}
                    product={product}
                    onConfirm={(variant) => handleAddToCart(
                        product,
                        refetchCart,
                        setIsSizeModalOpen,
                        setPendingAddItem,
                        setSellerConflict,
                        false,
                        variant,
                    )}
                />
            )}

            {/* Seller Conflict Modal */}
            <SellerConflictModal
                visible={!!sellerConflict}
                conflict={sellerConflict}
                onResolve={handleConflictResolution}
                setPendingAddItem={setPendingAddItem}
                refetchCart={refetchCart}
                setSellerConflict={setSellerConflict}
                pendingAddItem={pendingAddItem}
                onClose={() => {
                    setSellerConflict(null);
                    setPendingAddItem(null);
                }}
            />
        </div>
    );
};