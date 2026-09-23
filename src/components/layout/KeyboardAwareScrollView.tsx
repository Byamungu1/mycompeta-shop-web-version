/**
 * react-native-keyboard-aware-scroll-view → scroll container.
 *
 * There is no on-screen keyboard on the web, so the imperative
 * `scrollToFocusedInput` just scrolls the target into view.
 */
import React, { useImperativeHandle, useRef } from 'react';

export const KeyboardAwareScrollView = React.forwardRef(
  ({ children, className, style, contentContainerStyle, ...rest }: any, ref: any) => {
    const nodeRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      scrollToFocusedInput(node: any, _extra?: number) {
        try {
          node?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
        } catch {
          /* ignore */
        }
      },
      scrollToEnd() {
        nodeRef.current?.scrollTo({ top: nodeRef.current.scrollHeight });
      },
      getScrollableNode: () => nodeRef.current,
    }));

    return (
      <div
        ref={nodeRef}
        className={`overflow-y-auto ${className || ''}`}
        style={style}
        {...rest}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            ...contentContainerStyle,
          }}
        >
          {children}
        </div>
      </div>
    );
  }
);

export const KeyboardAwareScrolldiv = KeyboardAwareScrollView;

export default { KeyboardAwareScrollView };
