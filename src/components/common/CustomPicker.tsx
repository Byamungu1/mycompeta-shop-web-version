import { DataInfo } from "@/interfaces/interface";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Scrolldiv, TouchableOpacity } from "@/components/common/ui";

interface CustomPickerProps {
    options: string[];
    isOpen: boolean;
    onToggle: () => void;
    onSelect: (item: string) => void
    setDataInfo: React.Dispatch<React.SetStateAction<DataInfo[]>>;
}

interface DataInfoPro {
    label: string, // Fixed typo from 'lebal'/'lebel' to standard 'label'
    value: string,
    options: string[],
    isOpen: boolean,
}

export default function CustomPicker({ options, isOpen, onToggle, onSelect, setDataInfo }: CustomPickerProps) {

    const [selected, setSelected] = useState(options[0]);
    console.log('type of', typeof onSelect)

    return (
        <div className="w-full relative flex-1">

            {/* Trigger Button (Acts as the Input Field) */}
            <TouchableOpacity
                onPress={onToggle}
                activeOpacity={1}
                className="flex-row items-center justify-between w-full bg-white rounded-sm px-4 mt-2 py-3 border border-sand-200 focus:border-brand-500"
            >
                <p className="font-jakarta text-sand-600 text-sm">{selected}</p>
                {isOpen ? <ChevronUp size={24} className="text-sand-900" /> : <ChevronDown size={24} className="text-sand-900" />}
            </TouchableOpacity>

            {/* Floating Options Dropdown */}
            {isOpen && (
                <Scrolldiv showsVerticalScrollIndicator={true}
                    nestedScrollEnabled={true}
                    keyboardShouldPersistTaps="handled"
                    bounces={false}
                    persistentScrollbar={true}
                    className="absolute top-16 left-0 right-0 max-h-48 overflow-y-auto rounded-md z-50 bg-white border border-sand-200 shadow-lg">

                    {options.map((item) => (
                        <TouchableOpacity
                            key={item}
                            onPress={() => {
                                setSelected(item);
                                onSelect(item)
                                setDataInfo((prev) =>
                                    prev.map((opt: DataInfo) => {
                                        console.log('the selected', selected);
                                        console.log('the opt', opt);

                                        // Check if the selected item exists inside this option group's array
                                        const containsSelected = opt.options.includes(selected);

                                        return containsSelected
                                            ? { ...opt, isOpen: false }
                                            : opt;
                                    })
                                );
                                console.log('type of set is open in customer picker', typeof setDataInfo)
                            }}
                            className="w-full p-3 border-b border-sand-200 hover:bg-sand-100"
                        >
                            <p className="font-jakarta-bold text-sand-900 text-md">{item}</p>
                        </TouchableOpacity>
                    ))}

                </Scrolldiv>
            )
            }

        </div >
    );
}