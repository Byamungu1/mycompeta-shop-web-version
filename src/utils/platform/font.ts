/**
 * expo-font → web fonts.
 *
 * Fonts are declared with @font-face in src/index.css, so they are always
 * "loaded" here. `useFonts` simply reports readiness.
 */

export const useFonts = (_fonts?: any): [boolean, Error | null] => [true, null];

export const loadAsync = async (_fonts?: any): Promise<void> => {};

export const isLoaded = (_name: string): boolean => true;

export const isAvailable = (_name: string): boolean => true;

export default { useFonts, loadAsync, isLoaded, isAvailable };
