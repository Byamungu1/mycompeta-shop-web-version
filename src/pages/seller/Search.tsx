import { ArrowRight, ChevronRight, Clock, Search, ShoppingBag, Tag, X } from 'lucide-react';
import { useState } from 'react';
import { Pressable, Scrolldiv, TextInput, TouchableOpacity } from '@/components/common/ui';
import { SafeAreadiv } from '@/components/layout/SafeArea';

const search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock data tailored to your brand's style
  const [recentSearches, setRecentSearches] = useState([
    'Bicycle parts',
    'Cooking gas refilling',
    'Solar accessories',
  ]);

  const categories = [
    { id: '1', name: 'Electronics & Solar', count: 124, icon: <Tag size={16} className="text-brand-600" /> },
    { id: '2', name: 'Home & Kitchen', count: 85, icon: <ShoppingBag size={16} className="text-brand-600" /> },
    { id: '3', name: 'Transport & Logistics', count: 42, icon: <Tag size={16} className="text-brand-600" /> },
  ];

  const clearSearch = () => setSearchQuery('');

  const searchByCategory = ()=>{

  }

  return (
    <SafeAreadiv className="flex-1 bg-sand-100 pt-4">
      {/* Search Input Header */}
      <div className="px-4 sm:px-6 lg:px-8 pb-3 flex flex-row items-center w-full max-w-3xl mx-auto" style={{ gap: 10 }}>
        <div className="flex-1 flex-row items-center bg-sand-200 border border-sand-300 rounded-xl px-3 py-2" style={{ gap: 8 }}>
          <Search size={18} color="#78716c" /> {/* sand-500 matching color */}
          <TextInput
            className="flex-1 font-jakarta text-sm text-sand-900 p-0"
            placeholder="Search products, vendors, or orders..."
            placeholderTextColor="#a8a29e" // sand-400
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <X size={16} color="#78716c" />
            </TouchableOpacity>
          )}
        </div>
      </div>

      <Scrolldiv className="flex-1" showsVerticalScrollIndicator={false}>
        {searchQuery.length === 0 ? (
          <>
            {/* Recent Searches Section */}
            {recentSearches.length > 0 && (
              <div className="px-4 mt-4">
                <div className="flex-row justify-between items-center mb-2">
                  <p className="font-jakarta-bold text-xs text-sand-600 uppercase tracking-wider">Recent Searches</p>
                  <TouchableOpacity onPress={() => setRecentSearches([])}>
                    <p className="font-jakarta text-xs text-sand-500">Clear All</p>
                  </TouchableOpacity>
                </div>
                
                <div style={{ gap: 1 }}>
                  {recentSearches.map((item, index) => (
                    <Pressable 
                      key={index} 
                      onPress={() => setSearchQuery(item)}
                      className="flex-row items-center justify-between py-3 border-b border-sand-200"
                    >
                      <div className="flex-row items-center" style={{ gap: 10 }}>
                        <Clock size={16} color="#a8a29e" />
                        <p className="font-jakarta text-sm text-sand-800">{item}</p>
                      </div>
                      <ArrowRight size={14} color="#a8a29e" />
                    </Pressable>
                  ))}
                </div>
              </div>
            )}

            {/* Browse Categories Section */}
            <div className="px-4 mt-6">
              <p className="font-jakarta-bold text-xs text-sand-600 uppercase tracking-wider mb-3">Browse Categories</p>
              
              <div style={{ gap: 8 }}>
                {categories.map((category) => (
                  <TouchableOpacity 
                  onPress={searchByCategory}
                    key={category.id}
                    className="flex-row items-center justify-between p-3.5 bg-sand-200 rounded-xl border border-sand-300"
                  >
                    <div className="flex-row items-center" style={{ gap: 12 }}>
                      <div className="w-8 h-8 rounded-lg bg-sand-100 items-center justify-center">
                        {category.icon}
                      </div>
                      <div>
                        <p className="font-jakarta-bold text-sm text-sand-900">{category.name}</p>
                        <p className="font-jakarta text-[11px] text-sand-500">{category.count} items available</p>
                      </div>
                    </div>
                    <ChevronRight size={16} color="#78716c" />
                  </TouchableOpacity>
                ))}
              </div>
            </div>
          </>
        ) : (
          /* Active Search State / Results Preview */
          <div className="px-4 mt-4 items-center justify-center py-20">
            <p className="font-jakarta text-sm text-sand-500">
              Press enter to search for <p className="font-jakarta-bold text-sand-900">"{searchQuery}"</p>
            </p>
          </div>
        )}
      </Scrolldiv>
    </SafeAreadiv>
  );
};

export default search;