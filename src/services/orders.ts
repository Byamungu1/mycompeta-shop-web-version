import { CheckoutFormData } from "@/interfaces/interface";
import { CartItemType } from "@/interfaces/types/types";
import api from "@/utils/api"; // your configured axios instance
import { getShippingAddress } from "@/utils/formatAdress";

export const getOrders = async (scope = 'seller', orderStatus = '') => {
  const endpoint = scope === 'seller' ? `orders/my-orders/?as=seller&status=${orderStatus}` : `orders/my-orders/?as=buyer&status=${orderStatus}`;
  const response = await api.get(endpoint);
  return response
};


export const updateOrderStatus = async (
  orderId: string | number,
  status: 'Confirmed' | string
) => {
  try {
    const response = await api.patch(`orders/${orderId.toString()}/status/`, {
      status: status
    });

    return response;
  } catch (error: any) {
    console.error(`Error updating order ${orderId} status:`, error?.response?.data || error.message);
    throw error?.response?.data || error.message || 'Failed to update order status.'
  }
};

export const createOrder = async (shippingInfo: CheckoutFormData, cartItems: CartItemType[]) => {

  cartItems.map((item) => {
     console.log('the items', item.variant?.size)
     console.log('the color', item.variant?.color) //heeeere
     console.log('the id', item.variant?.variantId) //heeeere
  })

  console.log('the shipping infor delivery time', shippingInfo.deliveryTime)

  const payload = {
    phone: shippingInfo.phone || '',
    payment_method: shippingInfo.paymentMethod || '',
    delivery_location: getShippingAddress(shippingInfo),
    delivery_latitude: shippingInfo.coordinates.buyer_latitude.toFixed(5),
    delivery_longitude: shippingInfo.coordinates.buyer_longitude.toFixed(5),
    delivery_address_text: shippingInfo.landmark,
    //deliveryTime: shippingInfo.deliveryTime,
    full_name: shippingInfo.fullName,
    note: shippingInfo.landmark,
    // The backend handles pricing entirely; we only provide structural tracking

    items: cartItems.map(item => {
      // Extract target criteria dynamically from whatever selection property exists
      const selectedSize = item.variant?.size
      const selectedColor = item.variant?.color;
      const targetVariantId = item.variant?.variantId;

      // 1. Direct ID match (Fastest & most accurate if variant ID was saved on selection)
      let matchingVariant = item.variants?.find(v => v.id === targetVariantId) || 
      item.product_variants?.find(v => v.id === targetVariantId);

      // 2. Strict multi-attribute match (Matches BOTH size AND color if both are present)
      if (!matchingVariant && item.variants?.length) {
        matchingVariant = item.variants.find(v => {
          const matchSize = !selectedSize || v.size === selectedSize;
          const matchColor = !selectedColor || v.color === selectedColor;
          return matchSize && matchColor;
        });
      }

      // 3. Fallback: If item.variant is already a single variant object, use its ID directly
      const finalVariantId = matchingVariant?.id ?? targetVariantId ?? null;

      return {
        product: item.id, // or item.product_id
        variant: matchingVariant ? finalVariantId : null, // single integer ID
        quantity: item.quantity,
      };
    })
  }

  const response = await api.post(`orders/`, payload);
  return response;
};

export const cancelOrder = async (orderId: string | number) => {
  try {
    const response = await api.post(`orders/${orderId.toString()}/cancel/`, {});
    return response;
  } catch (error: any) {
    console.error(`Error cancelling order ${orderId}:`, error?.response?.data || error.message);
    throw error?.response?.data || error.message || 'Failed to cancel order.'
  }
};
