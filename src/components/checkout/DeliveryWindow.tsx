import React from 'react';

export const DELIVERY_TIERS = [
    { maxKm: 0.5, label: '10 mins', text: 'text-delivery-600', dot: 'bg-delivery-500' },
    { maxKm: 2, label: '30 mins', text: 'text-delivery-600', dot: 'bg-delivery-500' }

] as const;

export interface DeliveryInfo {
    label: string;
    textClass: string;
    dotClass: string; 
}

/**
 * Formats distance measurement based on the value.
 * - Distance < 1km: Returns in meters (e.g., "500m")
 * - Distance >= 1km: Returns in kilometers (e.g., "1.5km")
 */
export const formatDistanceMeasurement = (distanceKm: number): string => {
    if (distanceKm < 1) {
        // Convert to meters and round to nearest meter
        const meters = Math.round(distanceKm * 1000);
        return `${meters}m`;
    } else {
        // Keep in kilometers with 1 decimal place
        return `${distanceKm.toFixed(1)}km`;
    }
};

/**
 * Calculates delivery estimate based on distance and order time.
 * - Distance <= 2km: Uses standard DELIVERY_TIERS (10 mins or 30 mins)
 * - Distance > 2km: Evaluates scheduled time windows
 */
export const calculateDeliveryWindow = (
    orderTime: string | Date | number,
    distanceKm: number
): DeliveryInfo => {
    // 1. Standard tier lookup for distances <= 2km
    if (distanceKm <= 2) {
        const tier = DELIVERY_TIERS.find((t) => distanceKm <= t.maxKm) || DELIVERY_TIERS[1];
        return {
            label: tier.label,
            textClass: tier.text,
            dotClass: tier.dot,
        };
    }

    // 2. Batch window logic for distances > 2km
    const date = new Date(orderTime);
    const totalMinutes = date.getHours() * 60 + date.getMinutes();

    const window1Start = 7 * 60;        // 07:00 AM
    const window1End = 11 * 60;         // 11:00 AM
    const window2Start = 13 * 60 + 1;   // 01:01 PM
    const window2End = 16 * 60;         // 04:00 PM

    // Window 1: 7:00 AM to 11:00 AM -> Delivery 11:30 AM - 1:00 PM
    if (totalMinutes >= window1Start && totalMinutes <= window1End) {
        const tier = DELIVERY_TIERS.find((t) => distanceKm > t.maxKm)!; // 1 hr tier styling
        return {
            label: '11:30 AM - 1:00 PM',
            textClass: tier.text,
            dotClass: tier.dot,
        };
    }

    // Window 2: 1:01 PM to 4:00 PM -> Delivery 4:00 PM - 5:00 PM
    if (totalMinutes >= window2Start && totalMinutes <= window2End) {
        const tier = DELIVERY_TIERS.find((t) => distanceKm > t.maxKm)!; // 1 hr tier styling
        return {
            label: '4:00 PM - 5:00 PM',
            textClass: tier.text,
            dotClass: tier.dot,
        };
    }

    // Fallback for orders outside scheduled windows (> 2km)
    const fallbackTier = DELIVERY_TIERS[1]; // Infinity / 3 hrs tier styling
    return {
        label: 'Next Available Batch',
        textClass: fallbackTier.text,
        dotClass: fallbackTier.dot,
    };
};

interface DeliveryTimeProps {
    orderTime: string | Date | number;
    distanceKm: number;
    className?: string;
    getDeliveryTime: (label: string) => void;
    isForNearbyProducts?: boolean;
    isForProductCard?: boolean;
}

const DeliveryTime: React.FC<DeliveryTimeProps> = ({
    orderTime,
    distanceKm,
    getDeliveryTime,
    className = '',
    isForNearbyProducts = false,
    isForProductCard = false,
}) => {
    const { label, textClass, dotClass } = calculateDeliveryWindow(orderTime, distanceKm);

    if (getDeliveryTime) {
        getDeliveryTime(label)
    }

    // Ultra-small text for productCard
    if (isForProductCard) {
        const formattedDistance = formatDistanceMeasurement(distanceKm || 0);
        return (
            <div className={`flex-row items-center gap-1 ${className}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
                <p className={`text-xs font-bold ${textClass || 'text-sand-900'}`}>
                    {label || '--'}
                </p>
                <p className="text-xs text-sand-500">
                    · {formattedDistance}
                </p>
            </div>
        );
    }

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <p className={`text-sand-500 font-medium uppercase tracking-wider mb-1 ${isForNearbyProducts ? 'text-xs' : 'text-sm'}`}>
                Estimated Delivery
            </p>
            <p className={`font-black mb-1 ${textClass || 'text-sand-900'} ${isForNearbyProducts ? 'text-lg' : 'text-3xl'}`}>
                {label || '-- mins'}
            </p>
            <p className={`text-sand-500 text-center ${isForNearbyProducts ? 'text-xs' : 'text-sm'}`}>
                Distance to shop: <p className={`font-bold text-sand-700 ${isForNearbyProducts ? 'text-xs' : ''}`}>{formatDistanceMeasurement(distanceKm || 0)}</p>
            </p>
        </div>
    );
};

export default DeliveryTime;