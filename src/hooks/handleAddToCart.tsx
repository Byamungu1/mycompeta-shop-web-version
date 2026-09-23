import { useToast } from "@/context/toastContext";
import { ProductType, SellerConflict, Variant } from "@/interfaces/interface";
import { addToCart, clearCart } from "@/services/cart";
import { Dispatch, SetStateAction } from "react";

interface handleCartProps {
    product: ProductType | null;
    refetchCart: () => Promise<void>;
    setIsSizeModalOpen: Dispatch<SetStateAction<boolean>>;
    setPendingAddItem: Dispatch<SetStateAction<ProductType | null>>;
    variant?: Variant;
    setSellerConflict: Dispatch<SetStateAction<SellerConflict | null>>;
    shouldShowSizeModal?: boolean
}

export const useHandleAddToCart = (): {
    handleAddToCart: (
        product: ProductType | null,
        refetchCart: () => Promise<void>,
        setIsSizeModalOpen: Dispatch<SetStateAction<boolean>>,
        setPendingAddItem: Dispatch<SetStateAction<ProductType | null>>,
        setSellerConflict: Dispatch<SetStateAction<SellerConflict | null>>,
        shouldShowSizeModal?: boolean,
        variant?: Variant) => void,

    handleConflictResolution: (
        shouldClearCart: boolean,
        pendingAddItem: ProductType | null,
        refetchCart: ()=>Promise<void>,
        setPendingAddItem: Dispatch<SetStateAction<ProductType | null>>,
        setSellerConflict: Dispatch<SetStateAction<SellerConflict | null>>) => void
} => {

    const { showError, showSuccess } = useToast()

    const handleAddToCart = async (
        product: ProductType | null,
        refetchCart: () => Promise<void>,
        setIsSizeModalOpen: Dispatch<SetStateAction<boolean>>,
        setPendingAddItem: Dispatch<SetStateAction<ProductType | null>>,
        setSellerConflict: Dispatch<SetStateAction<SellerConflict | null>>,
        shouldShowSizeModal?: boolean,
        variant?: Variant,) => {

        // For non-Clothing categories, add directly to cart without any modal
        if ((product?.category || product?.category_name) !== "Clothing & Apparel") {
            const payload = product; // No variant needed for non-clothing items
            const result = await addToCart(payload);
            
            console.log('the use handle product is')
            if (!result.success) {
                if (result.conflict) {
                    setSellerConflict(result.conflict);
                    setPendingAddItem(payload);
                    return;
                }
                showError('Unable to add to cart');
                return;
            }
            
            console.log('it was successfull')
            showSuccess('Cart updated successfully!');
            await refetchCart();
            return;
        }

        console.log('the product is not clothing')

        // For Clothing & Apparel, variant selection is always required
        console.log('should show size modal', shouldShowSizeModal)
        
        if (shouldShowSizeModal) {
                setIsSizeModalOpen(true);
                console.log('returning early')
                return;
       
        }

        // Add with variant for Clothing & Apparel
        const payload = { ...product, variant: { size: variant?.size, color: variant?.color, variantId: variant?.variantId } };
        const result = await addToCart(payload);

        if (!result.success) {
            if (result.conflict) {
                setSellerConflict(result.conflict);
                setPendingAddItem(payload);
                return;
            }
            showError('Unable to add to cart');
            return;
        }

        if (shouldShowSizeModal) setIsSizeModalOpen(false);

        showSuccess('Cart updated successfully!');
        await refetchCart();
    };

    const handleConflictResolution = async (
        shouldClearCart: boolean,
        pendingAddItem: ProductType | null,
        refetchCart: ()=>Promise<void>,
        setPendingAddItem: Dispatch<SetStateAction<ProductType | null>>,
        setSellerConflict: Dispatch<SetStateAction<SellerConflict | null>>
    ): Promise<{ message: string, success: boolean | null }> => {

        if (shouldClearCart && pendingAddItem) {
            const clearResult = await clearCart();
            if (clearResult.success) {
                const addResult = await addToCart(pendingAddItem);
                if (addResult.success) {
                    setSellerConflict(null);
                    setPendingAddItem(null);
                    await refetchCart();
                    return { message: 'Cart cleared and item added successfully!', success: true };
                } else {
                    return { message: 'Failed to add item after clearing cart', success: false };
                }
            } else {
                return { message: 'Failed to clear cart', success: false };
            }
        }
        setSellerConflict(null);
        setPendingAddItem(null);
        return { message: '', success: null }
    };

    return { handleAddToCart, handleConflictResolution }

}




