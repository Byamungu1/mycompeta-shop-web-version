/**
 * Web navigation module.
 *
 * Thin helpers over `react-router-dom` used across the app: `useRouter`,
 * `useFocusEffect`, `useLocalSearchParams`, `Link`, `Redirect`, `Tabs` and the
 * imperative `router` singleton.
 */
import React, { createContext, useContext, useEffect, useMemo } from 'react';
import {
  Link as RRLink,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams as useRRSearchParams,
} from 'react-router-dom';

/* ------------------------------------------------------------------ */
/* Path translation: expo route groups are not part of the URL         */
/* ------------------------------------------------------------------ */

export const toWebPath = (href: any): string => {
  if (href === undefined || href === null) return '/';
  // expo-router also accepts object hrefs: { pathname, params }
  let path = typeof href === 'string' ? href : href.pathname || '/';

  const query = typeof href === 'object' && href.params
    ? '?' + new URLSearchParams(href.params as any).toString()
    : '';

  path = path.replace(/^\/?\(root\)/, '');
  path = path.replace(/\(buyerTabs\)/g, 'buyer');
  path = path.replace(/\(sellerTabs\)/g, 'seller');
  if (!path.startsWith('/')) path = '/' + path;
  path = path.replace(/\/{2,}/g, '/');
  if (path.length > 1) path = path.replace(/\/$/, '');
  return (path || '/') + query;
};

/* ------------------------------------------------------------------ */
/* Imperative router                                                   */
/* ------------------------------------------------------------------ */

let navigateRef: ((to: any, opts?: any) => void) | null = null;

/** Captures react-router's navigate into a module-level ref for `router`. */
export const RouterBridge = () => {
  const navigate = useNavigate();
  navigateRef = navigate;
  return null;
};

export const router = {
  push: (href: any) => navigateRef?.(toWebPath(href)),
  replace: (href: any) => navigateRef?.(toWebPath(href), { replace: true }),
  navigate: (href: any) => navigateRef?.(toWebPath(href)),
  back: () => (window.history.length > 1 ? navigateRef?.(-1) : navigateRef?.('/')),
  dismiss: () => navigateRef?.(-1),
  dismissAll: () => navigateRef?.('/'),
  canGoBack: () => typeof window !== 'undefined' && window.history.length > 1,
  canDismiss: () => true,
  setParams: () => {},
  reload: () => window.location.reload(),
};

export const useRouter = () => {
  const navigate = useNavigate();
  return useMemo(
    () => ({
      push: (href: any) => navigate(toWebPath(href)),
      replace: (href: any) => navigate(toWebPath(href), { replace: true }),
      navigate: (href: any) => navigate(toWebPath(href)),
      back: () => navigate(-1),
      dismiss: () => navigate(-1),
      dismissAll: () => navigate('/'),
      canGoBack: () => window.history.length > 1,
      canDismiss: () => true,
      setParams: () => {},
      reload: () => window.location.reload(),
    }),
    [navigate]
  );
};

export const useNavigation = () => useRouter();

/* ------------------------------------------------------------------ */
/* Hooks                                                               */
/* ------------------------------------------------------------------ */

export const usePathname = () => useLocation().pathname;

export const useSegments = () => {
  const pathname = useLocation().pathname;
  return pathname.split('/').filter(Boolean);
};

export const useLocalSearchParams = () => {
  const params = useParams();
  const [searchParams] = useRRSearchParams();
  const out: Record<string, any> = { ...params };
  searchParams.forEach((value, key) => {
    out[key] = value;
  });
  return out;
};

export const useGlobalSearchParams = useLocalSearchParams;

export const useIsFocused = () => true;

export const useFocusEffect = (callback: () => void | (() => void)) => {
  const location = useLocation();
  useEffect(() => {
    const cleanup = callback();
    return () => {
      if (typeof cleanup === 'function') cleanup();
    };
    // Re-run whenever the route changes, mirroring native "screen focused".
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callback, location.pathname, location.search]);
};

export const useRootNavigationState = () => ({ key: 'root', routes: [] });

export const useUnstableGlobalHref = () => usePathname();

export const useSearchParams = () => {
  const [params, setParams] = useRRSearchParams();
  const obj: Record<string, string> = {};
  params.forEach((v, k) => {
    obj[k] = v;
  });
  return obj;
};

/* ------------------------------------------------------------------ */
/* Components                                                          */
/* ------------------------------------------------------------------ */

export const Redirect = ({ href, replace = true }: { href: any; replace?: boolean }) => (
  <Navigate to={toWebPath(href)} replace={replace} />
);

export const Link = React.forwardRef(({ href, to, children, ...rest }: any, ref: any) => (
  <RRLink ref={ref} to={toWebPath(to ?? href)} {...rest}>
    {children}
  </RRLink>
));

export const Slot = () => <Outlet />;

export const Stack = ({ children }: any) => <Outlet />;
Stack.Screen = () => null;

export const SplashScreen = {
  hideAsync: async () => {},
  preventAutoHideAsync: async () => {},
  setOptions: () => {},
};

/* ------------------------------------------------------------------ */
/* Tabs                                                                */
/* ------------------------------------------------------------------ */

const TabBaseContext = createContext('/');
export const TabBaseProvider = TabBaseContext.Provider;
export const useTabBase = () => useContext(TabBaseContext);

const TabsImpl = ({ children, screenOptions, ...rest }: any) => {
  const base = useTabBase();
  const location = useLocation();

  const items: Array<{ name: string; options: any }> = [];
  React.Children.forEach(children, (child: any) => {
    if (!child || !child.props) return;
    items.push({ name: child.props.name, options: child.props.options || {} });
  });

  const hrefFor = (name: string) => {
    if (name === 'index') return base || '/';
    return `${base}/${name}`.replace(/\/{2,}/g, '/');
  };

  const isActive = (name: string) => {
    const href = hrefFor(name);
    console.log('isActive check:', { name, href, pathname: location.pathname, base });
    
    // Normalize paths for comparison
    const normalizedPathname = location.pathname.replace(/\/$/, '') || '/';
    const normalizedHref = href.replace(/\/$/, '') || '/';
    
    console.log('Normalized paths:', { normalizedPathname, normalizedHref });
    
    // For index tab, only active when exactly at the base path
    if (name === 'index') {
      return normalizedPathname === normalizedHref;
    }
    
    // For other tabs, check exact match or starts with (for nested routes)
    return normalizedPathname === normalizedHref || normalizedPathname.startsWith(normalizedHref + '/');
  };

  return (
    <div className="flex-1 min-h-0 w-full flex-col lg:flex-row">
      <nav
        className="order-2 lg:order-1 fixed bottom-0 left-0 right-0 z-50 lg:sticky lg:top-0 lg:z-30
                   flex flex-row items-stretch justify-around gap-1
                   bg-white border-t border-sand-200
                   lg:w-60 lg:h-screen lg:flex-col lg:justify-start lg:gap-2 lg:border-t-0 lg:border-r lg:px-4 lg:py-8"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)', height: 'auto' }}
      >
        {items.map(({ name, options }) => {
          const active = isActive(name);
          const href = hrefFor(name);
          return (
            <button
              key={name}
              type="button"
              onClick={() => {
                navigateRef?.(href);
              }}
              className={
                'flex-1 lg:flex-none flex flex-col lg:flex-row items-center lg:justify-start justify-center gap-0.5 lg:gap-3 py-3 px-2 lg:py-3 lg:px-4 transition-colors cursor-pointer min-h-[60px] lg:min-h-0 ' +
                (active ? 'text-brand-700 bg-brand-50 lg:border-l-2 lg:border-brand-500' : 'text-sand-500 hover:text-info-600 hover:bg-sand-50')
              }
            >
              <span
                className={
                  'flex items-center justify-center w-8 h-8 rounded-md transition-colors ' +
                  (active ? 'bg-brand-500 text-sand-950 lg:bg-transparent lg:text-brand-700' : '')
                }
              >
                {options.tabBarIcon?.({ focused: active, color: active ? '#B45309' : '#78716C' })}
              </span>
              {options.tabBarShowLabel !== false && (
                <span className="text-[10px] font-jakarta-medium lg:text-sm lg:block">
                  {options.title ?? name}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <main className="order-1 lg:order-2 flex-1 min-w-0 min-h-0 pb-[80px] lg:pb-0">
        <Outlet />
      </main>
    </div>
  );
};

export const Tabs: any = TabsImpl;
Tabs.Screen = () => null;
