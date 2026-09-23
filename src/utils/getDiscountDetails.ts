const getDiscountDetails = (originalPrice: number, discountAmount: number) => {
    if (!discountAmount || discountAmount <= 0) {
        return { finalPrice: originalPrice, percentOff: null };
    }
    const finalPrice = Math.max(0, originalPrice - discountAmount);
    const percentOff = Math.round((discountAmount / originalPrice) * 100);
    console.log('the percent off', percentOff)
    return { finalPrice, percentOff };
};

export default getDiscountDetails