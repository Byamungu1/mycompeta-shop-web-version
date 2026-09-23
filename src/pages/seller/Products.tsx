import Filters from '@/components/product/ProductFilters'
import Header from '@/components/layout/Header'
import RefetchData from '@/components/common/RefetchData'
import SearchInput from '@/components/common/SearchInput'
import ProductCard from '@/components/seller/productCard'
import { ProductCardSkeleton } from '@/components/seller/productCardSkeleton'
import { useCategories } from '@/context/categoryContext'
import { useToast } from '@/context/toastContext'
import { useFetch } from '@/hooks/useApi'
import { ProductType } from '@/interfaces/interface'
import { fetchSellerProducts } from '@/services/products'
import { router, useFocusEffect, useLocalSearchParams } from '@/router'
import { Plus } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { ActivityIndicator, FlatList, TouchableOpacity } from '@/components/common/ui'
import { SafeAreadiv } from '@/components/layout/SafeArea'


const products = () => {

    const [slug, setSlug] = useState('')
    const [isRefreshing, setIsRefreshing] = useState(false)
    const { data, error, loading, refetch } = useFetch<ProductType>(() => fetchSellerProducts(slug))

    const {categories, refreshCategories} = useCategories()

    const {showError, showSuccess}=useToast()

    const handleRefresh = async () => {
        console.log('Refresh button clicked, current slug:', slug)
        setIsRefreshing(true)
        try {
            const success = await refetch(slug)
            await refreshCategories()
        } catch (error) {
            console.error('Refresh failed:', error)
            showError('Failed to refresh data')
        } finally {
            setIsRefreshing(false)
        }
    }

    useFocusEffect(
        useCallback(() => {
            const fetchProductsOnFocus = async () => {
                    await refetch(slug);
                    if (error) {
                        showError(error)
                    }
            };

            fetchProductsOnFocus();
            refreshCategories()

            // Optional: Return a cleanup function here if you need to clear anything when the screen loses focus
            return () => console.log('Screen unfocused');
        }, [refetch, slug]) // Add refetch to dependencies so it stays up-to-date
    );

    const allCategory = useMemo(() => {
            const baseCategories = categories || [];
            return [
                { id: 0, name: 'All', slug: 'all' },
                ...baseCategories
            ];
        }, [categories]);

    const productsData = data?.products

    // Debug logging to track data changes
    console.log('📦 [Products] Current products data:', productsData)
    console.log('📦 [Products] Products count:', productsData?.length || 0)

    const { query } = useLocalSearchParams()

    return (
        <SafeAreadiv className='flex-1'>
            <div className='flex-1 mt-5 px-4 sm:px-6 lg:px-8 bg-sand-100'>
                <div className="flex flex-row items-center justify-between gap-3">
                    <Header title="Products" subtitle='Manage your products'/>
                    <div className="flex flex-row items-center" style={{ gap: 10 }}>
                        <RefetchData handleRefresh={handleRefresh} isRefreshing={isRefreshing} />
                        <TouchableOpacity
                        onPress={()=> router.push('/sellerProduct/addProduct')}
                        className='bg-brand-500 rounded-full p-2'>
                            <Plus className='text-brand-100'/>
                            </TouchableOpacity>
                    </div>
                </div>
                <FlatList
                    data={loading ? [1, 2, 3, 4, 5] : productsData}
                    renderItem={({ item }) => (
                        loading ? <ProductCardSkeleton /> : <ProductCard refetch={refetch} product={item} />
                    )}
                    keyExtractor={(item, index) => {
                        if (loading) return `skeleton-${index}`;
                        return typeof item === 'object' && item.id ? item.id.toString() : `product-${index}`;
                    }}
                    numColumns={2}
                    contentContainerStyle={{
                        paddingBottom: 120,
                        paddingTop: 20
                    }}
                    columnWrapperStyle={{
                        gap: 12
                    }}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={
                        <div className='flex flex-col' style={{ gap: 10 }}>
                            <SearchInput
                                value={query as string}
                                onPress={() => router.push('/seller/search')}
                                placeholder='Search products...'
                            />
                            <Filters filters={allCategory} products={products}
                            onCategoryChange={(slug: string) => setSlug(slug)}/>
                        </div>
                    }
                    ListEmptyComponent={
                        loading ? (
                            <div className='w-full h-full flex items-center justify-center pt-20'>
                                <ActivityIndicator size="large" color="#F59E0B" />
                            </div>
                        ) : (
                        <div className='w-full h-full flex items-center justify-center'>
                            {
                                !loading &&
                                <>
                                    <p className='text-sand-400 text-xl'>
                                        No Products Found
                                    </p>
                                    <p className='mt-5 text-sand-400 text-xs'>Add Products</p>
                                    <TouchableOpacity
                                    onPress={() => router.push('/sellerProduct/addProduct/')}
                                    className='bg-brand-500 px-3 py-3 rounded-md'>
                                        <Plus className='text-sand-50' />
                                    </TouchableOpacity>
                                </>
                                }
                        </div>
                        )
                    }
                />
            </div>
        </SafeAreadiv>
    )
}

export default products