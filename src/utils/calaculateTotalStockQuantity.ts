import { ProductType } from "@/interfaces/interface";

   const calculateTotalStockQuantity = (product: ProductType): number => {
        let total = 0;

        // Safety check to ensure variants exists and is an array
        if (Array.isArray(product.variants)) {
            product.variants.forEach((variant) => {
                // Convert to number to prevent string concatenation bugs
                total += Number(variant.stock_quantity) || 0;
            });
        }

        return total;
    };
export default calculateTotalStockQuantity