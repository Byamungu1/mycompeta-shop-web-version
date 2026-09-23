import { CART_STORAGE_KEY } from '@/pages/Cart'
import { ProductType } from '@/interfaces/interface'
import * as SecureStorage from '@/utils/storage'
import { Trash2 } from 'lucide-react'
import { TouchableOpacity } from '@/components/common/ui'

interface CartItemProps {
    item: ProductType & { quantity: number };
    setCartItems: React.Dispatch<React.SetStateAction<ProductType>>;
}

const CartItem = ({item: cart, setCartItems}: CartItemProps) => {
    
    const removeFromCart = async (productId: string | number) => {
        try {
            // 1. Fetch the current cart list
            const existingCartRaw = await SecureStorage.getItemAsync(CART_STORAGE_KEY);
            
            if (!existingCartRaw) return; // Nothing to delete if the cart is already empty
    
            const currentCart = JSON.parse(existingCartRaw);
    
            // 2. Filter out the specific product object using its unique id
            const updatedCart = currentCart.filter((item: ProductType) => item.id !== productId);
    
            // 3. Save the new array back to Secure Store
            await SecureStorage.setItemAsync(CART_STORAGE_KEY, JSON.stringify(updatedCart));
            console.log(`Product with ID ${productId} removed successfully.`);
    
            // 4. Update the local UI state instantly if the state setter function was passed
            if (setCartItems) {
                setCartItems(updatedCart);
            }
            
            return updatedCart;
        } catch (error) {
            console.error("Error removing specific item from secure storage cart:", error);
        }
    };

const incrementCartItem = async (productId: string | number) => {
    try {
        const existingCartRaw = await SecureStorage.getItemAsync(CART_STORAGE_KEY);
        if (!existingCartRaw) return;

        let currentCart = JSON.parse(existingCartRaw);
        const itemIndex = currentCart.findIndex((item: any) => item.id === productId);

        if (itemIndex > -1) {
            // Increment the quantity
            currentCart[itemIndex].quantity += 1;

            // Save back to storage
            await SecureStorage.setItemAsync(CART_STORAGE_KEY, JSON.stringify(currentCart));
            console.log(`Incremented quantity for item: ${productId}`);

            // Update UI state instantly
            if (setCartItems) {
                setCartItems(currentCart);
            }
        }
        return currentCart;
    } catch (error) {
        console.error("Error incrementing cart quantity:", error);
    }
};

const decrementCartItem = async (productId: string | number) => {
    try {
        const existingCartRaw = await SecureStorage.getItemAsync(CART_STORAGE_KEY);
        if (!existingCartRaw) return;

        let currentCart = JSON.parse(existingCartRaw);
        const itemIndex = currentCart.findIndex((item: any) => item.id === productId);

        if (itemIndex > -1) {
            const currentQuantity = currentCart[itemIndex].quantity;

            if (currentQuantity > 1) {
                // Safe to decrement
                currentCart[itemIndex].quantity -= 1;
            } else {
                // If quantity is 1 and they decrement, completely remove it from the cart array
                currentCart = currentCart.filter((item: any) => item.id !== productId);
                console.log(`Removed item ${productId} because quantity dropped below 1.`);
            }

            // Save back to storage
            await SecureStorage.setItemAsync(CART_STORAGE_KEY, JSON.stringify(currentCart));
            console.log(`Decremented quantity for item: ${productId}`);

            // Update UI state instantly
            if (setCartItems) {
                setCartItems(currentCart);
            }
        }
        return currentCart;
    } catch (error) {
        console.error("Error decrementing cart quantity:", error);
    }
};

console.log('the cart', cart)

    return (
        <div className='w-full flex flex-row 
        items-center justify-between border 
        border-sand-200 rounded-lg px-3 bg-white py-3'>
            <div className="w-1/3 flex flex-row gap-2 items-start">
                <img
                    src={cart.images?.[0]?.image}
                    resizeMode="contain"
                    className='w-full h-20'
                />
                <div className='flex flex-col items-start'>
                    <p 
                    numberOfLines={2}
                    className='font-jakarta-bold text-md'>
                        {cart.name}
                    </p>
                    <p className='font-jakarta-light text-sm'>KES {cart.price}</p>
                </div>
            </div>
            <div className="flex flex-col gap-2 items-end">
                <TouchableOpacity
                onPress={() => removeFromCart(cart.id)}
                >
                    <Trash2 size={20} className='text-market-700'/>
                </TouchableOpacity>
                <p className='font-jakarta-semibold text-sm'>{cart.quantity}</p>
                <div className=" w-full flex flex-1 flex-row self-start">
                    <TouchableOpacity
                    onPress={()=> decrementCartItem(cart.id)}
                    >
                        <p className="mr-12 text-sand-950 bg-brand-500 rounded-md px-2.5 py-1 font-jakarta-bold">-</p>
                    </TouchableOpacity>
                    <TouchableOpacity
                    onPress={()=>incrementCartItem(cart.id)}
                    >
                        <p className="text-sand-950 bg-brand-500 rounded-md px-2.5 py-1 font-jakarta-bold">+</p>
                    </TouchableOpacity>
                </div>
            </div>
        </div>
    )
}

export default CartItem