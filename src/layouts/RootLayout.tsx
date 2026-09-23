import { CategoryProvider } from '@/context/categoryContext';
import { AuthProvider } from '@/context/globalContext';
import { GlobalCountProvider } from '@/context/globalCountContext';
import { LoadingSpinnerProvider } from '@/context/loadingSpinnerContext';
import { ToastProvider } from '@/context/toastContext';
//import { useAppUpdates } from '@/hooks/useAppUpdates';
import { useColorScheme } from '@/utils/platform/colorScheme';
import { Outlet } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

/**
 * Root layout: global providers + the routed screen outlet.
 * Fonts are declared with @font-face in src/index.css.
 */
export default function RootLayout() {
  //useAppUpdates();
  const { colorScheme } = useColorScheme();
  const location = useLocation();
  const isLogin = location.pathname === '/login';

  return (
    <AuthProvider>
      <ToastProvider>
        <CategoryProvider>
          <GlobalCountProvider>
            <LoadingSpinnerProvider>
              <div
                key={colorScheme}
                className={`flex flex-col flex-1 min-h-screen w-full ${isLogin ? 'bg-sand-50' : 'app-shell bg-sand-50 dark:bg-sand-950'}`}
              >
                <Outlet />
              </div>
            </LoadingSpinnerProvider>
          </GlobalCountProvider>
        </CategoryProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
