import { ProductType } from "../interface";

export type OrderStatus = 'pending' | 'confirmed' | 'out-for-delivery' | 'delivered' | 'cancelled';
export type CartItemType = ProductType & { quantity: number, variant: {size: string, color: string, variantId: string}, directBuy: boolean};

export type NotificationCategory = 'order_placed' | 'payment' | 'promo' | 'account' | 'system';