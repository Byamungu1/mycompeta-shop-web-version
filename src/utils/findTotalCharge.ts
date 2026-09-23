import { CartItemType } from "@/interfaces/types/types"

export const findTotalCharge = (items: CartItemType[]) => {
    const totalItems = items.reduce((acc, item) => acc + item.quantity, 0)
    const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0)
    const totalDiscount = items.reduce((acc, item) => acc + ((item.discount || 0) * item.quantity), 0)
    const deliveryFee = 0 // Zero delivery charges (bicycle dispatch!)
    const finalTotal = Math.max(0, subtotal - totalDiscount + deliveryFee)

    const result = {
        totalItems: totalItems,
        finalTotal: finalTotal, 
        subtotal: subtotal, deliveryFee: deliveryFee, 
        totalDiscount: totalDiscount}
    return result
}