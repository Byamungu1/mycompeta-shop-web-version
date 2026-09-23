/**
 * nativewind → plain Tailwind.
 *
 * The web build uses Tailwind directly, so the colour-scheme hook simply
 * reports the (light) web theme and exposes no-op setters.
 */
import { useCallback, useState } from 'react';

export type ColorSchemeName = 'light' | 'dark';

export const useColorScheme = () => {
  const [colorScheme] = useState<ColorSchemeName>('light');
  const setColorScheme = useCallback((_scheme: ColorSchemeName) => {}, []);
  const toggleColorScheme = useCallback(() => {}, []);
  return { colorScheme, setColorScheme, toggleColorScheme };
};

export const useColorSchemeValue = () => 'light' as ColorSchemeName;

export const cssInterop = (component: any) => component;
export const remapProps = (component: any) => component;
export const vars = (v: any) => v;
export const inlineStyle = (v: any) => v;
export const useUnstableNativeVariable = (_name: string) => undefined;

export default { useColorScheme };
