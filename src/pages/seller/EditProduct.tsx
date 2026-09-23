import useDataInfo from '@/hooks/useDataInfo';
import { useFocusEffect, useLocalSearchParams, useRouter } from '@/router';
import {
    BadgeCent,
    FileText,
    Layers,
    Tag,
    Type
} from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Scrolldiv,
    TextInput,
    TouchableOpacity
} from '@/components/common/ui';
import { SafeAreadiv } from '@/components/layout/SafeArea';

import CustomPicker from '@/components/common/CustomPicker';
import Header from '@/components/layout/Header';
import { MultiimagesUpload } from '@/components/seller/multipleIMageSelector';
import ProductVariants from '@/components/seller/productVariants';
import { useCategories } from '@/context/categoryContext';
import { useToast } from '@/context/toastContext';
import { useFetch, useUpdate } from '@/hooks/useApi';
import { AddProductType } from '@/interfaces/interface';
import { fetchSellerProductDetails, updateSellerProduct } from '@/services/products';
import { calculateDiscountPercentage } from '@/utils/calculateDicountPercentage';
import formattedCategoryOptions from '@/utils/formatCategoris';
// ─── TypeScript Interface ───────────────────────────────────────────────────

export interface ProductType {
    name: string;
    price: number;
    discount: number;
    description: string;
    category: string;
    images: string[];
    features: string[];
    size: string;
    color: string;
    stock_quantity: number;
    sku: string;
}

// ─── Reusable Form Sub-Components ──────────────────────────────────────────

const FieldGroupLabel = ({ text }: { text: string }) => (
    <p className="font-jakarta-bold text-xs text-sand-500 tracking-widest mb-3 mt-6">
        {text}
    </p>
);

const SectionLabel = ({ text, icon: Icon }: { text: string; icon: React.ComponentType<any> }) => (
    <div className="flex flex-row items-center mb-3" style={{ gap: 6 }}>
        <Icon size={16} className="text-sand-600" />
        <p className="font-jakarta-semibold text-sm text-sand-800">{text}</p>
    </div>
);

const FormField = ({
    label,
    value,
    onChangeText,
    placeholder,
    icon: Icon,
    keyboardType = 'default',
    multiline = false
}: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    icon: React.ComponentType<any>;
    keyboardType?: 'default' | 'numeric';
    multiline?: boolean;
}) => (
    <div className="mb-4">
        <p className="font-jakarta-semibold text-sm text-sand-700 mb-1.5">{label}</p>
        <div
            className={`flex flex-row items-center bg-sand-200 rounded-xl px-4 ${multiline ? 'py-3 items-start' : 'h-12'
                }`}
            style={{ gap: 10 }}
        >
            <Icon size={18} className="text-sand-600 mt-0.5" />
            <TextInput
                className="flex-1 font-jakarta text-sm text-sand-900 h-full"
                placeholder={placeholder}
                placeholderTextColor="#A8A29E"
                value={value}
                onChangeText={onChangeText}
                keyboardType={keyboardType}
                multiline={multiline}
                textAlignVertical={multiline ? 'top' : 'center'}
            />
        </div>
    </div>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

const EditProductScreen = () => {
    const { id } = useLocalSearchParams();
    const productId = id as string;
    const router = useRouter();

    // API src Hook
    const { data, loading, error, refetch: fetchProductData } = useFetch<ProductType>(() => fetchSellerProductDetails(productId));
    const {categories, refreshCategories}=useCategories()

    // Form Local State Management
    const [form, setForm] = useState<AddProductType>({
        name: '',
        price: 0,
        discount: 0,
        description: '',
        category: '',
        image: [],
        features: [],
        variants: []
    });

    const { showError, showSuccess } = useToast()

    const { data: updateData, loading: updateLoading, error: updataeError, execute: executeUpdate }
        = useUpdate(() => updateSellerProduct(productId, form))

    useFocusEffect(
        useCallback(()=>{
            fetchProductData(null)
            refreshCategories()
        }, [])
    )

    const { dataInfo, setDataInfo, handleToggle } = useDataInfo(formattedCategoryOptions(categories))

    console.log('the editing data', data)
    // Hydrate form state once API payload resolves safely
    useEffect(() => {
        if (data) {
            setForm({
                name: data.name || '',
                price: data.price ? Number(data.price) : 0,
                discount: data.discount ? Number(data.discount) : 0,
                description: data.description || '',
                category: data.category || '',
                // Fallback map syntax checking both array variants patterns safely
                image: data.image || (data as any).images?.map((img: any) => img.image) || [],
                features: data.features || [],
                variants: data.variants || []
            });
        }
    }, [data]);

    const updateField = <K extends keyof AddProductType>(key: K, value: AddProductType[K]) => {
        setForm((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const liveDiscountPercentage = 
    calculateDiscountPercentage(form.price.toString(), form.discount.toString()) || 0

    console.log('🏷️ [Discount Calculation]:', {
        formPrice: form.price,
        formDiscount: form.discount,
        isDiscountValid: form.price > 0 && form.discount > 0 && form.discount < form.price,
        finalPercentage: liveDiscountPercentage
    });


    const handleSaveChanges = async () => {
        try {
            console.log('Submitting updated object payload state:', form);

            // Execute network request
            const result = await executeUpdate(productId, form);
            console.log('the result for update product', result)
            console.log('the result', result.data)
            if (!result.error) {
                showError(result.error)
            }
            showSuccess(result?.data?.message)
            router.back();
        } catch (err) {
            console.error('Failed processing product update execution context:', err);
        }
    };
     
    console.log('the editated product data', data)
    return (
        <SafeAreadiv className="flex-1 bg-sand-50 relative">
            {/* Nav Row Header Control */}
            <div className="px-4 sm:px-6 lg:px-8 pt-4 pb-2 w-full max-w-3xl mx-auto">
                <Header title="Edit Product" />
            </div>

            <Scrolldiv
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
            >
                <div className="mt-4">
                    <SectionLabel text="Product img Assets" icon={Layers} />
                    <div className="bg-white border border-sand-200 rounded-lg p-4">
                        <MultiimagesUpload 
                            images={form.image || []} 
                            setimages={(uris) => updateField('image', uris)} 
                        />
                    </div>
                </div>

                {/* SECTION 1: IDENTITY DETAILS */}
                <FieldGroupLabel text="Core Identity Specifications" />

                <FormField
                    label="Product Name"
                    value={form.name}
                    onChangeText={(text) => updateField('name', text)}
                    placeholder="Enter product title..."
                    icon={Type}
                />
                <div className='mb-4'>
                    <p className='font-jakarta-semibold text-sm text-sand-700 mb-1.5'>
                        Category
                    </p>
                    {dataInfo.map((item, index) => (
                        <CustomPicker options={item.options}
                            isOpen={item.isOpen}
                            onSelect={(selected) => updateField('category', selected)}
                            onToggle={() => handleToggle(index)}
                            setDataInfo={setDataInfo}
                        />
                    ))}
                </div>
                <FormField
                    label="Detailed Description"
                    value={form.description}
                    onChangeText={(text) => updateField('description', text)}
                    placeholder="Describe specific key details about this product line item..."
                    icon={FileText}
                    multiline={true}
                />

                {/* SECTION 2: PRICING MATRICES */}
                <FieldGroupLabel text="Financial Pricing Matrices" />

                <FormField
                    label="Standard Base Price (KES)"
                    value={form.price === 0 ? '' : form.price?.toString()}
                    onChangeText={(text) => updateField('price', Number(text) || 0)}
                    placeholder="0.00"
                    keyboardType="numeric"
                    icon={BadgeCent}
                />

                <FormField
                    label="Active Discount Target Deal Price (KES)"
                    value={form.discount === 0 ? '' : form.discount?.toString()}
                    onChangeText={(text) => updateField('discount', Number(text) || 0)}
                    placeholder="Leave 0 if no active markdown discount exists"
                    keyboardType="numeric"
                    icon={Tag}
                />

                {/* Live Math Discount Status Overlay Validation Block */}
                {liveDiscountPercentage > 0 && (
                    <div className="bg-info-500/10 border border-info-500 rounded-xl 
                    px-3 py-3 mb-2 flex flex-row items-center justify-between overflow-hidden">
                        <p className="font-jakarta-semibold text-sm text-info-700">Calculated Consumer markdown value:</p>
                        <p className="font-jakarta-bold text-xs text-info-600">{liveDiscountPercentage}% OFF Markdown</p>
                    </div>
                )}

                {/* SECTION 3: INVENTORY TRACKING */}
                <FieldGroupLabel text="Inventory & Structural Options" />

                <ProductVariants variants={form.variants} setForm={setForm} category={form.category}/>

            </Scrolldiv>

            {/* Bottom Actions Frame Layout Wrapper */}
            <div className="absolute bottom-4 left-4 right-4 flex flex-row bg-sand-50 pt-2" style={{ gap: 10 }}>
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => router.back()}
                    className="flex-1 bg-sand-200 border border-sand-300 rounded-lg py-3.5 items-center justify-center"
                >
                    <p className="font-jakarta-bold text-base text-sand-700">
                        Cancel Change
                    </p>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handleSaveChanges}
                    activeOpacity={0.85}
                    disabled={updateLoading}
                    className="flex-1 bg-brand-500 rounded-lg py-3.5 items-center justify-center "
                >
                    {!updateLoading ?<p className="font-jakarta-bold text-base text-sand-50">
                        Save Changes
                    </p>: <ActivityIndicator className='text-brand-600 w-5 h-5'></ActivityIndicator>}
                    
                </TouchableOpacity>
            </div>
        </SafeAreadiv>
    );
};

export default EditProductScreen;