import Header from '@/components/layout/Header'
import { CartIcon } from '@/components/layout/NotificationIcon'
import RefetchData from '@/components/common/RefetchData'
import SellerConflictModal from '@/components/seller/SellerConflictModal'
import { useGlobalCounts } from '@/context/globalCountContext'
import { useLoadingSpinner } from '@/context/loadingSpinnerContext'
import { useToast } from '@/context/toastContext'
import { useHandleAddToCart } from '@/hooks/handleAddToCart'
import { useFetch } from '@/hooks/useApi'
import { ProductType, SellerConflict, UseVariantSelectorReturn } from '@/interfaces/interface'
import { directBuy } from '@/services/cart'
import { fetchProductDetails } from '@/services/products'
import getDiscountDetails from '@/utils/getDiscountDetails'
import { validateProduct } from '@/utils/validateProductt'
import { useFocusEffect, useLocalSearchParams } from '@/router'
import { ShoppingBag, ShoppingCart, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, Animated, Dimensions, Modal, Scrolldiv, TouchableOpacity } from '@/components/common/ui'
import { SafeAreadiv } from '@/components/layout/SafeArea'

// Available shoe sizes (can also come dynamically from product.sizes if available)
const Variants = ({
    uniqueSizes, selectedColor,
    selectedSize, setSelectedSize, setProductValidationMessage,
    message, uniqueColors, setSelectedColor, activeVariant }: UseVariantSelectorReturn) =>

(
    <div className="mb-4">
        {/* --- SIZE SELECTOR --- */}
        {uniqueSizes.length > 0 && (
            <div className="mb-3">
                <p className="text-xs font-jakarta-bold text-sand-500 mb-2 uppercase tracking-wider">
                    Select Size
                </p>
                <Scrolldiv
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 8 }}
                >
                    {uniqueSizes.map((size) => {
                        const isSelected = selectedSize === size;
                        return (
                            <TouchableOpacity
                                key={size}
                                activeOpacity={0.7}
                                onPress={() => {
                                    setProductValidationMessage('')
                                    setSelectedSize(size)
                                }}
                                className={`px-4 py-2.5 rounded-lg border ${isSelected
                                    ? 'bg-brand-500 border-brand-500'
                                    : 'bg-sand-100 border-sand-400'
                                    }`}
                            >
                                <p
                                    className={`text-sm font-jakarta-bold ${isSelected ? 'text-white' : 'text-sand-700'
                                        }`}
                                >
                                    {size}
                                </p>
                            </TouchableOpacity>
                        );
                    })}
                </Scrolldiv>
            </div>
        )}

        {/* --- COLOR SELECTOR (Renders if colors are present in variant data) --- */}
        {uniqueColors.length > 0 && (
            <div className="mb-3">
                <p className="text-xs font-jakarta-bold text-sand-500 mb-2 uppercase tracking-wider">
                    Select Color
                </p>
                <Scrolldiv
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 8 }}
                >
                    {uniqueColors.map((color) => {
                        const isSelected = selectedColor === color;
                        console.log('is selected', isSelected)
                        console.log('selected color', selectedColor)
                        console.log('selected size', selectedSize)
                        return (
                            <TouchableOpacity
                                key={color}
                                activeOpacity={0.7}
                                onPress={() => {
                                    setProductValidationMessage('')
                                    setSelectedColor(color)
                                }}
                                className={`px-4 py-2.5 rounded-lg border ${isSelected
                                    ? 'bg-brand-500 border-brand-500'
                                    : 'bg-sand-100 border-sand-400'
                                    }`}
                            >
                                <p
                                    className={`text-sm font-jakarta-bold ${isSelected ? 'text-white' : 'text-sand-700'
                                        }`}
                                >
                                    {color}
                                </p>
                            </TouchableOpacity>
                        );
                    })}
                </Scrolldiv>
            </div>
        )}

        {/* --- STOCK INDICATOR FOR SELECTED VARIANT --- */}
        {activeVariant && (
            <>
                <p className="text-xs font-jakarta text-sand-500 mt-1">
                    In stock: <p className="font-jakarta-bold text-sand-800">{activeVariant.stock_quantity} available</p>
                </p>

            </>
        )}
        <p className='text-sm text-market-500 font-jakarta-semibold'>
            {message}
        </p>
    </div>
)

const ProductFeatures = ({ title }: { title: string }) => {
    return (
        <div className="flex flex-row items-center my-1">
            <div className="w-2 h-2 rounded-full bg-brand-500 mr-2" />
            <p className="text-base font-jakarta-medium text-sand-700">{title}</p>
        </div>
    )
}

const ProductDetails = () => {
    const { id } = useLocalSearchParams()
    const { showError, showSuccess } = useToast()
    const { LoadingSpinner } = useLoadingSpinner()
    const [selectedSize, setSelectedSize] = useState<string | null>(null)
    const [selectedColor, setSelectedColor] = useState<string | null>(null)
    const [productValidationMessage, setProductValidationMessage] = useState('')
    const [currentimgIndex, setCurrentimgIndex] = useState(0)
    const [isFullScreen, setIsFullScreen] = useState(false)
    const [fullScreenOpacity] = useState(new Animated.Value(0))
    const [fullScreenScale] = useState(new Animated.Value(0.9))
    const [isRefreshing, setIsRefreshing] = useState(false)

    const screenWidth = Dimensions.get('window').width
    const productId = id

    const { data: product, error, loading: productLoading, refetch } =
        useFetch<ProductType>(() => fetchProductDetails(productId as string))

    const [sellerConflict, setSellerConflict] = useState<SellerConflict | null>(null);
    const [pendingAddItem, setPendingAddItem] = useState<ProductType | null>(null);

    const { handleAddToCart, handleConflictResolution } = useHandleAddToCart()

    const { refetchCart, counts } = useGlobalCounts()


    const [galleryWidth, setGalleryWidth] = useState(0) // fallback until measured

    const galleryContainerRef = useRef<HTMLDivElement>(null);
    const scrollViewRef = useRef<any>(null);


    useEffect(() => {
        const el = galleryContainerRef.current;
        if (!el) return;

        // set initial width immediately
        setGalleryWidth(el.offsetWidth);

        // keep it correct across resizes/orientation changes
        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setGalleryWidth(entry.contentRect.width);
            }
        });
        observer.observe(el);

        return () => observer.disconnect();
    }, [product]);

    useFocusEffect(
        useCallback(() => {
            const perfomRefetchData = async () => {
                if (!productId) return

                await refetch(null);

                if (error) {
                    showError('Failed to fetch product details')
                }
            }
            perfomRefetchData();

        }, [productId])
    )


    // 1. Extract unique non-empty sizes
    const uniqueSizes = useMemo(() => {
        if (!product?.variants) return [];
        const sizes = product.variants
            .map((v) => v.size?.trim())
            .filter((s): s is string => Boolean(s));
        return Array.from(new Set(sizes));
    }, [product?.variants]);

    // 2. Extract unique non-empty colors
    const uniqueColors = useMemo(() => {
        if (!product?.variants) return [];
        const colors = product.variants
            .map((v) => v.color?.trim())
            .filter((c): c is string => Boolean(c));
        return Array.from(new Set(colors));
    }, [product?.variants]);

    // 3. Find active variant based on selections
    const activeVariant = useMemo(() => {
        return product?.variants?.find((v) => {
            const matchesSize = !selectedSize || v.size?.trim() === selectedSize;
            const matchesColor = !selectedColor || v.color?.trim() === selectedColor;
            return matchesSize && matchesColor;
        });
    }, [product?.variants, selectedSize, selectedColor]);

    useEffect(() => {
        if (uniqueSizes.length > 0 && !selectedSize) {
            setSelectedSize(uniqueSizes[0])
        }
        if (uniqueColors.length > 0 && !selectedColor) {
            setSelectedColor(uniqueColors[0])
        }
    }, [uniqueSizes, uniqueColors])

    const openFullScreen = (index: number) => {
        setCurrentimgIndex(index)
        setIsFullScreen(true)
        Animated.parallel([
            Animated.timing(fullScreenOpacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.spring(fullScreenScale, {
                toValue: 1,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }),
        ]).start()
    }

    const closeFullScreen = () => {
        Animated.parallel([
            Animated.timing(fullScreenOpacity, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.timing(fullScreenScale, {
                toValue: 0.9,
                duration: 250,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setIsFullScreen(false)
        })
    }

    const scrollToIndex = (index: number) => {
        console.log('Scrolling to index:', index, 'galleryWidth:', galleryWidth)
        setCurrentimgIndex(index)
        scrollViewRef.current?.scrollTo({ x: index * galleryWidth })
    }

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await refetch(null);
        setIsRefreshing(false);
    }

    if (productLoading) {
        return (
            <SafeAreadiv className="bg-sand-200 flex-1">
                <div className='px-3 w-full flex-1 mt-4'>
                    <div className='flex-row justify-between items-center'>
                        <div style={{ flex: 1 }}>
                            <Header title="Product Details" subtitle="Know more about the product" />
                        </div>
                        <div className='flex-row items-center' style={{ gap: 8 }}>
                            <RefetchData
                                handleRefresh={handleRefresh}
                                isRefreshing={isRefreshing}
                            />
                            <CartIcon />
                        </div>
                    </div>
                    <div className='flex-1 justify-center items-center mt-20'>
                        <ActivityIndicator size="large" color="#F59E0B" />
                    </div>
                </div>
            </SafeAreadiv>
        )
    }


    const handleDirectBuy = async (product: ProductType) => {

        setProductValidationMessage('');

        if (product.category === 'Clothing & Apparel' && !selectedSize) {
            showError('Please select a size first');
            return;
        }

        const { success, message, itemToAdd } = validateProduct(product, activeVariant);

        // Pass selected size alongside product payload
        if (message) setProductValidationMessage(message)

        if (!success) return

        const productWithVariant = {
            ...product,
            variant: {
                size: selectedSize,
                color: selectedColor,
                variantId: activeVariant?.id
            }
        };

        const result = await directBuy(productWithVariant);

        if (!result) {
            showError('Unable to proceed to checkout');
            return;
        }

        showSuccess(`Proceeding to checkout with size ${selectedSize}!`);
    };

    if (!product) return null

    const { finalPrice, percentOff } = getDiscountDetails(product.price, product.discount || 0)
    console.log('the product details image', product.images?.[0]?.image)
    return (
        <SafeAreadiv className="bg-sand-50 flex-1">
            <div className="px-4 sm:px-6 lg:px-8 w-full flex-1 mt-4 max-w-4xl mx-auto relative">
                <div className='flex flex-row justify-between items-center gap-3'>
                    <div style={{ flex: 1 }}>
                        <Header title="Product Details" subtitle="Know more about the product" />
                    </div>
                    <div className='flex-row items-center' style={{ gap: 8 }}>
                        <RefetchData
                            handleRefresh={handleRefresh}
                            isRefreshing={isRefreshing}
                        />
                        <CartIcon />
                    </div>
                </div>
                <Scrolldiv className="flex-1 w-full" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>

                    {/* img Gallery */}
                    <div
                        className="w-full mt-2"
                        ref={galleryContainerRef}
                    >
                        <Scrolldiv
                            ref={scrollViewRef}
                            horizontal
                            pagingEnabled
                            snapToInterval={galleryWidth}
                            snapToAlignment="start"
                            decelerationRate="fast"
                            style={{ width: galleryWidth }}
                            contentContainerStyle={{ width: galleryWidth * (product?.images?.length || 1) }}
                            showsHorizontalScrollIndicator={false}
                            onMomentumScrollEnd={(event) => {
                                const index = Math.round(event.nativeEvent.contentOffset.x / galleryWidth)
                                setCurrentimgIndex(index)
                            }}
                        >
                            {product?.images?.map((img, index) => {

                                console.log('the product image', img.image)
                                console.log('the product image', img.image, 'gallery width:', galleryWidth)
                                return (
                                    <TouchableOpacity
                                        key={index}
                                        activeOpacity={0.9}
                                        onPress={() => openFullScreen(index)}
                                        style={{ width: galleryWidth }}   // ✅ use the measured width, not screenWidth
                                    >
                                        <div className="w-full overflow-hidden rounded-lg bg-sand-200 relative">
                                            <img
                                                className="w-full h-80 md:h-96 object-cover"
                                                src={img.image}
                                            />
                                            {percentOff &&
                                                <div className='bg-brand-500 px-4 rounded-xl absolute top-4 right-5 font-jakarta-semibold'>
                                                    <p className='text-sand-100 text-base'>
                                                        {percentOff && percentOff}% OFF
                                                    </p>
                                                </div>
                                            }

                                        </div>
                                    </TouchableOpacity>
                                )
                            })}
                        </Scrolldiv>

                        {product?.images && product.images.length > 1 && (
                            <div className="flex-row justify-center items-center mt-4 gap-2">
                                {product.images.map((_, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        onPress={() => scrollToIndex(index)}
                                        activeOpacity={0.7}
                                    >
                                        <div
                                            className={`h-2 rounded-full ${index === currentimgIndex ? 'w-3 bg-brand-500 h-3' : 'w-2 bg-sand-400'}`}
                                        />
                                    </TouchableOpacity>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Title & Price */}
                    <div className="w-full mt-4">
                        <p className="text-xl font-jakarta-bold text-sand-700">{product.name}</p>

                        <div className="flex-row items-center justify-between mt-2">
                            <div className="flex-row items-baseline gap-2">
                                <p className="text-xl font-dm-mono-bold text-brand-700">
                                    KES {finalPrice}
                                </p>
                                {product.discount && (
                                    <p className="text-sm font-dm-mono-bold text-sand-500 line-through">
                                        {product.price}
                                    </p>
                                )}

                            </div>
                        </div>

                        {/* Shoe Size Selection */}
                        <div className="mt-5">
                            <div className="flex-row justify-between items-center mb-2">
                                <p className="text-base font-jakarta-bold text-sand-700">Select Size</p>
                                {selectedSize && (
                                    <p className="text-xs font-jakarta-bold text-brand-600">
                                        Selected: {selectedSize}
                                    </p>
                                )}
                            </div>
                            <Variants uniqueSizes={uniqueSizes} uniqueColors={uniqueColors}
                                selectedColor={selectedColor} selectedSize={selectedSize}
                                activeVariant={activeVariant} setSelectedColor={setSelectedColor}
                                setSelectedSize={setSelectedSize}
                                message={productValidationMessage}
                                setProductValidationMessage={setProductValidationMessage}
                            />
                        </div>

                        {/* Description & Features Card */}
                        <div className="bg-white rounded-lg p-4 flex flex-col mt-5 border border-sand-200">
                            <p className="text-base font-jakarta-bold text-sand-700 mb-1">Description</p>
                            <p className="text-sm font-jakarta-medium text-sand-700 leading-6">
                                {product.description}
                            </p>

                            {product?.features && product.features.length > 0 && (
                                <div className="mt-4 pt-3 border-t border-sand-400/40">
                                    <p className="text-base font-jakarta-bold text-sand-700 mb-2">Features</p>
                                    {product.features.map((title, index) => (
                                        <ProductFeatures key={`${title}-${index}`} title={title} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </Scrolldiv>

                {/* Bottom Action Bar */}
                <div className="flex flex-row items-center absolute bottom-6
                 left-4 right-4 py-3 px-4 rounded-lg gap-3">
                    <TouchableOpacity
                        className="flex-1 flex-row items-center justify-center rounded-md py-3 border border-brand-500 bg-white gap-2"
                        onPress={() => {
                            setProductValidationMessage('');

                            if ((product.category || product.category_name) === 'Clothing & Apparel' && !selectedSize) {
                                showError('Please select a size first');
                                return;
                            }
                            const { success, message, itemToAdd } = validateProduct(product, activeVariant);

                            console.log('the success', success)
                            if (success) {
                                handleAddToCart(
                                    product,
                                    refetchCart,
                                    () => { },
                                    setPendingAddItem,
                                    setSellerConflict,
                                    false // prevents showing the size model for non clothing products
                                )
                            }
                            if (message) setProductValidationMessage(message)
                        }}
                        activeOpacity={0.7}
                    >
                        <p className="text-sm font-jakarta-bold text-brand-700">Add to Cart</p>
                        <ShoppingCart size={18} className="text-brand-500" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="flex-1 flex-row items-center justify-center rounded-md py-3 bg-brand-500 gap-2"
                        onPress={() => handleDirectBuy(product)}
                        activeOpacity={0.8}
                    >
                        <p className="text-sm font-jakarta-bold text-white">Buy Now</p>
                        <ShoppingBag size={18} color="#FFFFFF" />
                    </TouchableOpacity>
                </div>

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

                {/* Full Screen img diver */}
                <Modal
                    visible={isFullScreen}
                    transparent
                    statusBarTranslucent
                    animationType="none" // we drive the animation ourselves for a smoother feel
                    onRequestClose={closeFullScreen}
                >
                    <Animated.div
                        style={{
                            flex: 1,
                            backgroundColor: 'black',
                            opacity: fullScreenOpacity,
                        }}
                    >
                        <TouchableOpacity activeOpacity={1} onPress={closeFullScreen} className="flex-1">
                            <TouchableOpacity
                                onPress={closeFullScreen}
                                className="absolute top-12 right-4 z-10 bg-black/50 rounded-full p-2"
                            >
                                <X size={24} color="#FFFFFF" />
                            </TouchableOpacity>

                            <Animated.div
                                style={{
                                    flex: 1,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    transform: [{ scale: fullScreenScale }],
                                }}
                            >
                                <img
                                    className='object-contain max-w-full max-h-full'
                                    style={{ maxWidth: '100%', maxHeight: '100%' }}
                                    src={product?.images?.[currentimgIndex]?.image}
                                />
                            </Animated.div>

                            {product?.images && product.images.length > 1 && (
                                <div className="absolute bottom-8 self-center bg-black/50 px-4 py-2 rounded-full">
                                    <p className="text-white font-jakarta-medium">
                                        {currentimgIndex + 1} / {product.images.length}
                                    </p>
                                </div>
                            )}
                        </TouchableOpacity>
                    </Animated.div>
                </Modal>
            </div>
        </SafeAreadiv>
    )
}

export default ProductDetails