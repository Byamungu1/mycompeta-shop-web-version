import { DataInfo } from "@/interfaces/interface";
import { useState } from "react";

// 1. Grouping inputs into an array makes the hook infinitely scalable 
// instead of locking you down to exactly 3 arguments.
const useDataInfo = (optionsList: DataInfo[]) => {
  
  // 2. Map the incoming options arrays directly into your initial state layout
  const [dataInfo, setDataInfo] = useState(() => 
    optionsList.map((option) => ({
      label: option.label, // Fixed typo from 'lebal'/'lebel' to standard 'label'
      value: option.value,
      options: option.options,
      isOpen: false,
    }))
  );

  // 3. Handles opening one accordion item while shutting the others cleanly
  const handleToggle = (index: number) => {
    setDataInfo((prev) =>
      prev.map((item, i) =>
        i === index 
          ? { ...item, isOpen: !item.isOpen } 
          : { ...item, isOpen: false }
      )
    );
  };

  return { dataInfo, setDataInfo, handleToggle };
};

export default useDataInfo;