import DistanceCalculator from '@/components/checkout/DistanceCalculator'
import Filters from '@/components/product/ProductFilters'
import { CartIcon, NotificationIcon } from '@/components/layout/NotificationIcon'
import { ProductCard, ProductTrendingCard } from '@/components/product/ProductCard'
import RefetchData from '@/components/common/RefetchData'
import SearchInput from '@/components/common/SearchInput'
import { useCategories } from '@/context/categoryContext'
import { useGlobalCounts } from '@/context/globalCountContext'
import { useFetch } from '@/hooks/useApi'
import { ProductType } from '@/interfaces/interface'
import { fetchFoodAndSnacksProducts, fetchPopularProducts, fetchProductsData } from '@/services/products'
import { useFocusEffect, useIsFocused, useLocalSearchParams, useRouter } from '@/router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Dimensions, FlatList, TouchableOpacity } from '@/components/common/ui'
import { SafeAreadiv } from '@/components/layout/SafeArea'

const SectionLabel = ({ text }: { text: string }) => (
    <p className='text-[11px] font-jakarta-semibold uppercase tracking-[0.14em] text-sand-500 mt-6 mb-3'>
        {text}
    </p>
);

export const ProductTrendingCardSkeleton = ({ SCREEN_WIDTH }: { SCREEN_WIDTH: number }) => (
    <div
        style={{ width: SCREEN_WIDTH - 32 }}
        className="flex-col flex relative my-2 rounded-md overflow-hidden bg-sand-300 animate-pulse h-48 justify-between p-3"
    >
        <div className="bg-sand-400 w-16 h-6 rounded z-10" />
        <div className="absolute bottom-3 right-3 flex flex-col items-end z-20 space-y-2" style={{ gap: 6 }}>
            <div className="w-36 h-3 bg-sand-400 rounded" />
            <div className="w-24 h-3 bg-sand-400 rounded" />
            <div className="flex-row items-center justify-end" style={{ gap: 6 }}>
                <div className="w-12 h-3 bg-sand-400 rounded" />
                <div className="w-20 h-5 bg-sand-400 rounded" />
            </div>
            <div className="w-32 h-9 bg-sand-400 rounded-lg" />
        </div>
    </div>
);

export const ProductCardSkeleton = () => (
    <div className="h-full bg-sand-200 flex-1 px-2 py-2 overflow-hidden rounded-sm animate-pulse">
        <div className="rounded-lg relative">
            <div className="absolute top-2 left-2 w-12 h-5 bg-sand-300 rounded-md z-10" />
            <div className="w-full h-40 bg-sand-300 rounded-lg" />
            <div className="flex-col flex w-full justify-center items-start mt-2">
                <div className="w-3/4 h-4 bg-sand-300 rounded mt-1" />
                <div className="flex-row w-full items-baseline my-2" style={{ gap: 6 }}>
                    <div className="w-20 h-5 bg-sand-300 rounded" />
                    <div className="w-12 h-3 bg-sand-300 rounded" />
                </div>
                <div className="w-full my-1 h-9 bg-sand-300 rounded-lg" />
            </div>
        </div>
    </div>
);

const Index = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [categorySlug, setCategorySlug] = useState('all');
    const [userLocation, setUserLocation] = useState({ latitude: 0, longitude: 0 });
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

    // Each fetch now tracks its OWN loading state — these are independent
    // network calls and must not share a single `loading` flag.
    const { data: products, loading, refetch: refetchProducts } =
        useFetch<ProductType[]>(() => fetchProductsData(categorySlug));

    const { data: popularProducts, loading: popularLoading, refetch: refetchPopularProducts } =
        useFetch<ProductType[]>(() => fetchPopularProducts());

    const { refetch: fetchNearbyProduct, data: nearbyProducts } =
        useFetch<ProductType[]>(() => fetchFoodAndSnacksProducts(userLocation));

    const { categories } = useCategories();
    const { refetchCart } = useGlobalCounts();
    const isFocused = useIsFocused();
    const router = useRouter();
    const { query } = useLocalSearchParams();
    const [screenWidth, setScreenWidth] = useState(() => Dimensions.get('window').width);
    const SCREEN_WIDTH = Math.min(screenWidth, 1180);
    const flatListRef = useRef<FlatList>(null);

    const CARD_WIDTH = SCREEN_WIDTH * 0.50;
    const CARD_INTERVAL = CARD_WIDTH + 12; 

    useEffect(() => {
        const updateWidth = () => setScreenWidth(window.innerWidth);
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, []);

    const allCategory = useMemo(() => [
        { id: 0, name: 'All', slug: 'all' },
        ...(categories || [])
    ], [categories]);

    // Deduplicate products by unique ID
    const allProducts = useMemo(() => {
        const combined = [...(products || []), ...(nearbyProducts || [])];
        const uniqueMap = new Map(combined.map(item => [item.id, item]));
        return Array.from(uniqueMap.values());
    }, [products, nearbyProducts]);

    // Single src of screen focus logic (removed redundant useEffect)
    useFocusEffect(
        useCallback(() => {
            refetchProducts(categorySlug);
            refetchPopularProducts('all');
        }, [categorySlug, refetchProducts, refetchPopularProducts])
    );

    const handleScroll = (event: any, index: number | null = null) => {
        if (index !== null) {
            setActiveIndex(index);
            flatListRef.current?.scrollToIndex({ index, animated: true });
            return;
        }
        const scrollPosition = event.nativeEvent.contentOffset.x;
        const currentIndex = Math.round(scrollPosition / (CARD_INTERVAL));
        setActiveIndex(currentIndex);
    };

    const handleLocationCapture = useCallback((coordinates: { latitude: number; longitude: number }) => {
        setUserLocation(coordinates);
    }, []);

    const handleNearbyProductsFetch = useCallback(async () => {
        await fetchNearbyProduct(userLocation);
    }, [fetchNearbyProduct, userLocation]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await refetchProducts(categorySlug);
        await refetchPopularProducts('all');
        await fetchNearbyProduct(userLocation);
        setIsRefreshing(false);
    };

    const hasProducts = products && products.length > 0;
    const hasPopularProducts = popularProducts && popularProducts.length > 0;

    console.log('the popular products are', popularProducts);

    return (
        <SafeAreadiv className='bg-sand-50 flex-1'>
            <div className='flex-1 px-4 md:px-6 lg:px-8'>
                {/* Header */}
                <div className='flex flex-row items-center justify-between border-b border-sand-200 mb-3'>
                      {isFocused && (
                    <div className='h-5 w-full my-2'>
                        <DistanceCalculator
                            role='buyer'
                            onLocationCaptured={handleLocationCapture}
                            onLocationProductsFetch={handleNearbyProductsFetch}
                            isForNearByProducts={true}
                        />
                    </div>
                )}

                    <div className='flex-row items-center'>
                         <RefetchData handleRefresh={handleRefresh} isRefreshing={isRefreshing} />
                        <NotificationIcon onPress={() => router.push('/notification')} />
                        <CartIcon />
                    </div>
                </div>

                <FlatList
                    data={loading ? [1, 2, 3, 4] : (allProducts.length ? allProducts : products || [])}
                    renderItem={({ item }) => (
                        loading ? (
                            <ProductCardSkeleton />
                        ) : (
                            <ProductCard
                                item={item as ProductType}
                                onPress={() => router.push(`/product/${(item as ProductType).id}`)}
                                refetchCart={refetchCart}
                            />
                        )
                    )}
                    numColumns={2}
                    keyExtractor={(item, idx) => loading ? `skeleton-${idx}` : (item as ProductType).id?.toString()}
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                    contentContainerStyle={{ gap: 10, paddingBottom: 140 }}
                    columnWrapperStyle={{ gap: 10 }}
                    ListEmptyComponent={
                        !loading ? (
                            <div className="items-center justify-center py-16 px-4">
                                <p className="text-lg font-jakarta-bold text-sand-700">
                                    No Products Found
                                </p>
                                <p className="text-sm font-jakarta text-sand-500 text-center mt-1">
                                    We couldn't find any products matching your selection. Try changing filters or categories.
                                </p>
                            </div>
                        ) : null
                    }
                    ListHeaderComponent={
                        <div className="pt-2">
                            <SearchInput
                                value={query as string}
                                onPress={() => router.push('buyer/search')}
                                placeholder='Search products...'
                            />

                            {/* Trending section is now gated on its OWN loading/data state,
                                independent of the main products list */}
                            {(popularLoading || hasPopularProducts) && (
                                <div>
                                    <SectionLabel text='Trending' />
                                    {popularLoading ? (
                                        <FlatList
                                            data={[1, 2]}
                                            renderItem={() => <ProductTrendingCardSkeleton SCREEN_WIDTH={SCREEN_WIDTH * 0.50} />}
                                            horizontal
                                            showsHorizontalScrollIndicator={false}
                                            contentContainerStyle={{ gap: 12 }}
                                        />
                                    ) : (
                                        <>
                                            <FlatList
                                                data={popularProducts}
                                                renderItem={({ item }) => (
                                                    <ProductTrendingCard
                                                        item={item}
                                                        refetchCart={refetchCart}
                                                        SCREEN_WIDTH={CARD_WIDTH}
                                                        onPress={() => router.push(`/product/${item.id}`)}
                                                    />
                                                )}
                                                keyExtractor={(item) => item.id?.toString()}
                                                horizontal
                                                ref={flatListRef}
                                                showsHorizontalScrollIndicator={false}
                                                bounces={false}
                                                hideScrollbar
                                                snapToInterval={CARD_INTERVAL}
                                                decelerationRate='fast'
                                                onScroll={(event) => handleScroll(event)}
                                                scrollEventThrottle={16}
                                                contentContainerStyle={{gap: 10}}
                                            />

                                            <div className='flex flex-row items-center justify-center mt-3 mb-1' style={{ gap: 6 }}>
                                                {popularProducts?.slice(0, 5).map((_, index) => (
                                                    <TouchableOpacity
                                                        key={index}
                                                        onPress={() => handleScroll(null, index)}
                                                        className={`rounded-full ${index === activeIndex
                                                            ? 'w-5 h-2 bg-info-600'
                                                            : 'w-2 h-2 bg-brand-500'
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            <SectionLabel text='Categories' />
                            <Filters filters={allCategory} onCategoryChange={(slug: string) => setCategorySlug(slug)} />
                            <SectionLabel text='Products' />
                        </div>
                    }
                />
            </div>
        </SafeAreadiv>
    );
};

export default Index;