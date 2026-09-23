import { OfflineBannerProps } from '@/interfaces/interface';
import { useEffect, useRef } from 'react';
import { Animated, Platform } from '@/components/common/ui';
import { SafeAreadiv } from '@/components/layout/SafeArea';

export default function OfflineBanner({ visible }: OfflineBannerProps) {
  const slideAnim = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 100,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible) return null;

  const paddingY = Platform.OS === 'ios' ? 'py-3' : 'py-4';

  return (
    <Animated.div
      className={`absolute bottom-0 inset-x-0 px-2 ${paddingY} z-[9999] shadow-md elevation-5 rounded-t-xl bg-red-600`}
      style={{ transform: [{ translateY: slideAnim }] }}
    >
      <SafeAreadiv>
        <p className="text-white text-[15px] font-semibold text-center">
          ⚠️  No Internet Connection
        </p>
        <p className="text-white/90 text-[13px] text-center mt-1">
          Please check your network settings
        </p>
      </SafeAreadiv>
    </Animated.div>
  );
}
