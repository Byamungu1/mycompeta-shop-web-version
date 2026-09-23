import { useDelete } from '@/hooks/useApi';
import { ProductType } from '@/interfaces/interface';
import { deleteSellerProduct } from '@/services/products';
import calculateTotalStockQuantity from '@/utils/calaculateTotalStockQuantity';
import handleDeleteProduct from '@/utils/delete';
import { useRouter } from '@/router';
import { TouchableOpacity } from '@/components/common/ui';

const ProductCard = ({ product, refetch }: { product: ProductType, refetch: () => void }) => {
    const { execute } = useDelete(() => deleteSellerProduct(product.id));
    const router = useRouter();

    const totalStock = calculateTotalStockQuantity(product);
     console.log('the products imgs', product.imgs?.[0]?.img)
   
    const imgUri = product.images?.[0]?.image;

    return (
        <div
            className="flex-1 px-2 py-3 rounded-md bg-sand-200"
            style={{ gap: 10 }}
        >
            {/* Clickable Product Info (Navigates to Detail div) */}
            <TouchableOpacity 
                onPress={() => router.push(`/sellerProduct/${product.id}`)}
                activeOpacity={0.7}
            >
                <div className="w-full h-40 rounded-xs overflow-hidden bg-gray-100 mb-2">
                    {imgUri ? (
                        <img
                            className="w-full h-full"
                            resizeMode="contain"
                            src={imgUri}
                        />
                    ) : (
                        <div className="w-full h-full items-center justify-center bg-sand-300">
                            <p className="text-xs text-sand-600 font-jakarta">No img</p>
                        </div>
                    )}
                </div>

                <div className="flex-col flex" style={{ gap: 3 }}>
                    <p
                        numberOfLines={2}
                        className="text-md font-jakarta-semibold text-sand-700"
                    >
                        {product.name}
                    </p>

                    <p className="font-dm-mono-italic text-md text-brand-800">
                        KES.{product.price}
                    </p>

                    <p className="font-jakarta text-xs">
                        {totalStock > 0 ? `Stock ${totalStock}` : 'Out of Stock'}
                    </p>
                </div>
            </TouchableOpacity>

            {/* Action Buttons (Separated from product click target) */}
            <div className="flex flex-row items-center justify-between mt-1">
                <TouchableOpacity
                    onPress={() => router.push(`/sellerProduct/${product.id}`)}
                    className="bg-brand-500 px-5 py-1 rounded-lg"
                >
                    <p className="text-sand-50 font-dm-mono text-xs">Edit</p>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={async () => await handleDeleteProduct(execute, refetch, product.id, false)}
                    className="bg-market-500 px-4 py-1 rounded-lg"
                >
                    <p className="text-sand-50 font-dm-mono text-xs">Delete</p>
                </TouchableOpacity>
            </div>
        </div>
    );
};

export default ProductCard;