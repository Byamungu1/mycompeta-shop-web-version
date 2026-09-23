import { CART_STORAGE_KEY } from "@/pages/Cart";
import { ProductType, SellerConflict } from "@/interfaces/interface";
import { router } from '@/router';
import * as SecureStore from '@/utils/storage';

export const addToCart = async (newItem: ProductType | null) => {
        try {
            // 1. Fetch the existing cart from secure storage
            const existingCartRaw = await SecureStore.getItemAsync(CART_STORAGE_KEY);

            let currentCart = [];

            if (existingCartRaw) {
                // Parse the string back into an array
                currentCart = JSON.parse(existingCartRaw);
            }

            // 2. Check for seller conflict if cart is not empty
            if (currentCart.length > 0) {
                const firstItemSellerId = currentCart[0]?.seller?.id || currentCart[0]?.seller_id;
                const newSellerId = newItem?.seller?.id || newItem.seller_id;

                console.log('the first item seller id', firstItemSellerId)
                console.log('the new item seller id', newSellerId)
                //console.log('new item', newItem)

                if (firstItemSellerId && newSellerId && firstItemSellerId !== newSellerId) {
                    // Seller conflict detected
                    const conflict: SellerConflict = {
                        currentSellerId: firstItemSellerId,
                        currentSellerName: currentCart[0].seller?.shop_name ||currentCart[0].seller_shop_name || 'Current Seller',
                        conflictingItems: currentCart
                    };
                    return { success: false, conflict };
                } else if (!firstItemSellerId && newSellerId) {
                    // If cart has items without seller_id, set the seller_id to the new item's seller
                    currentCart.forEach(item => item.seller?.id ? item.seller.id = newSellerId 
                        : item.seller_id = newSellerId);
                }
            }

            // 3. Check if the item already exists in the cart to update quantity, or append it
            console.log('the new item id', newItem.id)
            const existingItemIndex: number = currentCart.findIndex((item: ProductType) => item.id === newItem.id || newItem.seller_id);

            if (existingItemIndex > -1) {
                // Item exists, increment its quantity (or handle updates as needed)
                currentCart[existingItemIndex].quantity += newItem.quantity || 1;
            } else {
                // New item, add it to the array
                currentCart.push({ ...newItem, quantity: newItem.quantity || 1 });
            }

            // 4. Save the updated cart back to Secure Store
            await SecureStore.setItemAsync(CART_STORAGE_KEY, JSON.stringify(currentCart));

            console.log('Cart updated successfully!');
            return { success: true }; // Useful if you need to update local component state

        } catch (error:any) {
            console.error("Error adding item to secure storage cart:", error);
            return { success: false, error: error.message }
        }
    };

export const clearCart = async () => {
    try {
        await SecureStore.deleteItemAsync(CART_STORAGE_KEY);
        console.log('Cart cleared successfully!');
        return { success: true };
    } catch (error: any) {
        console.error("Error clearing cart:", error);
        return { success: false, error: error.message };
    }
};



export const directBuy = async (newItem: ProductType) => {
  try {
    // 1. Format the single product item with quantity
    const directBuyData = {
      ...newItem,
      quantity: newItem.quantity || 1,
    };

    // 2. Save/Overwrite the single product payload in SecureStore
    await SecureStore.setItemAsync(
      (import.meta.env.VITE_DIRECT_BUY_STORAGE_KEY as string) || 'directBuyProduct',
      JSON.stringify(directBuyData)
    );

    console.log('Direct buy product set successfully!');

    // 3. Navigate directly to checkout screen with direct buy mode flag
    router.push({
      pathname: '/checkout',
      params: { mode: 'direct' },
    });

    return true;
  } catch (error: any) {
    console.error('Error handling direct buy in secure storage:', error);
    return false;
  }
};