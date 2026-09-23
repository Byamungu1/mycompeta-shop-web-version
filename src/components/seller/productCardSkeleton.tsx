import { useEffect, useRef } from 'react';
import { Animated } from '@/components/common/ui';

export const ProductCardSkeleton = () => {
    const fadeAnim = useRef(new Animated.Value(0.4)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(fadeAnim, {
                    toValue: 0.9,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 0.4,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        );
        animation.start();

        return () => animation.stop();
    }, [fadeAnim]);

    return (
        <Animated.div
            style={{ opacity: fadeAnim, gap: 10 }}
            className="flex-1 px-2 py-3 rounded-md bg-sand-200"
        >
            {/* img Placeholder Skeleton */}
            <div className="w-full h-40 rounded-xs bg-sand-300" />

            {/* Details Placeholder Skeleton */}
            <div className="flex-col flex" style={{ gap: 6 }}>
                {/* Title Lines */}
                <div className="h-4 bg-sand-300 rounded-sm w-11/12" />
                <div className="h-4 bg-sand-300 rounded-sm w-3/4" />

                {/* Price Label */}
                <div className="h-4 bg-sand-300 rounded-sm w-1/2 mt-1" />

                {/* Stock Quantity Label */}
                <div className="h-3 bg-sand-300 rounded-sm w-2/5" />

                {/* Action Buttons Row Skeleton (Edit & Delete) */}
                <div className="flex flex-row items-center justify-between mt-1">
                    {/* Edit Button Placeholder */}
                    <div className="bg-sand-300 w-14 h-6 rounded-lg" />
                    
                    {/* Delete Button Placeholder */}
                    <div className="bg-sand-300 w-16 h-6 rounded-lg" />
                </div>
            </div>
        </Animated.div>
    );
};

export default ProductCardSkeleton;