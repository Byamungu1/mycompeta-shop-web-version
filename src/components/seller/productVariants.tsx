import { FieldLabel, InputField } from '@/pages/seller/AddProduct';
import { Variant } from '@/interfaces/interface';
import { Barcode, Info, Layers, Palette, Plus, Ruler, Trash2, X } from 'lucide-react';
import React, { useState } from 'react';
import { Modal, Pressable, TouchableOpacity } from '@/components/common/ui';

export type VariantField = 'size' | 'color' | 'stock_quantity' | 'sku';

interface ProductVariantsProps {
  variants: Variant[];
  setForm: React.Dispatch<React.SetStateAction<any>>;
  category?: string;
}

export const ProductVariants = ({ variants = [], setForm, category }: ProductVariantsProps) => {
  const [showInfoModal, setShowInfoModal] = useState(false);

  const isClothingCategory = category?.toLowerCase().includes('clothing') || category?.toLowerCase().includes('apparel');

  const updateVariants = (index: number, value: string, field: VariantField) => {
    setForm((prev: any) => {
      // 1. Shallow copy the variants array
      const updatedVariants = [...(prev.variants || [])];

      // 2. Format value based on field type
      const parsedValue =
        field === 'stock_quantity'
          ? value === ''
            ? 0
            : parseInt(value.replace(/[^0-9]/g, ''), 10) || 0
          : value;

      // 3. Immutably update the target variant object
      updatedVariants[index] = {
        ...updatedVariants[index],
        [field]: parsedValue,
      };

      return {
        ...prev,
        variants: updatedVariants,
      };
    });
  };

  const addVariant = () => {
    setForm((prev: any) => ({
      ...prev,
      variants: [
        ...(prev.variants || []),
        { size: '', color: '', stock_quantity: 0, sku: '' },
      ],
    }));
  };

  const removeVariant = (indexToRemove: number) => {
    setForm((prev: any) => ({
      ...prev,
      variants: prev.variants.filter((_: any, index: number) => index !== indexToRemove),
    }));
  };

  return (
    <div style={{ gap: 16 }}>
      {/* Header with title and info button */}
      <div className="flex-row items-center justify-between">
        <div className="flex-row items-center" style={{ gap: 6 }}>
          <p className="text-sm font-jakarta-bold text-sand-700">Product Variants</p>
          <TouchableOpacity
            onPress={() => setShowInfoModal(true)}
            hitSlop={8}
            className="bg-brand-100 rounded-full w-5 h-5 items-center justify-center"
          >
            <Info size={12} color="#7C6A4E" />
          </TouchableOpacity>
        </div>
      </div>

      {variants?.map((variant: Variant, index: number) => (
        <div key={index} style={{ gap: 12 }} className="p-2 bg-neutral-50 rounded-sm border border-neutral-200">
          {/* Header row with variant index & remove button */}
          <div className="flex-row justify-between items-center">
            <p className="text-xs font-jakarta-semibold text-neutral-500">
              Variant #{index + 1}
            </p>
            {variants.length > 1 && (
              <TouchableOpacity onPress={() => removeVariant(index)} hitSlop={8}>
                <Trash2 size={16} color="#EF4444" />
              </TouchableOpacity>
            )}
          </div>

          {/* Size & Color Fields */}
          <div className="flex-row" style={{ gap: 5 }}>
            <div className="flex-1">
              <FieldLabel icon={<Ruler size={14} color="#7C6A4E" />} text="Size / Dimension" required />
              <InputField
                value={variant.size}
                onChange={(v) => updateVariants(index, v, 'size')}
                placeholder="e.g. 38, 39, L, XL"
              />
            </div>
            <div className="flex-1">
              <FieldLabel icon={<Palette size={14} color="#7C6A4E" />} text="Color / Variant" />
              <InputField
                value={variant.color}
                onChange={(v) => updateVariants(index, v, 'color')}
                placeholder="e.g. Black, Blue"
              />
            </div>
          </div>

          {/* Stock & SKU Fields */}
          <div className="flex-row" style={{ gap: 3 }}>
            <div className="flex-1">
              <FieldLabel icon={<Layers size={14} color="#7C6A4E" />} text="Stock Quantity" required />
              <InputField
                value={variant.stock_quantity ? String(variant.stock_quantity) : ''}
                onChange={(v) => updateVariants(index, v, 'stock_quantity')}
                placeholder="0"
                keyboardType="numeric"
              />
            </div>
            <div className="flex-1">
              <FieldLabel icon={<Barcode size={14} color="#7C6A4E" />} text="SKU Code" />
              <InputField
                value={variant.sku}
                onChange={(v) => updateVariants(index, v, 'sku')}
                placeholder="e.g. NK-270-BLK"
              />
            </div>
          </div>
        </div>
      ))}

      {/* Add Variant Trigger */}
      <TouchableOpacity
        onPress={addVariant}
        className="flex flex-row items-center justify-center border border-dashed border-brand-300 rounded-md py-3"
        style={{ gap: 6 }}
      >
        <Plus size={14} color="#7C6A4E" />
        <p className="text-center text-brand-500 font-jakarta text-md">
          Add variant
        </p>
      </TouchableOpacity>

      {/* Info Modal */}
      <Modal
        visible={showInfoModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowInfoModal(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 items-center justify-center px-6"
          onPress={() => setShowInfoModal(false)}
        >
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-lg">
            {/* Modal Header */}
            <div className="flex-row items-center justify-between mb-4">
              <div className="flex-row items-center" style={{ gap: 8 }}>
                <div className="bg-brand-100 rounded-full w-8 h-8 items-center justify-center">
                  <Info size={16} color="#7C6A4E" />
                </div>
                <p className="text-base font-jakarta-bold text-sand-800">
                  Product Variants
                </p>
              </div>
              <TouchableOpacity onPress={() => setShowInfoModal(false)} hitSlop={8}>
                <X size={18} color="#64748B" />
              </TouchableOpacity>
            </div>

            {/* Modal Content */}
            <div style={{ gap: 12 }}>
              <p className="text-sm font-jakarta text-sand-700 leading-relaxed">
                Product variants allow you to offer different sizes, colors, and stock levels for the same product.
              </p>

              {isClothingCategory ? (
                <>
                  <div className="bg-brand-50 border border-brand-200 rounded-lg p-3">
                    <p className="text-xs font-jakarta-semibold text-brand-700 mb-1">
                      Required for:
                    </p>
                    <p className="text-sm font-jakarta text-brand-800">
                      Clothing & Apparel
                    </p>
                  </div>

                  <p className="text-sm font-jakarta text-sand-600 leading-relaxed">
                    For clothing items, add variants for different sizes (S, M, L, XL) and colors to help customers find their perfect fit.
                  </p>

                  <div className="bg-sand-50 border border-sand-200 rounded-lg p-3">
                    <p className="text-xs font-jakarta-semibold text-sand-700 mb-1">
                      Example:
                    </p>
                    <p className="text-sm font-jakarta text-sand-600">
                      • Size: M, Color: Black, Stock: 10
                    </p>
                    <p className="text-sm font-jakarta text-sand-600">
                      • Size: L, Color: Blue, Stock: 5
                    </p>
                  </div>
                </>
              ) : (
                <div className="bg-sand-50 border border-sand-200 rounded-lg p-3">
                  <p className="text-xs font-jakarta-semibold text-sand-700 mb-1">
                    Optional:
                  </p>
                  <p className="text-sm font-jakarta text-sand-600">
                    Variants are optional for this category but can help you manage different product versions.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <TouchableOpacity
              onPress={() => setShowInfoModal(false)}
              className="bg-brand-500 rounded-lg py-3 mt-5 items-center"
            >
              <p className="text-sm font-jakarta-bold text-white">
                Got it
              </p>
            </TouchableOpacity>
          </div>
        </Pressable>
      </Modal>
    </div>
  );
};

export default ProductVariants;