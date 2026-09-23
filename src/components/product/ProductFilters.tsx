import { Order } from "@/interfaces/interface";
import { useState } from "react";
import { FlatList, TouchableOpacity } from "@/components/common/ui";

export type FilterTab = string;

// Helper to reliably extract key & label regardless of structure passed
const getTabDetails = (tab: any): { key: string; label: string } => {
    if (!tab) return { key: 'all', label: 'All' };

    // Case 1: Standard Category Object with slug and name
    if (tab.slug && tab.name) {
        return { key: tab.slug, label: tab.name };
    }

    // Case 2: Object with explicit key & label properties
    if (tab.key && tab.label) {
        return { key: tab.key, label: tab.label };
    }

    // Case 3: Key-value pair style object, e.g. { pending: 'Pending' }
    if (typeof tab === 'object') {
        const entries = Object.entries(tab);
        if (entries.length > 0) {
            const [key, label] = entries[0];
            return { key, label: String(label) };
        }
    }

    // Fallback if raw string or unknown
    const strVal = String(tab);
    return { key: strVal.toLowerCase(), label: strVal };
};

/* -------------------------------------------------------------------------- */
/*                               Pill Component                               */
/* -------------------------------------------------------------------------- */

const CategoryPill = ({
    label,
    active,
    onPress,
    count
}: {
    label: string;
    active: boolean;
    onPress: () => void;
    count: number;
}) => (
    <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        className={`flex flex-row items-center px-3 py-2 rounded-md ${
            active ? 'bg-brand-500' : 'bg-white border border-sand-200'
        }`}
        style={{ gap: 6 }}
    >
        <p className={`text-[10px] sm:text-xs font-jakarta-bold ${active ? 'text-sand-950' : 'text-sand-600'} truncate max-w-[120px] sm:max-w-[150px]`}>
            {label}
        </p>
        {count > 0 && (
            <div className={`px-1.5 py-0.5 rounded-md items-center justify-center flex-shrink-0 ${
                active ? 'bg-sand-950/10' : 'bg-sand-100'
            }`}>
                <p className={`text-[10px] font-jakarta-bold ${active ? 'text-sand-950' : 'text-sand-600'}`}>
                    {count}
                </p>
            </div>
        )}
    </TouchableOpacity>
);

/* -------------------------------------------------------------------------- */
/*                              Filters Component                             */
/* -------------------------------------------------------------------------- */

interface FilterProps {
    filters: any[]; 
    items?: Order[];
    onCategoryChange: (key: string) => void;
}

const Filters = ({ filters, items = [], onCategoryChange }: FilterProps) => {
    const [activeKey, setActiveKey] = useState<FilterTab>('all');

    const countFor = (key: string): number => {
        if (!items || items.length === 0) return 0;

        // "all" shows total items count
        if (key === 'all') {
            return items.length;
        }

        // Filter based on item status or category matching key
        return items.filter(item => 
            item.status?.toLowerCase() === key.toLowerCase() || 
            (item as any).category === key
        ).length;
    };

    return (
        <FlatList
            data={filters}
            renderItem={({ item: rawTab, index }) => {
                const { key, label } = getTabDetails(rawTab);
                const count = countFor(key);
                const isActive = activeKey === key;

                return (
                    <CategoryPill
                        key={index}
                        label={label}
                        active={isActive}
                        count={count}
                        onPress={() => {
                            setActiveKey(key);
                            if (onCategoryChange) {
                                onCategoryChange(key);
                            }
                        }}
                    />
                );
            }}
            keyExtractor={(item, index) => {
                const { key } = getTabDetails(item);
                return `${key}-${index}`;
            }}
            horizontal
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            bounces={false}
            contentContainerStyle={{ gap: 8, paddingHorizontal: 4 }}
            style={{ marginBottom: 4 }}
        />
    );
};

export default Filters;