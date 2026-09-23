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
    className={`bg-sand-300/80 rounded-xl ${className || ''}`}
    style={[{ opacity }, style]}
  />
);

export const OrderCardSkeleton = () => {
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
    <div className="bg-white border border-sand-200 rounded-lg p-4" style={{ gap: 12 }}>
      {/* Top Header — Package Icon + Order Info + Status Pill */}
      <div className="flex flex-row items-start justify-between">
        <div className="flex flex-row items-center" style={{ gap: 8 }}>
          <SkeletonBox opacity={pulseAnim} className="w-9 h-9 rounded-xl" />
          <div style={{ gap: 6 }}>
            <SkeletonBox opacity={pulseAnim} className="w-24 h-3.5" />
            <SkeletonBox opacity={pulseAnim} className="w-32 h-3" />
            <SkeletonBox opacity={pulseAnim} className="w-20 h-2.5 mt-0.5" />
          </div>
        </div>
        <SkeletonBox opacity={pulseAnim} className="w-20 h-6 rounded-full" />
      </div>

      {/* Total Bill Box */}
      <div className="flex flex-row justify-between items-center bg-sand-300/40 p-3 rounded-xl border border-sand-300/70">
        <SkeletonBox opacity={pulseAnim} className="w-16 h-3.5" />
        <SkeletonBox opacity={pulseAnim} className="w-24 h-4" />
      </div>

      {/* Action Buttons Placeholders (Accept / Reject) */}
      <div className="flex flex-row items-center justify-between pt-1">
        <SkeletonBox opacity={pulseAnim} className="w-[48%] h-9 rounded-lg" />
        <SkeletonBox opacity={pulseAnim} className="w-[48%] h-9 rounded-lg" />
      </div>

      {/* Divider Line */}
      <div className="h-px bg-sand-300/60" />

      {/* Bottom Row — Time + Toggle Button */}
      <div className="flex flex-row items-center justify-between">
        <SkeletonBox opacity={pulseAnim} className="w-28 h-3" />
        <SkeletonBox opacity={pulseAnim} className="w-16 h-6 rounded-xl" />
      </div>
    </div>
  );
};

// ─── Stack Wrapper for Loading States ────────────────────────────────────────

export const OrderCardsSkeletonList = ({ count = 3 }: { count?: number }) => {
  return (
    <div style={{ gap: 12 }} className="px-4 py-2">
      {Array.from({ length: count }).map((_, idx) => (
        <OrderCardSkeleton key={idx} />
      ))}
    </div>
  );
};

export default OrderCardSkeleton;