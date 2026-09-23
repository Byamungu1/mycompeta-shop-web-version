import { useRouter } from '@/router';
import { Plus } from 'lucide-react';
import { TouchableOpacity } from '@/components/common/ui';

interface StatisticCardProps {
    title: string;
    num?: number;
    Icon?: React.ComponentType<{ size: number; className: string }>;
    label: string;
    moneyLebal?: string;
    amount?: number;
    stockAltert?: boolean;
    createdAt?: string; // Made optional to prevent breaking standard metrics
    customer?: string;  // Made optional to prevent breaking standard metrics
}


const StatisticCard = ({
    title,
    num,
    Icon,
    label,
    moneyLebal,
    amount,
    stockAltert,
    customer,
    createdAt,
}: StatisticCardProps) => {
    const router = useRouter();
    const foundTitle = title?.trim().replace(' ', '').toLocaleLowerCase();

    const handleOnpress = () => {
        if (foundTitle?.includes('add')) router.push('/sellerProduct/addProduct/');
        if (foundTitle?.includes('view')) null;
        if (foundTitle?.includes('manage')) null;
    };

    // ─── ACTION BUTTON VARIANT ───
    if (foundTitle?.includes('add')
        || foundTitle?.includes('view')
        || foundTitle?.includes('manage')) {
        return (
            <TouchableOpacity
                onPress={handleOnpress}
                className='flex items-center flex-row justify-center bg-brand-500 rounded-lg p-3'
                style={{ gap: 8 }}
            >
                <div className="bg-brand-600 h-8 w-8 p-2 rounded-full items-center justify-center">
                    <Plus size={24} className='text-sand-100' />
                </div>
                <p className='text-lg text-center font-jakarta-bold text-sand-100'>{title}</p>
            </TouchableOpacity>
        );
    }

    // ─── STANDARD DATA/METRIC CARD VARIANT ───
    return (
        <div className='flex flex-col bg-white border border-sand-200 rounded-lg p-4 shadow-sm min-h-[132px]'>

            {/* Top row: Icon and Card Title */}
            <div className='bg-transparent px-2 py-1 flex-row items-center justify-between rounded-lg'>
                {Icon && (<Icon size={20} className='text-sand-600' />)}
                <p
                    numberOfLines={2}
                    className='text-sm whitespace-wrap font-jakarta-bold text-info-600'
                >
                    {title}
                </p>
            </div>

            {/* Middle row: Data Values & Stock Metrics */}
            <div className='mt-2 flex-row items-center justify-between px-2'>
                <div>
                    <p className='text-xs font-jakarta-medium text-sand-700'>{label}</p>
                    {amount !== undefined && <p className='text-xs font-jakarta-semibold text-sand-700'>KES.{amount}</p>}
                </div>

                {stockAltert && (
                    <div>
                        <p className='text-sm font-jakarta-semibold text-red-500'>Only {num} left</p>
                        <TouchableOpacity className="bg-brand-700 px-3 flex items-center justify-center rounded-lg py-1 mt-2">
                            <p className='text-sm font-jakarta-semibold text-brand-400'>Restock</p>
                        </TouchableOpacity>
                    </div>
                )}

                {!stockAltert && (
                    <p className='text-lg font-jakarta-bold text-sand-600'>
                        {moneyLebal ? (label !== 'Revenue' ? `${moneyLebal}.${num}` : num) : num}
                    </p>
                )}
            </div>

            {/* Bottom Row: Order Meta Data (Only displays if it is a Recent Order layout item) */}
            {(customer || createdAt) && (
                <div className="mt-3 pt-2 border-t border-sand-200 flex-row items-center justify-between px-2">
                    {customer && (
                        <div className="flex-row items-center">
                            <p className="text-[11px] font-jakarta-medium text-sand-500">Client: </p>
                            <p className="text-[11px] font-jakarta-semibold text-sand-800" numberOfLines={1}>
                                {customer}
                            </p>
                        </div>
                    )}
                    {createdAt && (
                        <p className="text-[10px] font-jakarta-medium text-sand-400">
                            {createdAt}
                        </p>
                    )}
                </div>
            )}

        </div>
    );
};

export default StatisticCard;