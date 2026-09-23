import { ToastBannerProps } from '@/interfaces/interface';
import { CheckCircle, X, XCircle } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Animated, TouchableOpacity } from '@/components/common/ui';
import { SafeAreadiv } from '@/components/layout/SafeArea';

export default function ToastBanner({ visible, message, type, onClose, duration = 3000 }: ToastBannerProps) {
  const slideAnim = useRef(new Animated.Value(-200)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset animations
      slideAnim.setValue(-200);
      fadeAnim.setValue(0);
      progressAnim.setValue(0);

      // Parallel animations for smooth entrance
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Progress bar animation
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: duration,
        useNativeDriver: false,
      }).start();

      // Auto-hide timer
      const timer = setTimeout(() => {
        handleDismiss();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      slideAnim.setValue(-200);
      fadeAnim.setValue(0);
      progressAnim.setValue(0);
    }
  }, [visible, duration]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -200,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  if (!visible) return null;

  const isSuccess = type === 'success';
  const bgColor = isSuccess ? 'bg-delivery-500' : 'bg-market-500';
  const Icon = isSuccess ? CheckCircle : XCircle;

  return (
    <div className="absolute top-0 left-0 right-0 z-[9999]">
      <SafeAreadiv>
        <Animated.div
          className={`mx-4 ${bgColor} rounded-lg shadow-2xl overflow-hidden`}
          style={{
            transform: [{ translateY: slideAnim }],
            opacity: fadeAnim,
          }}
        >
          <div className="flex-row items-center px-4 py-4">
            {/* Icon */}
            <div className="mr-3">
              <Icon size={24} color="white" />
            </div>

            {/* Message */}
            <div className="flex-1 mr-3">
              <p className="text-white text-base font-semibold leading-tight">
                {isSuccess ? 'Success' : 'Error'}
              </p>
              <p className="text-white/90 text-sm mt-1 leading-relaxed">
                {message}
              </p>
            </div>

            {/* Close Button */}
            <TouchableOpacity
              onPress={handleDismiss}
              className="p-1 active:opacity-70"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={20} color="white" />
            </TouchableOpacity>
          </div>

          {/* Progress Bar */}
          <Animated.div
            className="h-1 bg-white/30"
            style={{
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['100%', '0%'],
              }),
            }}
          />
        </Animated.div>
      </SafeAreadiv>
    </div>
  );
}