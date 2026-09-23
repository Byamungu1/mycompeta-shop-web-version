
export const getShippingAddress = (shippingInfo: any)=>{
        const kakuma = shippingInfo.address.kakuma
        const block = shippingInfo.address.block 
        const zone = shippingInfo.address.zone

        return `${kakuma}, ${zone}, ${block}`
    }