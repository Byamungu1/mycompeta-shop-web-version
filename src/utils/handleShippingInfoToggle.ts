import useShippingInfo from "@/hooks/useShippingInfo";

export const handleToggle = (index: number) => {
    const { setShippingInfo } = useShippingInfo();
    setShippingInfo(prev =>
        prev.map((item, i) =>
            i === index
                ? { ...item, isOpen: !item.isOpen }
                : { ...item, isOpen: false }
        )
    );
};

