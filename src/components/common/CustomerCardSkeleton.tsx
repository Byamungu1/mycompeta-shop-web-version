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

export const CustomerCardSkeleton = () => {
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
    <div
      className="flex flex-row items-center bg-sand-100 rounded-lg px-3 py-3"
      style={{ gap: 12 }}
    >
      {/* Avatar Circle Placeholder */}
      <SkeletonBox opacity={pulseAnim} className="w-11 h-11 rounded-full" />

      {/* Middle p Info Block */}
      <div className="flex-1" style={{ gap: 6 }}>
        {/* Customer Full Name */}
        <SkeletonBox opacity={pulseAnim} className="w-32 h-4" />

        {/* Sub-row: Orders Count & Total Spent */}
        <div className="flex flex-row items-center" style={{ gap: 10 }}>
          <SkeletonBox opacity={pulseAnim} className="w-16 h-3" />
          <div className="w-1 h-1 rounded-full bg-sand-300" />
          <SkeletonBox opacity={pulseAnim} className="w-20 h-3" />
        </div>
      </div>

      {/* Chevron Icon Placeholder */}
      <SkeletonBox opacity={pulseAnim} className="w-4 h-4 rounded-md" />
    </div>
  );
};

// ─── Stack Wrapper for Loading States ────────────────────────────────────────

export const CustomerCardSkeletonList = ({ count = 4 }: { count?: number }) => {
  return (
    <div style={{ gap: 10 }}>
      {Array.from({ length: count }).map((_, idx) => (
        <CustomerCardSkeleton key={idx} />
      ))}
    </div>
  );
};

export default CustomerCardSkeleton;