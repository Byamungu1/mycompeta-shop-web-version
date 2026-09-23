import { ProductType } from '@/interfaces/interface'

const OrderimgsDisplayer = ({product}: {product: ProductType}) => {
    console.log('order image is order image dis', product?.images?.[0]?.image)
    return (
        <div key={product.id} className="flex-row gap-2 h-40 rounded-sm overflow-hidden border border-sand-200">
            <img
                src={product?.image_url}
                className="w-32 h-32"
                resizeMode="cover"
            />
            <div className="flex-col gap-2">
                <p className="text-sand-600 text-sm font-jakarta-bold">
                    {product.product_name}
                </p>
                <p className="text-sand-600 text-sm font-jakarta-bold">
                    Price: KES {Number(product.unit_price).toFixed(0)}
                </p>
                <p className="text-sand-600 text-xs font-jakarta-bold">
                    Qty: {product.quantity}
                </p>
                <p className="text-sand-600 text-xs font-jakarta-bold">
                    Size: {product.size}
                </p>
                <p className="text-sand-600 text-xs font-jakarta-bold">
                    Color: {product.color}
                </p>
                 {product.discount > 0 && <p className="text-sand-600 text-xs font-jakarta-bold">
                    discount: {product.discount}
                </p>}
                
            </div>
        </div>
    )
}

export default OrderimgsDisplayer