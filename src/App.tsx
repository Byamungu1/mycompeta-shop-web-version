/**
 * Application route table (React Router v6).
 *
 * URL layout:
 *   /                     → role gate (redirects to /login, /buyer or /seller)
 *   /login                → auth (login / register / verify / reset)
 *   /buyer/*              → buyer storefront tabs
 *   /seller/*             → seller dashboard tabs
 *   /product/:id          → buyer product detail
 *   /checkout, /payment   → buyer checkout flow
 *   /orders, /order/:id   → buyer orders
 *   /sellerProduct/*      → seller product management
 *   /notifications/*      → notification centre
 *   /settings             → account settings
 */
import { Route, Routes } from 'react-router-dom';
import { RouterBridge, TabBaseProvider } from '@/router';

import RootLayout from '@/layouts/RootLayout';
import BuyerTabsLayout from '@/layouts/BuyerTabsLayout';
import SellerTabsLayout from '@/layouts/SellerTabsLayout';

import Index from '@/pages/Index';
import Login from '@/pages/Login';
import NotFound from '@/pages/NotFound';

import Home from '@/pages/Home';
import Cart from '@/pages/Cart';
import Search from '@/pages/Search';
import Profile from '@/pages/Profile';
import ProductDetail from '@/pages/ProductDetail';
import Checkout from '@/pages/Checkout';
import Payment from '@/pages/Payment';
import Orders from '@/pages/Orders';
import Settings from '@/pages/Settings';
import Notifications from '@/pages/Notifications';
import NotificationDetail from '@/pages/NotificationDetail';

import SellerHome from '@/pages/seller/Home';
import SellerOrders from '@/pages/seller/Orders';
import SellerProducts from '@/pages/seller/Products';
import SellerCustomers from '@/pages/seller/Customers';
import SellerStore from '@/pages/seller/Store';
import SellerSearch from '@/pages/seller/Search';
import SellerNotifications from '@/pages/seller/Notifications';
import SellerProductDetail from '@/pages/seller/ProductDetail';
import AddProduct from '@/pages/seller/AddProduct';
import EditProduct from '@/pages/seller/EditProduct';

const BuyerTabs = () => (
  <TabBaseProvider value="/buyer">
    <BuyerTabsLayout />
  </TabBaseProvider>
);

const SellerTabs = () => (
  <TabBaseProvider value="/seller">
    <SellerTabsLayout />
  </TabBaseProvider>
);

export default function App() {
  return (
    <>
      <RouterBridge />
      <Routes>
        <Route element={<RootLayout />}>
          <Route index element={<Index />} />
          <Route path="login" element={<Login />} />

          <Route path="buyer" element={<BuyerTabs />}>
            <Route index element={<Home />} />
            <Route path="cart" element={<Cart />} />
            <Route path="search" element={<Search />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          <Route path="seller" element={<SellerTabs />}>
            <Route index element={<SellerHome />} />
            <Route path="orders" element={<SellerOrders />} />
            <Route path="products" element={<SellerProducts />} />
            <Route path="customers" element={<SellerCustomers />} />
            <Route path="store" element={<SellerStore />} />
          </Route>

          <Route path="seller/notification" element={<SellerNotifications />} />
          <Route path="seller/search" element={<SellerSearch />} />

          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="payment" element={<Payment />} />
          <Route path="orders" element={<Orders />} />
          <Route path="order" element={<Orders />} />
          <Route path="notification" element={<Notifications />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="notification/:id" element={<NotificationDetail />} />
          <Route path="settings" element={<Settings />} />

          <Route path="sellerProduct/addProduct" element={<AddProduct />} />
          <Route path="sellerProduct/editProduct/:id" element={<EditProduct />} />
          <Route path="sellerProduct/:id" element={<SellerProductDetail />} />

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}
