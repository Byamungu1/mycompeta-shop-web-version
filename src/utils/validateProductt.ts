import { ProductType } from "@/interfaces/interface";
import { Variant } from "@/interfaces/interface";

export const validateProduct = (
  product: ProductType,
  selectedVariant: Variant | null |undefined = null
) => {
  const directAddCategories = [
    "Electronics & Gadgets",
    "Food & Groceries",
    "Home & Living",
    "Local Services",
  ];

  // Helper to get total stock across all variants for direct-add items
  const totalVariantStock = product?.variants?.reduce(
    (sum, v) => sum + (v.stock_quantity ?? 0),
    0
  ) ?? 0;

  // 1. Categories that DO NOT require explicit variant selection before adding to cart
  if (directAddCategories.includes(product.category || product.category_name)) {

    return {
      success: true,
      itemToAdd: {
        productId: product.id,
        name: product.name,
        price: product.price,
        variant: selectedVariant || null,
      },
    };
  }

  // 2. Logic specific to 'Clothing & Apparel'
  if ((product.category || product.category_name) === "Clothing & Apparel") {

    // Condition 2: If total stock is not >= 1, check if the specific selected variant exists & has stock >= 1
    if (selectedVariant && Object.keys(selectedVariant).length > 0) {
      const matchingVariant = product.variants?.length ? product.variants?.find(
        (v) => v.size === selectedVariant?.size && v.color === selectedVariant?.color
      ) : product?.product_variants?.find(
        (v) => v.size === selectedVariant?.size && v.color === selectedVariant?.color
      )

      console.log('the matching variant', matchingVariant)

      if (matchingVariant && matchingVariant?.stock_quantity >= 1) {
        return {
          success: true,
          itemToAdd: {
            productId: product.id,
            name: product.name,
            price: selectedVariant.price ?? product.price,
            variant: selectedVariant,
          },
        };
      }


    if (matchingVariant && (Object.keys(matchingVariant).length > 1)) {
       return {
          success: true,
          itemToAdd: {
            productId: product.id,
            name: product.name,
            price: selectedVariant.price ?? product.price,
            variant: selectedVariant,
          },
    } 
       
    };

    console.log('the selected variant in the actual function', selectedVariant)
      
      return { success: false, message: "Selected variant is out of stock." };
    }



    return {
      success: false,
      message: "Product is out of stock or requires a valid variant selection.",
    };
  }

  return {
    success: false,
    message: "Invalid product category or conditions not met.",
  };
};