  const updateAddress = (locatinName: string, setFormData: (prev: any)=> void) => {
        const parts = locatinName.split(',').map(part => part.trim())
        if (parts.length >= 3) {
            setFormData(prev => ({
                ...prev,
                address: {
                    ...prev.address,
                    kakuma: parts[0],
                    zone: parts[1],
                    block: parts[2]
                }
            }))
        }
    }

export default updateAddress
