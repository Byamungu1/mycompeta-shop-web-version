import { useEffect, useRef } from 'react';
import { Animated } from '@/components/common/ui';

interface StatisticCardSkeletonProps {
    /** If true, renders the skeleton for the Action Button variant. Otherwise renders the standard metric card skeleton. */
    isActionButton?: boolean;
}

export const StatisticCardSkeleton = ({ isActionButton = false }: StatisticCardSkeletonProps) => {
    const opacity = useRef(new Animated.Value(0.3)).current;

    // Pulse animation for smooth skeleton loading
    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.3,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        );
        animation.start();

        return () => animation.stop();
    }, [opacity]);

    // ─── SKELETON FOR ACTION BUTTON VARIANT ───
    if (isActionButton) {
        return (
            <div className="flex flex-row items-center justify-center bg-sand-200/50 rounded-lg p-3">
                <Animated.div
                    style={{ opacity }}
                    className="bg-sand-300 h-8 w-8 rounded-full mr-2"
                />
                <Animated.div
                    style={{ opacity }}
                    className="bg-sand-300 h-5 w-28 rounded-md"
                />
            </div>
        );
    }

    // ─── SKELETON FOR STANDARD DATA/METRIC CARD VARIANT ───
    return (
        <div className="flex flex-col bg-sand-100 border border-brand-200 rounded-lg p-3">
            {/* Top Row Skeleton: Icon + Title */}
            <div className="px-2 py-1 flex-row items-center justify-between">
                <Animated.div
                    style={{ opacity }}
                    className="bg-sand-300 h-5 w-5 rounded-full"
                />
                <Animated.div
                    style={{ opacity }}
                    className="bg-sand-300 h-4 w-24 rounded-md"
                />
            </div>

            {/* Middle Row Skeleton: Label & Number/Amount */}
            <div className="mt-3 flex-row items-center justify-between px-2">
                <div className="space-y-2">
                    <Animated.div
                        style={{ opacity }}
                        className="bg-sand-300 h-3 w-16 rounded-md mb-1"
                    />
                    <Animated.div
                        style={{ opacity }}
                        className="bg-sand-300 h-3 w-20 rounded-md"
                    />
                </div>

                <Animated.div
                    style={{ opacity }}
                    className="bg-sand-300 h-6 w-12 rounded-md"
                />
            </div>

            {/* Bottom Row Skeleton: Customer & CreatedAt Meta */}
            <div className="mt-3 pt-2 border-t border-brand-200 flex-row items-center justify-between px-2">
                <Animated.div
                    style={{ opacity }}
                    className="bg-sand-300 h-3 w-28 rounded-md"
                />
                <Animated.div
                    style={{ opacity }}
                    className="bg-sand-300 h-3 w-14 rounded-md"
                />
            </div>
        </div>
    );
};
