
export const calculateDiscountPercentage = (price: string, discount:string) => {

    const hasDiscount = discount && Number(discount) > 0;

    const discountedPrice = hasDiscount && price
        ? (Number(price) * (1 - Number(discount) / 100)).toFixed(0)
        : null;

        return discountedPrice
}
