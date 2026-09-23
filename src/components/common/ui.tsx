/**
 * Web UI primitives.
 *
 * A small design-system layer that renders the app's building blocks (`View`,
 * `Text`, `TextInput`, `FlatList`, `Modal`, …) as real DOM elements. Screens
 * import these from `@/components/common/ui`.
 */
import React, {
  useEffect,
  useImperativeHandle,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

/* ------------------------------------------------------------------ */
/* Style helpers                                                       */
/* ------------------------------------------------------------------ */

export const flattenStyle = (style: any): any => {
  if (!style) return undefined;
  if (Array.isArray(style)) {
    const out: any = {};
    for (const s of style) {
      const f = flattenStyle(s);
      if (f) Object.assign(out, f);
    }
    return out;
  }
  return style;
};

const isAnimatedNode = (v: any) =>
  v && typeof v === 'object' && (v as any).__isAnimatedNode === true;

export const resolveAnimatedValue = (v: any) => (isAnimatedNode(v) ? v.__getValue() : v);

const DROPPED_STYLE_KEYS = new Set([
  'shadowOffset',
  'shadowColor',
  'shadowOpacity',
  'shadowRadius',
  'elevation',
  'textAlignVertical',
  'resizeMode',
  'overflow',
]);

export const toCss = (style: any): any => {
  const flat = flattenStyle(style);
  if (!flat) return undefined;

  const out: any = {};
  for (const key of Object.keys(flat)) {
    if (DROPPED_STYLE_KEYS.has(key)) continue;
    const value = resolveAnimatedValue(flat[key]);
    if (value === undefined || value === null) continue;
    out[key] = value;
  }

  const offset = flat.shadowOffset;
  if (flat.shadowColor || offset) {
    const w = offset?.width ?? 0;
    const h = offset?.height ?? 0;
    out.boxShadow = `${w}px ${h}px ${flat.shadowRadius ?? 0}px ${flat.shadowColor ?? 'rgba(0,0,0,0.15)'}`;
  }

  if (out.overflow === 'hidden') out.overflow = 'hidden';
  return out;
};

/* ------------------------------------------------------------------ */
/* Prop helpers                                                        */
/* ------------------------------------------------------------------ */

const RN_ONLY_PROPS = new Set([
  'onPress',
  'onLongPress',
  'activeOpacity',
  'underlayColor',
  'delayLongPress',
  'hitSlop',
  'numberOfLines',
  'resizeMode',
  'source',
  'onLoad',
  'onLoadEnd',
  'onError',
  'accessible',
  'accessibilityLabel',
  'accessibilityRole',
  'accessibilityHint',
  'accessibilityState',
  'keyboardType',
  'secureTextEntry',
  'onChangeText',
  'placeholderTextColor',
  'autoCapitalize',
  'autoCorrect',
  'returnKeyType',
  'blurOnSubmit',
  'onSubmitEditing',
  'textAlignVertical',
  'keyboardShouldPersistTaps',
  'contentContainerStyle',
  'contentContainerClassName',
  'showsVerticalScrollIndicator',
  'showsHorizontalScrollIndicator',
  'ListHeaderComponent',
  'ListFooterComponent',
  'ListEmptyComponent',
  'ItemSeparatorComponent',
  'columnWrapperStyle',
  'ListHeaderComponentStyle',
  'ListFooterComponentStyle',
  'data',
  'renderItem',
  'keyExtractor',
  'numColumns',
  'horizontal',
  'onRefresh',
  'refreshing',
  'onEndReached',
  'onEndReachedThreshold',
  'scrollEnabled',
  'initialNumToRender',
  'maxToRenderPerBatch',
  'windowSize',
  'removeClippedSubviews',
  'extraData',
  'getItemLayout',
  'onViewableItemsChanged',
  'viewabilityConfig',
  'stickySectionHeadersEnabled',
  'sections',
  'renderSectionHeader',
  'SectionSeparatorComponent',
  'inverted',
  'scrollEventThrottle',
  'onContentSizeChange',
  'snapToInterval',
  'decelerationRate',
  'pagingEnabled',
  'keyboardDismissMode',
  'automaticallyAdjustContentInsets',
  'contentInsetAdjustmentBehavior',
  'enableOnAndroid',
  'extraScrollHeight',
  'keyboardOpeningTime',
  'animationType',
  'transparent',
  'onRequestClose',
  'presentationStyle',
  'statusBarTranslucent',
  'hardwareAccelerated',
  'visible',
  'modalProps',
  'onStartShouldSetResponder',
  'onMoveShouldSetResponder',
  'scrollToOverflowEnabled',
]);

const cleanProps = (rest: any) => {
  const out: any = {};
  for (const key of Object.keys(rest)) {
    if (RN_ONLY_PROPS.has(key)) continue;
    out[key] = rest[key];
  }
  return out;
};

const mergeClass = (...parts: Array<string | false | undefined | null>) =>
  parts.filter(Boolean).join(' ');

/* ------------------------------------------------------------------ */
/* Animated                                                            */
/* ------------------------------------------------------------------ */

let animatedListenerId = 0;

class AnimatedValue {
  __isAnimatedNode = true;
  _value: number;
  _listeners = new Map<number, (v: number) => void>();

  constructor(value: number) {
    this._value = value;
  }

  setValue(value: number) {
    this._value = value;
    this.__emit();
  }

  __emit() {
    this._listeners.forEach((cb) => cb(this._value));
  }

  __getValue() {
    return this._value;
  }

  __listenerCount() {
    return this._listeners.size;
  }

  addListener(cb: (v: number) => void) {
    const id = ++animatedListenerId;
    this._listeners.set(id, cb);
    return id;
  }

  removeListener(id: number) {
    this._listeners.delete(id);
  }

  removeAllListeners() {
    this._listeners.clear();
  }

  stopAnimation(cb?: () => void) {
    cb?.();
  }

  resetAnimation(cb?: () => void) {
    cb?.();
  }

  interpolate(config: any) {
    return makeInterpolation(this, config);
  }
}

const mixColor = (a: string, b: string, t: number) => {
  const parse = (c: string) => {
    const hex = c.replace('#', '');
    const full = hex.length === 3 ? hex.split('').map((x) => x + x).join('') : hex;
    return [
      parseInt(full.slice(0, 2), 16),
      parseInt(full.slice(2, 4), 16),
      parseInt(full.slice(4, 6), 16),
    ];
  };
  try {
    const ca = parse(a);
    const cb = parse(b);
    const mix = ca.map((v, i) => Math.round(v + (cb[i] - v) * t));
    return `rgb(${mix[0]}, ${mix[1]}, ${mix[2]})`;
  } catch {
    return a;
  }
};

function makeInterpolation(parent: AnimatedValue, config: any) {
  const { inputRange, outputRange } = config;
  const node: any = {
    __isAnimatedNode: true,
    __parent: parent,
    __getValue() {
      const v = parent.__getValue();
      if (v <= inputRange[0]) return outputRange[0];
      const last = inputRange.length - 1;
      if (v >= inputRange[last]) return outputRange[last];
      for (let i = 0; i < last; i++) {
        if (v >= inputRange[i] && v <= inputRange[i + 1]) {
          const span = inputRange[i + 1] - inputRange[i] || 1;
          const t = (v - inputRange[i]) / span;
          const a = outputRange[i];
          const b = outputRange[i + 1];
          if (typeof a === 'string' || typeof b === 'string') {
            return mixColor(String(a), String(b), t);
          }
          return a + (b - a) * t;
        }
      }
      return outputRange[0];
    },
  };
  return node;
}

const makeTiming = (value: AnimatedValue, config: any) => {
  let raf = 0;
  let stopped = false;
  return {
    start(cb?: (r: { finished: boolean }) => void) {
      stopped = false;
      const to = config?.toValue ?? 0;
      const from = value.__getValue();
      const duration = config?.duration ?? 300;
      const easing = config?.easing || ((t: number) => t);
      const start = performance.now();

      const step = (now: number) => {
        if (stopped || value.__listenerCount() === 0) return;
        const p = Math.min(1, (now - start) / (duration || 1));
        value.setValue(from + (to - from) * easing(p));
        if (p < 1) {
          raf = requestAnimationFrame(step);
        } else {
          value.setValue(to);
          cb?.({ finished: true });
        }
      };
      raf = requestAnimationFrame(step);
    },
    stop() {
      stopped = true;
      cancelAnimationFrame(raf);
    },
    reset() {
      stopped = true;
      cancelAnimationFrame(raf);
    },
  };
};

const makeSpring = (value: AnimatedValue, config: any) => {
  let raf = 0;
  let stopped = false;
  return {
    start(cb?: (r: { finished: boolean }) => void) {
      stopped = false;
      const to = config?.toValue ?? 0;
      const from = value.__getValue();
      const start = performance.now();
      const duration = 400;
      const step = (now: number) => {
        if (stopped || value.__listenerCount() === 0) return;
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        value.setValue(from + (to - from) * eased);
        if (p < 1) raf = requestAnimationFrame(step);
        else cb?.({ finished: true });
      };
      raf = requestAnimationFrame(step);
    },
    stop() {
      stopped = true;
      cancelAnimationFrame(raf);
    },
    reset() {
      stopped = true;
      cancelAnimationFrame(raf);
    },
  };
};

const composite = (animations: any[], mode: 'sequence' | 'parallel') => ({
  _stopped: false,
  start(cb?: (r: { finished: boolean }) => void) {
    this._stopped = false;
    if (mode === 'parallel') {
      let remaining = animations.length;
      if (!remaining) return cb?.({ finished: true });
      animations.forEach((a) =>
        a.start(() => {
          remaining -= 1;
          if (remaining === 0) cb?.({ finished: true });
        })
      );
      return;
    }
    let i = 0;
    const next = () => {
      if (this._stopped) return;
      if (i >= animations.length) return cb?.({ finished: true });
      const a = animations[i++];
      a.start(() => next());
    };
    next();
  },
  stop() {
    this._stopped = true;
    animations.forEach((a) => a.stop?.());
  },
  reset() {
    animations.forEach((a) => a.reset?.());
  },
});

const makeLoop = (animation: any, config?: { iterations?: number }) => ({
  _stopped: false,
  start(cb?: (r: { finished: boolean }) => void) {
    this._stopped = false;
    const iterations = config?.iterations ?? -1;
    let n = 0;
    const next = () => {
      if (this._stopped) return;
      if (iterations !== -1 && n >= iterations) return cb?.({ finished: true });
      n += 1;
      animation.reset?.();
      animation.start(() => next());
    };
    next();
  },
  stop() {
    this._stopped = true;
    animation.stop?.();
  },
  reset() {
    animation.reset?.();
  },
});

const collectAnimatedNodes = (value: any, set: Set<any>) => {
  if (!value) return;
  if (Array.isArray(value)) {
    value.forEach((v) => collectAnimatedNodes(v, set));
    return;
  }
  if (typeof value === 'object') {
    if (value.__isAnimatedNode) {
      set.add(value.__parent ?? value);
      return;
    }
    Object.keys(value).forEach((k) => collectAnimatedNodes(value[k], set));
  }
};

const useAnimatedSubscription = (style: any) => {
  const [, force] = useReducer((x: number) => x + 1, 0);
  useEffect(() => {
    const nodes = new Set<any>();
    collectAnimatedNodes(style, nodes);
    const ids: Array<[any, number]> = [];
    nodes.forEach((n) => ids.push([n, n.addListener(force)]));
    return () => ids.forEach(([n, id]) => n.removeListener(id));
  }, [style]);
};

const makeAnimatedComponent = (Tag: any) => {
  const Comp = React.forwardRef((props: any, ref: any) => {
    const { style, className, children, ...rest } = props;
    useAnimatedSubscription(style);
    return (
      <Tag ref={ref} className={className} style={toCss(style)} {...cleanProps(rest)}>
        {children}
      </Tag>
    );
  });
  return Comp;
};

export const Animated = {
  Value: AnimatedValue,
  timing: makeTiming,
  spring: makeSpring,
  sequence: (animations: any[]) => composite(animations, 'sequence'),
  parallel: (animations: any[]) => composite(animations, 'parallel'),
  loop: makeLoop,
  delay: (ms: number) => ({
    start(cb?: any) {
      setTimeout(() => cb?.({ finished: true }), ms);
    },
    stop() { },
    reset() { },
  }),
  createAnimatedComponent: makeAnimatedComponent,
  event: () => () => { },
  add: (a: any, b: any) => ({
    __isAnimatedNode: true,
    __getValue: () => resolveAnimatedValue(a) + resolveAnimatedValue(b),
  }),
  div: makeAnimatedComponent('div'),
  View: makeAnimatedComponent('div'),
  Text: makeAnimatedComponent('span'),
  Image: makeAnimatedComponent('img'),
  ScrollView: makeAnimatedComponent('div'),
};

export const Easing = {
  linear: (t: number) => t,
  ease: (t: number) => t,
  quad: (t: number) => t * t,
  cubic: (t: number) => t * t * t,
  poly: (n: number) => (t: number) => Math.pow(t, n),
  sin: (t: number) => t,
  circle: (t: number) => t,
  exp: (t: number) => t,
  in: (f: any) => f,
  out: (f: any) => (t: number) => 1 - f(1 - t),
  inOut: (f: any) => (t: number) => (t < 0.5 ? f(t * 2) / 2 : 1 - f((1 - t) * 2) / 2),
  bezier: () => (t: number) => t,
  back: () => (t: number) => t,
  elastic: () => (t: number) => t,
  bounce: (t: number) => t,
};

/* ------------------------------------------------------------------ */
/* Primitives                                                          */
/* ------------------------------------------------------------------ */

export const div = 'div' as any;
export const p = 'p' as any;

export const View = React.forwardRef(({ children, ...rest }: any, ref: any) => (
  <div ref={ref} {...rest}>
    {children}
  </div>
));

export const Text = React.forwardRef(({ children, numberOfLines, className, ...rest }: any, ref: any) => (
  <span ref={ref} className={mergeClass(numberOfLines ? `line-clamp-${numberOfLines}` : '', className)} {...cleanProps(rest)}>
    {children}
  </span>
));

export const TouchableOpacity = React.forwardRef(
  ({ onPress, onLongPress, disabled, activeOpacity, children, className, style, ...rest }: any, ref: any) => {
    let pressTimer: any;
    return (
      <div
        ref={ref}
        role="button"
        tabIndex={disabled ? undefined : 0}
        aria-disabled={disabled || undefined}
        className={mergeClass(
          disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
          className
        )}
        style={toCss(style)}
        onClick={
          disabled
            ? undefined
            : (e: any) => {
              e.stopPropagation?.();
              onPress?.(e);
            }
        }
        onMouseDown={
          disabled || !onLongPress
            ? undefined
            : () => {
              pressTimer = setTimeout(() => onLongPress?.(), 500);
            }
        }
        onMouseUp={() => clearTimeout(pressTimer)}
        onMouseLeave={() => clearTimeout(pressTimer)}
        onKeyDown={(e: any) => {
          if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onPress?.(e);
          }
        }}
        {...cleanProps(rest)}
      >
        {children}
      </div>
    );
  }
);

export const TouchableHighlight = TouchableOpacity;
export const TouchableWithoutFeedback = TouchableOpacity;

export const Pressable = React.forwardRef(
  ({ onPress, disabled, children, style, className, ...rest }: any, ref: any) => {
    const resolved = typeof style === 'function' ? style({ pressed: false }) : style;
    return (
      <div
        ref={ref}
        role="button"
        tabIndex={disabled ? undefined : 0}
        className={mergeClass(
          disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
          className
        )}
        style={toCss(resolved)}
        onClick={disabled ? undefined : (e: any) => onPress?.(e)}
        onKeyDown={(e: any) => {
          if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onPress?.(e);
          }
        }}
        {...cleanProps(rest)}
      >
        {typeof children === 'function' ? children({ pressed: false }) : children}
      </div>
    );
  }
);

export const ActivityIndicator = ({ size, color, className, style, ...rest }: any) => {
  const dim =
    size === 'small' ? 16 : size === 'large' ? 32 : typeof size === 'number' ? size : 24;
  return (
    <div
      className={mergeClass(
        'inline-block animate-spin rounded-full border-2 border-current border-t-transparent',
        className
      )}
      style={{ width: dim, height: dim, color: color || '#F59E0B', ...toCss(style) }}
      {...cleanProps(rest)}
    />
  );
};

export const Image = ({ source, resizeMode, className, style, ...rest }: any) => {
  const src = typeof source === 'string' ? source : source?.uri;
  return (
    <img
      src={src}
      className={className}
      style={{ ...toCss(style), objectFit: resizeMode === 'contain' ? 'contain' : resizeMode === 'stretch' ? 'fill' : 'cover' }}
      {...cleanProps(rest)}
    />
  );
};

export const ImageBackground = ({ source, children, className, style, imageStyle, resizeMode, ...rest }: any) => {
  const src = typeof source === 'string' ? source : source?.uri;
  return (
    <div
      className={className}
      style={{
        ...toCss(style),
        backgroundImage: `url(${src})`,
        backgroundSize: resizeMode === 'contain' ? 'contain' : 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
      {...cleanProps(rest)}
    >
      {children}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* ScrollView                                                          */
/* ------------------------------------------------------------------ */

export const ScrollView = React.forwardRef(
  (
    {
      children,
      className,
      style,
      contentContainerStyle,
      horizontal,
      showsVerticalScrollIndicator,
      showsHorizontalScrollIndicator,
      ...rest
    }: any,
    ref: any
  ) => {
    const nodeRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      scrollTo(opts?: any) {
        if (typeof opts === 'number') nodeRef.current?.scrollTo({ top: opts });
        else nodeRef.current?.scrollTo({ top: opts?.y, left: opts?.x });
      },
      scrollToEnd() {
        const el = nodeRef.current;
        if (!el) return;
        if (horizontal) el.scrollTo({ left: el.scrollWidth });
        else el.scrollTo({ top: el.scrollHeight });
      },
      scrollToIndex() { },
      getScrollableNode: () => nodeRef.current,
      getNode: () => nodeRef.current,
    }));

    return (
      <div
        ref={nodeRef}
        className={mergeClass(
          horizontal ? 'overflow-x-auto' : 'overflow-y-auto',
          '[scrollbar-width:none]',
          className
        )}
        style={toCss(style)}
        {...cleanProps(rest)}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: horizontal ? 'row' : 'column',
            flexGrow: horizontal ? 0 : 1,
            ...toCss(contentContainerStyle),
          }}
        >
          {children}
        </div>
      </div>
    );
  }
);

export const Scrolldiv = ScrollView;

/* ------------------------------------------------------------------ */
/* TextInput                                                           */
/* ------------------------------------------------------------------ */

const toInputType = (keyboardType?: string, secureTextEntry?: boolean) => {
  if (secureTextEntry) return 'password';
  switch (keyboardType) {
    case 'email-address':
      return 'email';
    case 'numeric':
    case 'number-pad':
    case 'decimal-pad':
      return 'number';
    case 'phone-pad':
      return 'tel';
    case 'url':
      return 'url';
    default:
      return 'text';
  }
};

export const TextInput = React.forwardRef(
  (
    {
      value,
      onChangeText,
      onPress,
      placeholder,
      placeholderTextColor,
      secureTextEntry,
      keyboardType,
      multiline,
      editable,
      autoCapitalize,
      onFocus,
      onBlur,
      onSubmitEditing,
      returnKeyType,
      maxLength,
      className,
      style,
      ...rest
    }: any,
    ref: any
  ) => {
    const shared: any = {
      ref,
      value: value ?? '',
      placeholder,
      maxLength,
      readOnly: editable === false,
      className,
      style: {
        outline: 'none',
        ...(placeholderTextColor ? { '--ph-color': placeholderTextColor } : {}),
        ...toCss(style),
      },
      onFocus,
      onBlur,
      ...cleanProps(rest),
    };

    if (multiline) {
      return (
        <textarea
          {...shared}
          rows={4}
          onChange={(e: any) => onChangeText?.(e.target.value)}
        />
      );
    }

    return (
      <input
        {...shared}
        type={toInputType(keyboardType, secureTextEntry)}
        autoCapitalize={autoCapitalize === 'none' ? 'none' : undefined}
        onChange={(e: any) => onChangeText?.(e.target.value)}
        onClick={onPress}
        onKeyDown={(e: any) => {
          if (e.key === 'Enter') onSubmitEditing?.({ nativeEvent: { text: e.target.value } });
        }}
      />
    );
  }
);

export const pInput = TextInput;

/* ------------------------------------------------------------------ */
/* Lists                                                               */
/* ------------------------------------------------------------------ */

const renderNode = (node: any) => {
  if (!node) return null;
  if (React.isValidElement(node)) return node;
  if (typeof node === 'function') return React.createElement(node);
  return null;
};

export const FlatList = React.forwardRef(
  (
    {
      data,
      renderItem,
      keyExtractor,
      hideScrollbar,
      horizontal,
      numColumns = 1,
      ListHeaderComponent,
      ListFooterComponent,
      ListEmptyComponent,
      ItemSeparatorComponent,
      contentContainerStyle,
      columnWrapperStyle,
      onRefresh,
      refreshing,
      onEndReached,
      snapToInterval,
      className,
      style,
      ...rest
    }: any,
    ref: any
  ) => {
    const nodeRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => ({
      scrollToOffset() { },
      scrollToEnd() {
        const el = nodeRef.current;
        if (!el) return;
        if (horizontal) el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' });
        else el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
      },
      scrollToIndex({ index }: { index: number }) {
        const el = nodeRef.current;
        if (!el) return;
        const child = el.children[0]?.children[index] as HTMLElement | undefined;
        if (child) {
          if (horizontal) el.scrollTo({ left: child.offsetLeft, behavior: 'smooth' });
          else el.scrollTo({ top: child.offsetTop, behavior: 'smooth' });
        }
      },
      getScrollableNode: () => nodeRef.current,
    }));

    const items: any[] = Array.isArray(data) ? data : [];
    const keyOf = (item: any, index: number) => {
      if (keyExtractor) return String(keyExtractor(item, index));
      if (item && typeof item === 'object' && 'id' in item) return String(item.id);
      return String(index);
    };

    const children = items.map((item, index) => (
      <React.Fragment key={keyOf(item, index)}>{renderItem?.({ item, index })}</React.Fragment>
    ));

    const body = items.length ? children : renderNode(ListEmptyComponent);

    return (
      <div
        ref={nodeRef}
        className={mergeClass(horizontal ? 'overflow-x-auto' : 'overflow-y-auto',
          className)}
        style={{
          ...toCss(style),
          scrollSnapType: horizontal && snapToInterval ? 'x mandatory' : undefined,
          scrollbarWidth: hideScrollbar ? 'none' : undefined,
          scrollBehavior: 'smooth',
        }}
        onScroll={(e: any) => {
          if (!onEndReached) return;
          const el = e.currentTarget;
          if (horizontal) {
            if (el.scrollWidth - el.scrollLeft - el.clientWidth < 120) onEndReached();
          } else if (el.scrollHeight - el.scrollTop - el.clientHeight < 120) {
            onEndReached();
          }
        }}
        {...cleanProps(rest)}
      >
        <div
          className={mergeClass(numColumns > 1 && !horizontal ? 'app-responsive-grid' : '')}
          style={{
            display: numColumns > 1 && !horizontal ? 'grid' : 'flex',
            flexDirection: horizontal ? 'row' : 'column',
            ...toCss(contentContainerStyle),
            ...(!horizontal ? toCss(columnWrapperStyle) : {}),
          }}
        >
          {renderNode(ListHeaderComponent)}
          {body}
          {renderNode(ListFooterComponent)}
        </div>
      </div>
    );
  }
);

export const SectionList = ({
  sections,
  renderItem,
  renderSectionHeader,
  keyExtractor,
  ListHeaderComponent,
  ListFooterComponent,
  ListEmptyComponent,
  contentContainerStyle,
  className,
  style,
  ...rest
}: any) => {
  const list: any[] = Array.isArray(sections) ? sections : [];
  return (
    <div className={mergeClass('overflow-y-auto', className)} style={toCss(style)} {...cleanProps(rest)}>
      <div style={{ display: 'flex', flexDirection: 'column', ...toCss(contentContainerStyle) }}>
        {renderNode(ListHeaderComponent)}
        {list.length === 0
          ? renderNode(ListEmptyComponent)
          : list.map((section, si) => (
            <React.Fragment key={section.key ?? si}>
              {renderSectionHeader?.({ section })}
              {(section.data || []).map((item: any, ii: number) => (
                <React.Fragment
                  key={keyExtractor ? String(keyExtractor(item, ii)) : `${si}-${ii}`}
                >
                  {renderItem?.({ item, index: ii, section })}
                </React.Fragment>
              ))}
            </React.Fragment>
          ))}
        {renderNode(ListFooterComponent)}
      </div>
    </div>
  );
};

export const RefreshControl = ({ children }: any) => <>{children}</>;

/* ------------------------------------------------------------------ */
/* Modal                                                               */
/* ------------------------------------------------------------------ */

export const Modal = ({
  visible,
  transparent,
  animationType,
  onRequestClose,
  children,
  className,
  style,
  ...rest
}: any) => {
  if (!visible) return null;
  return createPortal(
    <div
      className="fixed inset-0 z-[100] items-center justify-center p-4"
      style={{ background: 'hsl(var(--overlay))' }}
      onClick={() => onRequestClose?.()}
      {...cleanProps(rest)}
    >
      <div
        className={mergeClass('max-h-full max-w-full', className)}
        style={toCss(style)}
        onClick={(e: any) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};

/* ------------------------------------------------------------------ */
/* Misc APIs                                                           */
/* ------------------------------------------------------------------ */

export const Alert = {
  alert(title?: string, message?: string, buttons?: any[]) {
    const text = [title, message].filter(Boolean).join('\n\n');
    if (buttons && buttons.length > 1) {
      const confirmed = window.confirm(text);
      if (confirmed) {
        const action = buttons.find((b) => b.style !== 'cancel') || buttons[buttons.length - 1];
        action?.onPress?.();
      } else {
        buttons.find((b) => b.style === 'cancel')?.onPress?.();
      }
      return;
    }
    if (buttons && buttons.length === 1) {
      window.alert(text);
      buttons[0]?.onPress?.();
      return;
    }
    window.alert(text);
  },
};

export const Platform = {
  OS: 'web' as const,
  Version: 0,
  isPad: false,
  isTV: false,
  select: (options: any) => options.web ?? options.default,
};

export const Dimensions = {
  get: (_dim?: string) => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
    scale: 1,
    fontScale: 1,
  }),
  addEventListener: (_type: string, handler: any) => {
    window.addEventListener('resize', handler);
    return { remove: () => window.removeEventListener('resize', handler) };
  },
};

export const useWindowDimensions = () => {
  const [dims, setDims] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  });
  useEffect(() => {
    const handler = () => setDims({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return { ...dims, scale: 1, fontScale: 1 };
};

export const PixelRatio = {
  get: () => (typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1),
  getFontScale: () => 1,
  roundToNearestPixel: (n: number) => Math.round(n),
};

export const StyleSheet = {
  create: (styles: any) => styles,
  flatten: flattenStyle,
  compose: (a: any, b: any) => [a, b],
  hairlineWidth: 1,
  absoluteFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  absoluteFillObject: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
};

export const Keyboard = {
  dismiss: () => {
    (document.activeElement as HTMLElement | null)?.blur?.();
  },
  addListener: (_event: string, _cb: any) => ({ remove: () => { } }),
  removeAllListeners: () => { },
  removeListener: () => { },
};

export const Linking = {
  openURL: async (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  },
  canOpenURL: async () => true,
  openSettings: async () => { },
  createURL: (path: string, options?: { scheme?: string }) =>
    `${options?.scheme || 'app'}://${String(path).replace(/^\/+/, '')}`,
  parse: (url: string) => {
    try {
      const parsed = new URL(url);
      const queryParams: any = {};
      parsed.searchParams.forEach((value, key) => {
        queryParams[key] = value;
      });
      return {
        scheme: parsed.protocol.replace(':', ''),
        hostname: parsed.hostname,
        path: parsed.pathname,
        queryParams,
      };
    } catch {
      return { scheme: null, hostname: null, path: null, queryParams: {} };
    }
  },
  addEventListener: (_type: string, _handler: any) => ({ remove: () => { } }),
  removeEventListener: () => { },
  getInitialURL: async () => null,
};

export const Switch = ({ value, onValueChange, disabled, className, style, ...rest }: any) => (
  <input
    type="checkbox"
    checked={!!value}
    disabled={disabled}
    onChange={(e: any) => onValueChange?.(e.target.checked)}
    className={mergeClass('cursor-pointer', className)}
    style={{ width: 20, height: 20, ...toCss(style) }}
    {...cleanProps(rest)}
  />
);

export const BackHandler = {
  addEventListener: (_event: string, _cb: any) => ({ remove: () => { } }),
  removeEventListener: () => { },
  exitApp: () => { },
};

export const findNodeHandle = () => null;

export const InteractionManager = {
  runAfterInteractions: (cb: any) => {
    const id = setTimeout(cb, 0);
    return { cancel: () => clearTimeout(id) };
  },
};

export const Vibration = { vibrate: () => { }, cancel: () => { } };

export const AppState = {
  currentState: 'active',
  addEventListener: (_type: string, _cb: any) => ({ remove: () => { } }),
};

export default {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  Image,
  ImageBackground,
  ScrollView,
  Scrolldiv,
  TextInput,
  pInput,
  FlatList,
  SectionList,
  Modal,
  Animated,
  Easing,
  Alert,
  Platform,
  Dimensions,
  useWindowDimensions,
  PixelRatio,
  StyleSheet,
  Keyboard,
  Linking,
  Switch,
  BackHandler,
  findNodeHandle,
  RefreshControl,
};
