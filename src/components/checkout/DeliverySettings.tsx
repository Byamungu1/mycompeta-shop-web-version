import Slider from '@/components/common/Slider';
import { useState } from 'react';

// Added a backendValue field to make it clean for your Django DecimalField
const DELIVERY_TIERS = [
    { label: '500 m', price: 'Free', backendValue: '0.5' },
    { label: '4 km',  price: '49',    backendValue: '4.0' },
    { label: '10 km', price: '79',    backendValue: '10.0' },
    { label: '15 km', price: '99',    backendValue: '15.0' },
];

interface DeliverySettingsSegmentProps {
    onRadiusChange?: (radius: string) => void;
}

export default function DeliverySettingsSegment({ onRadiusChange }: DeliverySettingsSegmentProps) {

    // Track the current step index (0 to 3)
    const [tierIndex, setTierIndex] = useState(0);

    const currentTier = DELIVERY_TIERS[tierIndex];

    // Callback handler wrapper
    const handleSliderChange = (val: number) => {
        setTierIndex(val);
        
        // Trigger the callback function with the clean backend value if provided
        if (onRadiusChange) {
            onRadiusChange(DELIVERY_TIERS[val].backendValue);
        }
    };

    return (
        <div className="bg-sand-200 rounded-sm">
            {/* Delivery Toggle Row */}

            {/* ─── STEPPED RADIUS DRAGGER ─── */}
            <div className="bg-white border border-sand-200 rounded-lg p-4" style={{ gap: 16 }}>
                
                {/* Metrics Readout Display */}
                <div className="flex flex-row justify-between items-center border-b border-brand-300 pb-3">
                    <div style={{ gap: 2 }}>
                        <p className="font-jakarta-bold text-xs text-brand-500 uppercase tracking-wider">Delivery Radius</p>
                        <p className="font-jakarta-bold text-lg text-sand-900">{currentTier.label}</p>
                    </div>
                    <div className="items-end" style={{ gap: 2 }}>
                        <p className="font-jakarta text-xs text-sand-500 uppercase tracking-wider">Delivery Fee</p>
                        <p className="font-jakarta-bold text-lg text-info-500">
                            {currentTier.price === 'Free' ? 'Free' : `KES ${currentTier.price}`}
                        </p>
                    </div>
                </div>

                {/* Draggable Slider Track */}
                <div>
                    <Slider
                        style={{ width: '100%', height: 40 }}
                        minimumValue={0}
                        maximumValue={DELIVERY_TIERS.length - 1}
                        step={1} // Snaps strictly to our defined integer tiers
                        value={tierIndex}
                        onValueChange={handleSliderChange}
                        minimumTrackTintColor="#D97706" // Warm brand amber track color
                        maximumTrackTintColor="#CBD5E1"
                        thumbTintColor="#F59E0B" // Premium active slider knob
                    />
                    
                    {/* Custom Axis Labels under the slider track */}
                    <div className="flex flex-row justify-between px-2 mt-1">
                        {DELIVERY_TIERS.map((tier, idx) => (
                            <p 
                                key={idx} 
                                className={`font-jakarta text-[10px] ${
                                    idx === tierIndex ? 'font-jakarta-bold text-brand-700' : 'text-sand-400'
                                }`}
                            >
                                {tier.label}
                            </p>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}