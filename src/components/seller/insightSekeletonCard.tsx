import { useEffect, useRef } from 'react';
import { Animated } from '@/components/common/ui';

const SkeletonBox = ({
  className,
  style,
  opacity,
}: {
  className?: string;
  style?: any;
  opacity: Animated.Value;
}) => (
  <Animated.div
    className={`bg-sand-300/80 rounded ${className || ''}`}
    style={[{ opacity }, style]}
  />
);

export const InsightCardSkeleton = ({
  uniqueUi = false,
}: {
  uniqueUi?: boolean;
}) => {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, [pulseAnim]);

  return (
    <div className="flex-1 bg-sand-200 rounded-sm p-3" style={{ gap: 8 }}>
      {/* Icon Wrapper Placeholder */}
      <SkeletonBox opacity={pulseAnim} className="w-8 h-8 rounded-xl" />

      {/* Content Area */}
      <div style={{ gap: 2 }}>
        {/* Label Placeholder */}
        <SkeletonBox opacity={pulseAnim} className="w-16 h-3" />

        {/* Primary Value Placeholder */}
        <SkeletonBox opacity={pulseAnim} className="w-24 h-4 my-0.5" />

        {/* Conditional UI Rendering */}
        {uniqueUi ? (
          <div
            className="mt-1 pt-1.5 border-t flex flex-col border-sand-300"
            style={{ gap: 4 }}
          >
            {/* Order Identifier & Total */}
            <div className="flex-col justify-between items-start" style={{ gap: 4 }}>
              <SkeletonBox opacity={pulseAnim} className="w-14 h-3.5 rounded" />
              <SkeletonBox opacity={pulseAnim} className="w-20 h-3.5" />
            </div>

            {/* Order Date */}
            <div className="flex-row justify-between items-center">
              <SkeletonBox opacity={pulseAnim} className="w-12 h-2.5" />
            </div>
          </div>
        ) : (
          /* Default fallback subtext UI */
          <SkeletonBox opacity={pulseAnim} className="w-20 h-3 mt-0.5" />
        )}
      </div>
    </div>
  );
};

export default InsightCardSkeleton;