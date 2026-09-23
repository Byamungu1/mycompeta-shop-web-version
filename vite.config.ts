import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, URL } from 'node:url';

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));

/**
 * Serves the repo's `assets/` folder at the site root (dev) and copies it into
 * the build output. Screens resolve images/fonts through the `require()` asset
 * shim, and `assets/constants/*` is imported from JavaScript — so it cannot
 * live in Vite's `publicDir`.
 */
const ASSET_PREFIXES = ['/fonts', '/images', '/maps', '/constants'];
const MIME: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.json': 'application/json',
};

const assetsPlugin = () => {
  const assetsRoot = r('./assets');
  return {
    name: 'base44-assets-dir',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        const url = (req.url || '').split('?')[0];
        if (!ASSET_PREFIXES.some((prefix) => url === prefix || url.startsWith(prefix + '/'))) {
          return next();
        }
        const filePath = path.join(assetsRoot, decodeURIComponent(url));
        if (
          !filePath.startsWith(assetsRoot) ||
          !fs.existsSync(filePath) ||
          !fs.statSync(filePath).isFile()
        ) {
          return next();
        }
        res.setHeader('Content-Type', MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream');
        fs.createReadStream(filePath).pipe(res);
      });
    },
    closeBundle() {
      const outDir = r('./dist');
      if (fs.existsSync(outDir)) {
        fs.cpSync(assetsRoot, outDir, { recursive: true });
      }
    },
  };
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiUrl = env.VITE_API_URL || env.EXPO_PUBLIC_API_URL || '/api/';
  const proxyTarget = env.VITE_API_PROXY_TARGET || 'https://shop.mycompeta.online';

  return {
    plugins: [react(), assetsPlugin()],

    // `assets/` is served by the plugin above, so Vite's own public dir is off.
    publicDir: false,

    resolve: {
      alias: [
        { find: /^@\/assets\/(.*)$/, replacement: r('./assets/$1') },
        { find: /^@\/(.*)$/, replacement: r('./src/$1') },
      ],
    },

    define: {
      __DEV__: JSON.stringify(mode !== 'production'),
      'import.meta.env.VITE_API_URL': JSON.stringify(apiUrl),
      'import.meta.env.VITE_CART_STORAGE_KEY': JSON.stringify(
        env.VITE_CART_STORAGE_KEY || env.EXPO_PUBLIC_CART_STORAGE_KEY || 'user_shopping_cart'
      ),
      'import.meta.env.VITE_DIRECT_BUY_STORAGE_KEY': JSON.stringify(
        env.VITE_DIRECT_BUY_STORAGE_KEY || env.EXPO_PUBLIC_DIRECT_BUY_STORAGE_KEY || 'directBuyProduct'
      ),
      'import.meta.env.VITE_GOOGLE_CLIENT_ID': JSON.stringify(
        env.VITE_GOOGLE_CLIENT_ID || env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || ''
      ),
      'import.meta.env.VITE_GOOGLE_REDIRECT_URL': JSON.stringify(
        env.VITE_GOOGLE_REDIRECT_URL || env.EXPO_PUBLIC_GOOGLE_REDIRECT_URL || ''
      ),
    },

    server: {
      host: true,
      port: 3000,
      strictPort: true,
      // The preview is served through a proxy host that rotates, so allow all.
      allowedHosts: true,
      proxy: {
        // Same-origin proxy to the Django backend: keeps the browser free of CORS.
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },

    preview: {
      host: true,
      port: 3000,
      allowedHosts: true,
    },
  };
});
