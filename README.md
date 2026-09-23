# myCompeta Shop — Web

A pure web e-commerce storefront (buyer + seller) built with **Vite**, **React 18**,
**React Router v6** and **Tailwind CSS**. It talks to the existing Django API.

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the dev server

   ```bash
   npm run dev
   ```

   The app is served on <http://localhost:3000>.

3. Build for production

   ```bash
   npm run build
   npm run preview
   ```

## Project structure

```text
src/
├── components/
│   ├── common/         UI primitives, inputs, modals, loaders, banners
│   ├── layout/         Header, navigation, safe-area helpers
│   ├── cart/           Cart item components
│   ├── checkout/       Delivery / distance / checkout helpers
│   ├── product/        Product cards and filters
│   ├── notifications/  Notification screens
│   └── seller/         Seller dashboard components
├── context/            Auth, cart counts, categories, toasts, network
├── hooks/              Data-fetching and UI hooks
├── interfaces/         Shared TypeScript types
├── layouts/            Route layouts (root + buyer/seller tab shells)
├── pages/              Route pages (buyer storefront + seller dashboard)
├── router/             React Router helpers (navigation, tabs, focus effect)
├── services/           API service modules
└── utils/              Formatting, geo, storage and platform helpers
```

## Configuration

The API base URL is read from `VITE_API_URL` (defaults to the same-origin `/api/`
proxy configured in `vite.config.ts`). Local development proxies `/api/*` to
`VITE_API_PROXY_TARGET` so the browser never hits CORS.
