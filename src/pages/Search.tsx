import Header from '@/components/layout/Header'
import { CartIcon } from '@/components/layout/NotificationIcon'
import { ProductCard } from '@/components/product/ProductCard'
import SearchInput from '@/components/common/SearchInput'
import { useGlobalCounts } from '@/context/globalCountContext'
import { usePost } from '@/hooks/useApi'
import { SearchResponse } from '@/interfaces/interface'
import { searchProducts } from '@/services/search'
import { router, useLocalSearchParams } from '@/router'
import { Search } from 'lucide-react'
import { useState } from 'react'
import { ActivityIndicator, FlatList, Keyboard } from '@/components/common/ui'
import { SafeAreadiv } from '@/components/layout/SafeArea'

const search = () => {
    const { query: initialQuery } = useLocalSearchParams();
    const { refetchCart } = useGlobalCounts();

    const [searchQuery, setSearchQuery] = useState(initialQuery as string || '')
    const [searchPressed, setSearchPressed] = useState(false)
    const { data: products, loading: loadingProducts, error: searchError, execute: refetchProducts } =
        usePost<SearchResponse>(() => searchProducts(searchQuery))

    const handleSearchProducts = () => {
        if (!searchQuery?.trim()) {
            return
        }
        Keyboard.dismiss();
        setSearchPressed(true)
        refetchProducts(searchQuery)
    }

    const hasResults = (products?.results?.length ?? 0) > 0;

    console.log('the searched products', products?.results)

    return (
        <SafeAreadiv className="bg-sand-50">
            <div className="w-full h-full px-4 md:px-6 lg:px-8 py-4" >
                <div className='flex-row justify-between'>
                    <Header title="Search" subtitle='search for the products' />
                    <CartIcon onPress={() => router.push('/cart')} />
                </div>
                <div className='mt-5 max-w-3xl'>
                    <SearchInput value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Search for products, and more" focus={true} search={() => handleSearchProducts()} />
                </div>

                {/* Results count summary */}
                {searchPressed && !loadingProducts && !searchError && (
                    <p className='font-jakarta text-sm text-sand-500 mt-4 mb-4'>
                        {hasResults
                            ? `${products?.results?.length} result${products?.results?.length === 1 ? '' : 's'} for "${searchQuery}"`
                            : `No results for "${searchQuery}"`}
                    </p>
                )}

                {/* Initial prompt (before any search executed) */}
                {!searchPressed && !loadingProducts && (
                    <div className='flex flex-1 justify-center items-center' style={{ gap: 8 }}>
                        <Search size={70} className='text-brand-900' />
                        <p className='font-jakarta-bold text-sand-700'>Search for products</p>
                        <p className='font-jakarta text-sm text-sand-400 text-center px-10'>
                            Type something above and hit search to get started.
                        </p>
                    </div>
                )}

                {/* Loading state */}
                {loadingProducts && (
                      <div className='flex-1 justify-center items-center mt-20'>
                        <ActivityIndicator size="large" color="#F59E0B" />
                    </div>
                )}

                {/* Error state */}
                {searchPressed && searchError && !loadingProducts && (
                    <div className='flex flex-1 justify-center items-center' style={{ gap: 8 }}>
                        <Search size={70} className='text-brand-900' />
                        <p className='font-jakarta-bold text-sand-700'>Something went wrong</p>
                        <p className='font-jakarta text-sm text-sand-400 text-center px-10'>
                            We couldn't complete your search. Please try again.
                        </p>
                    </div>
                )}

                {/* Empty state (searched, executed, but no results) */}
                {searchPressed && !hasResults && !loadingProducts && !searchError && (
                    <div className='flex flex-1 justify-center items-center' style={{ gap: 8 }}>
                        <Search size={70} className='text-brand-900' />
                        <p className='font-jakarta-bold text-sand-700'>No products found</p>
                        <p className='font-jakarta text-sm text-sand-400 text-center px-10'>
                            Try a different search term.
                        </p>
                    </div>
                )}

                {/* Results */}
                {searchPressed && hasResults && !loadingProducts && !searchError && (
                    <FlatList
                        data={products?.results}
                        renderItem={(item) => (
                            <ProductCard 
                            searched={true} 
                            item={item.item} 
                            onPress={() => router.push(`/product/${item.item?.id}`)} 
                            refetchCart={refetchCart} 
                            />
                        )}
                        numColumns={2}
                        keyExtractor={(item) => item.objectID?.toString()}
                        showsVerticalScrollIndicator={false}
                        bounces={false}
                        contentContainerStyle={{ gap: 10, paddingBottom: 140 }}
                        columnWrapperStyle={{ gap: 10 }}
                    />
                )}
            </div>
        </SafeAreadiv>
    )
}

export default search