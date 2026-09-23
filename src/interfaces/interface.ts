import { NotificationCategory, OrderStatus } from "./types/types";

export interface StatisticCardData {
  title: string;
  value: string;
  Icon: React.ComponentType<any>;
  lebal: string;
  moneyLebal?: string;
  amount?: number;
  stockAltert?: boolean;
}

export interface Order {
  id: string;
  unique_identifier: string;
  buyer_name: string;
  total_items_count: number;
  total: number;
  status: OrderStatus;
  delivery_time: string;
  created_at: string;
  physical_location: string;
  placedTime: string;
  delivery_address_text?: string;
  delivery_fee: string;
  subtotal: number;
  is_paid: boolean;
  distance_km: string;
  payment_method: string;
  discount: number;
  order_preview_img: string;
  quantity: number;
  phone: string;
}

export interface FormData {
  email: string,
  firstName: string,
  lastName: string,
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  otp?: string;
}

// Interface for the user data object
export interface User {
  id: number;
  username: string;
  phone_number: string;
  first_name: string;
  last_name: string;
  role: 'buyer' | 'seller' | 'admin' | string;
  buyer_profile: any | null;
  is_verified: boolean;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
}

// Interface for the expected API response
export interface AuthResponse {
  data?: User; // Change 'data' to the actual key name containing the user object (e.g., 'user')
  success: boolean;
}

export interface ToastBannerProps {
  visible: boolean;
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
  duration?: number;
}

export interface UseTimerResult {
  secondsLeft: number;
  formattedTime: string;
  timerFinished: boolean;
  resetTimer: () => void;
  endTimer: () => void;
}

export interface SellerConflict {
  currentSellerId: number | string;
  currentSellerName: string;
  conflictingItems: ProductType[];
}

export interface SellerConflictResolution {
  shouldClearCart: boolean;
}

export interface ProductType {
  id: string
  quantity?: number;
  name: string;
  image_url?: string;
  price: number;
  color: string;
  total_views: number,
  total_purchases: number;
  product_variants: Variant[];
  discount: number;
  description: string;
  distance: number;
  category: string | null;
  features: string[];
  unit_price: number;
  imgs: { id: number, img: string, is_primary: boolean }[]; // Local URI from expo-img-picker
  seller_id?: number | string;
  seller_name?: string;

  // Dynamic variant properties bundled in
  variants:Variant[];
  product_name: string;
  img_url: string,
  size: string
  img_urls: string;
}

export interface Variant {
  id?: string;
  size: string;
  stock_quantity: number;
  color: string;
  sku: string;
  variantId: string | undefined;
}

export interface AddProductType {
  name: string;
  price: number;
  discount: number;
  description: string;
  category: string;
  images?: string[]; // Adjust based on your upload handler (e.g., URIs or imgPicker assets)
  features: string[];
  image?: string[]; // Adjust based on your upload handler (e.g., URIs or imgPicker assets)
  variants: {
    size: string;
    color: string;
    stock_quantity: number;
    sku: string;
  }[],
}

// Optional helper type for creating a new product from the frontend form state
export type CreateProductPayload = Omit<ProductType, 'id' | 'seller' | 'is_active' | 'created_at' | 'updated_at'>;

export interface DataInfo {
  options: string[],
  label: string,
  value: string,
  isOpen: boolean,
} 

export interface TotalSalesData {
  sales: number;
  revenue: number;
}

export interface DashboardSummary {
  total_sales: TotalSalesData;
  total_orders: number;
  total_customers: number;
}

export interface RecentOrder {
  id: string | number;
  unique_identifier: string | number;
  status: string;
  created_at: string;
  grand_total: number;
  customer: string;
}

export interface LowStockProduct {
  id: string | number;
  title: string;
  value: number | string;
  lebal?: string;         // Matches 'lebal' typo in your code
  stockAltert?: boolean;  // Matches 'stockAltert' typo in your code
}

// Complete payload returned by fetchDashboardData()
export interface DashboardStats {
  summary: DashboardSummary;
  recent_orders: RecentOrder[];
  low_stock_products: LowStockProduct[];
}
export interface Order {
  client_name: string;
  order_id: string;
  items_ordered: number;
  status: OrderStatus;
  notes: string
  delivery_location: string
  total_price: string; // DRF DecimalField serializes as string by default, not number
  date_ordered: string;
  client_phone: string
}
export interface OrderSummary {
  role: string
  count: number
  results: Order[]

}

interface DeliveryCoordinates {
  latitude: number;
  longitude: number;
}

export interface Customer {
  id: string
  full_name: string;
  email: string;
  phone_number: string;
  total_spent: number;
  total_orders: number;
  last_order: string | null;       // ISO Date string (e.g., "2026-07-01T15:37:16Z")
  purchase_history: string[];      // Adjust the array type if this is an array of objects
  createdAt: string;
  unique_identifier: string         // ISO Date string
}[]

export interface Purchase {
  unique_identifier: string;
  total: number;
  date: string;
}

export interface CustomerProfileData {
  id: string;
  full_name: string;
  email: string | null;
  phone_number: string;
  total_spent: number;
  total_orders: number;
  last_order: string | null; // Can be null if they haven't ordered yet
  purchase_history: Purchase[];
  created_at: string; // ISO date string or timestamp
}

export interface Address {
  kakuma: string;
  zone: string;
  block: string;
}

export interface SellerProfile {
  readonly id?: number;
  shop_name: string;
  shop_description: string;
  coordinates: {
    shop_latitude: number; // Stored as a floating point number
    shop_longitude: number;
  }
  // Stored as a floating point number
  img: string | null; // URL from backend, or null if no img uploaded
  delivery_radius_km: string;
  delivery_available: boolean;
  address: Address
  is_active: boolean;
  delivery_fee: number;
  whatsapp_number: string | null; // Stored in normalized E.164 format (+254...)
  phone_number: string | null; // Stored in normalized E.164 format (+254...)
  physical_location: string; // p description of the physical shop location
  readonly created_at?: string; // Optional timestamp if needed from backend
}
export interface CheckoutFormData {
  phone: string;
  email: string;
  fullName: string;
  landmark: string;
  deliveryTime: string;
  distance: number,
  paymentMethod?: string;
  coordinates: { buyer_latitude: number, buyer_longitude: number }
  address: Record<string, string>;
}

export interface Notification {
  id: string;
  notif_type: NotificationCategory;
  title: string;
  body: string;
  created_at: string;
  is_read: boolean;
}

export interface BuyerProfileSettings {
  default_address: string | null;
  default_latitude: string | number | null; // Handled dynamically depending on backend serialization
  default_longitude: string | number | null;
  primary_checkout_phone: string;
  primary_checkout_name: string;
}
export interface AlgoliaSearchHit {
  objectID: string;
  name: string;
  category: string;
  price?: number;
  description?: string;
  img?: string;
  // Add other fields returned by your Algolia serializer configuration
}

export interface SearchResponse {
  results: AlgoliaSearchHit[];
  nbHits: number;
  page: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}


import { Dispatch, SetStateAction } from 'react';


export interface UseVariantSelectorReturn {
    // Extracted Unique Options
    uniqueSizes: string[];
    uniqueColors: string[];
    message: string | null;
    setProductValidationMessage: Dispatch<SetStateAction<string | null>>;
    
    // Active Selections
    selectedSize: string | null;
    setSelectedSize: Dispatch<SetStateAction<string | null>>;
    
    selectedColor: string | null;
    setSelectedColor: Dispatch<SetStateAction<string | null>>;
    
    // Derived Active Variant Matching Selections
    activeVariant: Variant | undefined;
}
