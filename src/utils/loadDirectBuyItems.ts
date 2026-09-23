import { CartItemType } from "@/interfaces/types/types";
import * as SecureStore from '@/utils/storage';

export const loadCheckoutItems = async (setItems: (validItems: CartItemType[]) => void) => {
    try {
        // 1. Try Direct Buy storage first
        const directBuyKey = (import.meta.env.VITE_DIRECT_BUY_STORAGE_KEY as string) || 'directBuyProduct';
        const storedDirectBuyData = await SecureStore.getItemAsync(directBuyKey);

        if (storedDirectBuyData) {
            const parsedObject = JSON.parse(storedDirectBuyData);
            const itemsArray = [{ ...parsedObject, directBuy: true }];

            const validItems = itemsArray.filter(
                (item) => item && Object.keys(item).length > 0
            );

            if (validItems.length > 0) {
                setItems(validItems);
                return; // Direct buy item loaded successfully
            }
        }

        // 2. Fall back to standard Cart Storage if direct buy is not present
        const cartKey = (import.meta.env.VITE_CART_STORAGE_KEY as string) || 'user_shopping_cart';
        const storedCartData = await SecureStore.getItemAsync(cartKey);

        if (storedCartData) {
            const parsedCartData = JSON.parse(storedCartData);

            if (Array.isArray(parsedCartData)) {
                // Map directBuy: false to every item in array
                const cartItems = parsedCartData.map(item => ({
                    ...item,
                    directBuy: false
                }));
                setItems(cartItems);
            } else if (typeof parsedCartData === 'object' && parsedCartData !== null) {
                // Single cart item object
                setItems([{ ...parsedCartData, directBuy: false }]);
            }
        }
    } catch (error) {
        console.error('Error loading checkout items:', error);
    }
}