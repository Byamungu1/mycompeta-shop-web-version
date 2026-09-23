import { RefreshCw } from 'lucide-react'; // or your icon library
import { ActivityIndicator, TouchableOpacity } from '@/components/common/ui';

interface RefetchDataProps {
  handleRefresh: () => void;
  isRefreshing: boolean;
}

export default function RefetchData({ handleRefresh, isRefreshing }: RefetchDataProps) {
  const handlePress = () => {
    console.log('RefetchData button pressed, isRefreshing:', isRefreshing)
    if (!isRefreshing) {
      handleRefresh()
    }
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isRefreshing}
      className="w-7 h-10 bg-sand-100 rounded-full items-center justify-center"
      style={{ opacity: isRefreshing ? 0.5 : 1 }}
    >
      {isRefreshing ? (
        <ActivityIndicator size="small" color="#F59E0B" />
      ) : (
        <RefreshCw size={20} color="#1E293B" />
      )}
    </TouchableOpacity>
  );
}