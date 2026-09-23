import CustomPicker from '@/components/common/CustomPicker';
import Header from '@/components/layout/Header';
import { useToast } from '@/context/toastContext';
import { usePost } from '@/hooks/useApi';
import useDataInfo from '@/hooks/useDataInfo';
import useKeyboardActive from '@/hooks/useKeyboardActive';
import { addProduct } from '@/services/products';
import { calculateDiscountPercentage } from '@/utils/calculateDicountPercentage';

import { MultiimagesUpload } from '@/components/seller/multipleIMageSelector';
import ProductVariants from '@/components/seller/productVariants';
import { useCategories } from '@/context/categoryContext';
import { AddProductType } from '@/interfaces/interface';
import formattedCategoryOptions from '@/utils/formatCategoris';
import { router, useFocusEffect } from '@/router';
import {
    ArrowLeft,
    ArrowRight,
    ChartBarStacked,
    Check,
    DollarSign,
    FileText,
    Percent,
    Plus,
    Tag,
    X,
    Zap
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    KeyboardTypeOptions,
    TextInput,
    TouchableOpacity
} from '@/components/common/ui';
import { KeyboardAwareScrolldiv } from '@/components/layout/KeyboardAwareScrollView';
import { SafeAreadiv } from '@/components/layout/SafeArea';


// ─── Helper Functions ─────────────────────────────────────────────────────────
const formatCurrency = (value: number | string) => {
  if (!value) return "0";
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// ─── Sub-components ───────────────────────────────────────────────────────────
export const FieldLabel = ({ icon, text, required = false }: {
  icon: React.ReactNode;
  text: string;
  required?: boolean;
}) => (
  <div className='flex flex-row items-center mb-2' style={{ gap: 6 }}>
    {icon}
    <p className='font-jakarta-semibold text-sm text-sand-700'>{text}</p>
    {required && <p className='text-brand-500 font-jakarta-bold text-sm'>*</p>}
  </div>
);

export const InputField = ({
  value,
  onChange,
  placeholder,
  keyboardType = 'default',
  multiline = false,
  rows = 1,
  prefix,
}: {
  value: any;
  onChange: (v: string) => void;
  placeholder: string;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
  rows?: number;
  prefix?: string;
}) => (
  <div
    className='flex flex-row bg-white border border-sand-200 rounded-sm'
    style={{
      minHeight: multiline ? rows * 36 : 48,
      alignItems: multiline ? 'flex-start' : 'center',
    }}
  >
    {prefix && (
      <div
        className='px-3 justify-center border-r border-sand-200 bg-sand-100'
        style={{ height: '100%', minHeight: 48 }}
      >
        <p className='font-jakarta-bold text-sm text-brand-500'>{prefix}</p>
      </div>
    )}
    <TextInput
      value={value ? value.toString() : ''}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor='#94A3B8'
      keyboardType={keyboardType}
      multiline={multiline}
      numberOfLines={multiline ? rows : 1}
      textAlignVertical={multiline ? 'top' : 'center'}
      className='flex-1 px-3 py-2.5 font-jakarta text-sm text-sand-800'
      style={multiline ? { textAlignVertical: 'top', paddingTop: 10 } : undefined}
    />
  </div>
);

// ─── Step Progress Indicator ──────────────────────────────────────────────────
const StepIndicator = ({ step }: { step: 1 | 2 }) => (
  <div className='flex flex-row items-center px-4 pb-3' style={{ gap: 8 }}>
    <div className='flex flex-row items-center' style={{ gap: 6 }}>
      <div className={`w-6 h-6 rounded-full items-center justify-center ${step >= 1 ? 'bg-brand-500' : 'bg-sand-200'}`}>
        {step > 1 ? <Check size={12} color='white' /> : <p className='font-jakarta-bold text-xs text-white'>1</p>}
      </div>
      <p className={`font-jakarta-semibold text-xs ${step === 1 ? 'text-brand-600' : 'text-sand-400'}`}>Basics</p>
    </div>
    <div className='flex-1 h-[2px] bg-sand-200' />
    <div className='flex flex-row items-center' style={{ gap: 6 }}>
      <div className={`w-6 h-6 rounded-full items-center justify-center ${step >= 2 ? 'bg-brand-500' : 'bg-sand-200'}`}>
        <p className={`font-jakarta-bold text-xs ${step >= 2 ? 'text-white' : 'text-sand-500'}`}>2</p>
      </div>
      <p className={`font-jakarta-semibold text-xs ${step === 2 ? 'text-brand-600' : 'text-sand-400'}`}>Details</p>
    </div>
  </div>
);


// ─── Main Screen ──────────────────────────────────────────────────────────────
const AddProduct = () => {
  const { showSuccess, showError } = useToast();
  const [step, setStep] = useState<1 | 2>(1);

  const [form, setForm] = useState<AddProductType>({
    name: '',
    price: 0,
    discount: 0,
    description: '',
    category: 'Clothing & Apparel',
    image: [],
    features: [],
    variants: [],
  });

  const { categories, refreshCategories } = useCategories();
  const { isKeyboardActive } = useKeyboardActive();

  const { loading: addProductLoading, error: addProductError, execute: addProductExecute } = usePost<AddProductType>(() => addProduct(form));

  useFocusEffect(
    useCallback(() => {
      refreshCategories();
    }, [])
  );

  const { dataInfo, setDataInfo, handleToggle } = useDataInfo(formattedCategoryOptions(categories));

  const scrollRef = useRef<KeyboardAwareScrolldiv>(null);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      scrollRef.current?.scrollToEnd(true);
    }, 50);
    return () => clearTimeout(timeoutId);
  }, [form.features.length]);

  const updateField = (field: keyof AddProductType, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const updateFeature = (index: number, value: string) => {
    const updated = [...form.features];
    updated[index] = value;
    setForm(prev => ({ ...prev, features: updated }));
  };

  const addFeature = () => {
    setForm(prev => ({ ...prev, features: [...prev.features, ''] }));
  };

  const removeFeature = (index: number) => {
    const updated = form.features.filter((_, i) => i !== index);
    setForm(prev => ({ ...prev, features: updated }));
  };

  const discountedPrice = calculateDiscountPercentage(form.price.toString(), form.discount.toString());

  const canProceedToDetails = form.name.trim().length > 0 && form.category.trim().length > 0;

  const canSaveProduct = form.description.trim().length > 0 &&
                        form.price > 0 &&
                        form.image.length > 0;

  const handleAddProduct = async () => {
    console.log('🎯 handleAddProduct called');
    console.log('📋 Form data being sent:', JSON.stringify(form, null, 2));
    console.log('🔒 Button disabled?', addProductLoading || !canSaveProduct);

    const result = await addProductExecute(form);

    console.log('📊 Result from API:', result);

    if (!result.success) {
      // Show the actual error message from the result
      const errorMessage = typeof result.error === 'string' ? result.error : 'Failed to add product';
      console.error('❌ UI Display Error:', result.error);
      showError(errorMessage);
    } else {
      console.log('✅ Product added successfully');
      showSuccess("Product added successfully!");
      // Optionally navigate back or reset form
      router.back();
    }
  };

  return (
    <SafeAreadiv className='flex-1 bg-sand-50' edges={['top', 'left', 'right']}>
      {/* ── Fixed Header ── */}
      <div className='bg-white border-b border-sand-200 z-10'>
        <div className='flex flex-row items-center px-4 sm:px-6 lg:px-8 pt-4 pb-2 w-full max-w-3xl mx-auto'>
          <Header
            title={step === 1 ? "Add Product" : form.name || "Product Details"}
            subtitle={step === 1 ? "Start with the basics" : "Fill in the rest"}
          />
        </div>
        <StepIndicator step={step} />
      </div>

      {/* ── STEP 1: Basics ── */}
      {step === 1 && (
        <KeyboardAwareScrolldiv
          className='flex-1'
          contentContainerStyle={{ gap: 15, padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          enableOnAndroid={true}
        >
          <div>
            <FieldLabel icon={<Tag size={14} color='#7C6A4E' />} text='Product Name' required />
            <InputField
              value={form.name}
              onChange={v => updateField('name', v)}
              placeholder='e.g. Nike Air Max 270'
            />
          </div>

          <div>
            <FieldLabel icon={<ChartBarStacked size={14} color='#7C6A4E' />} text='Category' required />
            {!isKeyboardActive && dataInfo.map((item, index) => (
              <CustomPicker
                key={index}
                options={item.options}
                isOpen={item.isOpen}
                onToggle={() => handleToggle(index)}
                onSelect={(selectedOption: string) => updateField('category', selectedOption)}
                setDataInfo={setDataInfo}
              />
            ))}
          </div>
        </KeyboardAwareScrolldiv>
      )}

      {/* ── STEP 2: Details ── */}
      {step === 2 && (
        <KeyboardAwareScrolldiv
          ref={scrollRef}
          className='flex-1'
          contentContainerStyle={{ gap: 15, padding: 16, paddingBottom: 160 }}
          showsVerticalScrollIndicator={false}
          enableOnAndroid={true}
          enableAutomaticScroll={true}
          extraScrollHeight={140}
          keyboardShouldPersistTaps='handled'
        >
          <MultiimagesUpload 
            images={form.image || []}
            setimages={(uris: string[]) => updateField('image', uris)}
          />

          <div className='flex gap-3'>
            <div className='flex-1'>
              <FieldLabel icon={<DollarSign size={14} color='#7C6A4E' />} text='Price' required />
              <InputField
                value={form.price}
                onChange={v => updateField('price', v)}
                placeholder='0'
                keyboardType='decimal-pad'
                prefix='KES'
              />
            </div>
            <div className='flex-1'>
              <FieldLabel icon={<Percent size={14} color='#7C6A4E' />} text='Discount' />
              <InputField
                value={form.discount}
                onChange={v => updateField('discount', v)}
                placeholder='0'
                keyboardType='decimal-pad'
                prefix='%'
              />
            </div>
          </div>

          {discountedPrice && (
            <div className='flex flex-row items-center bg-brand-100 border border-brand-200 rounded-sm px-3 py-2' style={{ gap: 6 }}>
              <Percent size={13} color='#7C6A4E' />
              <p className='font-jakarta text-xs text-sand-700'>
                Customers pay{' '}
                <span className='font-jakarta-bold text-brand-600'>
                  KES {formatCurrency(discountedPrice)}
                </span>
                {' '}after {form.discount}% off
              </p>
            </div>
          )}

          <div>
            <FieldLabel icon={<FileText size={14} color='#7C6A4E' />} text='Description' required />
            <InputField
              value={form.description}
              onChange={v => updateField('description', v)}
              placeholder='Describe your product...'
              multiline={true}
              rows={4}
            />
            <p className='font-jakarta text-xs text-sand-400 mt-1.5 text-right'>
              {form.description.length} characters
            </p>
          </div>

          <ProductVariants variants={form.variants} setForm={setForm} category={form.category} />

          <div>
            <FieldLabel icon={<Zap size={14} color='#7C6A4E' />} text='Key Features' />
            <div style={{ gap: 8 }}>
              {form.features.map((feature, index) => (
                <div key={index} className='flex flex-row items-center bg-white border border-sand-200 rounded-sm' style={{ height: 48 }}>
                  <div className='w-9 h-full items-center justify-center border-r border-sand-200 bg-sand-100'>
                    <p className='font-jakarta-bold text-xs text-brand-500'>{index + 1}</p>
                  </div>
                  <TextInput
                    value={feature}
                    onChangeText={v => updateFeature(index, v)}
                    placeholder={`Feature ${index + 1}`}
                    placeholderTextColor='#94A3B8'
                    className='flex-1 px-3 font-jakarta text-sm text-sand-800'
                  />
                  {form.features.length > 1 && (
                    <TouchableOpacity
                      onPress={() => removeFeature(index)}
                      activeOpacity={0.7}
                      className='w-10 h-full items-center justify-center'>
                      <X size={14} color='#94A3B8' />
                    </TouchableOpacity>
                  )}
                </div>
              ))}

              <TouchableOpacity
                onPress={addFeature}
                activeOpacity={0.7}
                className='flex flex-row items-center justify-center border border-dashed border-brand-300 rounded-sm py-3'
                style={{ gap: 6 }}>
                <Plus size={14} color='#7C6A4E' />
                <p className='font-jakarta-semibold text-xs text-brand-500'>Add another feature</p>
              </TouchableOpacity>
            </div>
          </div>
        </KeyboardAwareScrolldiv>
      )}

      {/* ── Fixed Bottom Actions Bar ── */}
      <div className='bg-sand-50 border-t border-sand-200 px-4 pt-3 pb-6'>
        {step === 1 ? (
          <div className='flex flex-row' style={{ gap: 10 }}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.back()}
              className='flex-1 flex flex-row items-center justify-center border border-sand-300 bg-white rounded-sm py-3.5'
              style={{ gap: 6 }}>
              <X size={15} color='#64748B' />
              <p className='font-jakarta-bold text-sm text-sand-600'>Discard</p>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setStep(2)}
              disabled={!canProceedToDetails}
              className={`flex flex-row items-center justify-center 
                ${canProceedToDetails ? 'bg-brand-500' : 'bg-brand-200'} rounded-sm py-3.5 px-8`}
              style={{ gap: 6, flex: 2 }}>
              <p className='font-jakarta-bold text-sm text-white'>Next</p>
              <ArrowRight size={15} color='white' />
            </TouchableOpacity>
          </div>
        ) : (
          <div className='flex flex-row' style={{ gap: 10 }}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setStep(1)}
              className='flex flex-row items-center justify-center border border-sand-300 bg-white rounded-sm py-3.5 px-5'
              style={{ gap: 6 }}>
              <ArrowLeft size={15} color='#64748B' />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleAddProduct}
              disabled={addProductLoading || !canSaveProduct}
              className={`flex flex-row items-center justify-center 
                ${addProductLoading || !canSaveProduct ? 'bg-brand-200' : 'bg-brand-500'} rounded-sm py-3.5 px-8`}
              style={{ gap: 6, flex: 1 }}>
              {!addProductLoading ? (
                <>
                  <Plus size={15} color='white' />
                  <p className='font-jakarta-bold text-sm text-white'>Save Product</p>
                </>
              ) : (
                <ActivityIndicator color="white" />
              )}
            </TouchableOpacity>
          </div>
        )}
      </div>
    </SafeAreadiv>
  );
};

export default AddProduct;