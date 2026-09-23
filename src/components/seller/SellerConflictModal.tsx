import { ProductType, SellerConflict } from '@/interfaces/interface';
import { X } from 'lucide-react';
import { Dispatch, SetStateAction } from 'react';
import { Modal, Scrolldiv, TouchableOpacity } from '@/components/common/ui';

interface SellerConflictModalProps {
  visible: boolean;
  conflict: SellerConflict | null;
  pendingAddItem: ProductType | null;
  refetchCart: ()=>Promise<void>;
  onResolve: (
    shouldClearCart: boolean,
    pendingAddItem: ProductType | null,
    refetchCart: ()=>Promise<void>,
    setPendingAddItem: Dispatch<SetStateAction<ProductType | null>>,
    setSellerConflict: Dispatch<SetStateAction<SellerConflict | null>>) => void;
  onClose: () => void;
  setPendingAddItem: Dispatch<SetStateAction<ProductType | null>>
  setSellerConflict: Dispatch<SetStateAction<SellerConflict | null>>;
}

export default function SellerConflictModal({
  visible,
  conflict,
  onResolve,
  onClose,
  setPendingAddItem,
  setSellerConflict,
  refetchCart,
  pendingAddItem,
}: SellerConflictModalProps) {
  if (!conflict) return null;

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
                Clear Cart to Continue
              </p>
              <p numberOfLines={2} className="font-jakarta text-xs text-sand-500 mt-1">
                You can only add items from one seller at a time
              </p>
            </div>
            <TouchableOpacity onPress={onClose} className="p-1 rounded-full bg-sand-200">
              <X size={18} className="text-sand-700" />
            </TouchableOpacity>
          </div>

          <Scrolldiv showsVerticalScrollIndicator={false} className="my-4">
            {/* Current Cart Items */}
            <div className="mb-4">
              <p className="font-jakarta-bold text-xs uppercase tracking-wider text-sand-500 mb-2">
                Current Cart Items ({conflict.conflictingItems.length})
              </p>
              <p className="font-jakarta text-xs text-sand-600 mb-3">
                From: {conflict.currentSellerName}
              </p>

              {conflict.conflictingItems.map((item, index) => (
                <div
                  key={index}
                  className="bg-sand-100 rounded-xl p-3 mb-2 flex flex-row items-center border border-sand-200"
                  style={{ gap: 12 }}
                >
                  {/* Product img */}
                  <img
                    src={
                      item.imgs?.[0]?.img
                        ? item.imgs[0].img
                        : item.img_urls
                          ? item.img_urls
                          : require('../../assets/imgs/trending.jpg')
                    }
                    className="w-12 h-12 rounded-lg"
                    resizeMode="cover"
                  />

                  {/* Product Details */}
                  <div className="flex-1">
                    <p className="font-jakarta-semibold text-sm text-sand-900" numberOfLines={1}>
                      {item.name}
                    </p>
                    <p className="font-jakarta text-xs text-sand-500">
                      Qty: {item.quantity || 1}
                    </p>
                    <p className="font-jakarta text-xs text-brand-600 font-semibold">
                      KES {item.price}
                    </p>
                  </div>

                </div>
              ))}
            </div>

            {/* New Item */}
            <div className="bg-brand-50 rounded-xl p-3 border border-brand-200">
              <p className="font-jakarta-bold text-xs text-brand-700 mb-2">
                New Item to Add
              </p>
              <p className="font-jakarta text-sm text-brand-900">
                This will clear your current cart to add items from a different seller.
              </p>
            </div>
          </Scrolldiv>

          {/* Action Buttons */}
          <div className="flex flex-row gap-3 pt-2">
            <TouchableOpacity
              onPress={() => onResolve(
                false,
                pendingAddItem,
                refetchCart,
                setPendingAddItem,
                setSellerConflict)}
              className="flex-1 py-3 rounded-xl items-center justify-center bg-sand-200 border border-sand-300"
            >
              <p className="font-jakarta-bold text-sm text-sand-700 text-xs">
                Keep Current Cart
              </p>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onResolve(
                true,
                pendingAddItem,
                refetchCart,
                setPendingAddItem,
                setSellerConflict)}
              className="flex-1 py-3 rounded-xl items-center justify-center bg-red-500"
            >
              <p className="font-jakarta-bold text-sm text-white text-xs">
                Clear & Add New Item
              </p>
            </TouchableOpacity>
          </div>
        </div>
      </div>
    </Modal>
  );
}
