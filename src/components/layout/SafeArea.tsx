/** react-native-safe-area-context → plain divs (no notches on web). */
import React from 'react';

export const SafeAreaView = React.forwardRef(({ children, className = '', ...rest }: any, ref: any) => (
  <div ref={ref} className={`app-page ${className}`} {...rest}>
    {children}
  </div>
));

export const SafeAreadiv = SafeAreaView;

export const SafeAreaProvider = ({ children }: any) => <>{children}</>;

export const SafeAreaInsetsContext = React.createContext({ top: 0, right: 0, bottom: 0, left: 0 });

export const useSafeAreaInsets = () => ({ top: 0, right: 0, bottom: 0, left: 0 });

export const useSafeAreaFrame = () => ({
  x: 0,
  y: 0,
  width: typeof window !== 'undefined' ? window.innerWidth : 1024,
  height: typeof window !== 'undefined' ? window.innerHeight : 768,
});

export const withSafeAreaInsets = (Component: any) => Component;

export const initialWindowMetrics = {
  insets: { top: 0, right: 0, bottom: 0, left: 0 },
  frame: {
    x: 0,
    y: 0,
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  },
};
