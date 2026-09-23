/// <reference types="vite/client" />

/**
 * Compatibility shims for this React Native -> Web port.
 * Several components still pass RN-only props / globals; these declarations
 * make them type-safe without rewriting every screen.
 */

declare const __DEV__: boolean;

declare namespace Animated {
  type Value = any;
  type AnimatedInterpolation = any;
  type AnimatedValue = any;
}

declare namespace React {
  interface HTMLAttributes<T> {
    numberOfLines?: number;
    ellipsizeMode?: 'head' | 'middle' | 'tail' | 'clip';
    resizeMode?: 'cover' | 'contain' | 'stretch' | 'center' | 'repeat' | string;
  }
  interface ImgHTMLAttributes<T> {
    resizeMode?: 'cover' | 'contain' | 'stretch' | 'center' | 'repeat' | string;
  }
  interface CSSProperties {
    shadowColor?: string;
    shadowOpacity?: number;
    shadowRadius?: number;
    shadowOffset?: { width: number; height: number };
    elevation?: number;
  }
}
