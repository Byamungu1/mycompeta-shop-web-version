import { Camera } from 'lucide-react';
import React from 'react';
import { TouchableOpacity } from '@/components/common/ui';

import { useimgPicker } from '@/hooks/useImagePicker';

interface imgProps {
  img: string[];
  setimg: React.Dispatch<React.SetStateAction<string | null>>;
}

export default function PhotoUploadSection({ img, setimg }: imgProps) {
  
  // Wire up the clean custom hook and pipe its result straight to your parent state setter
  const { handlePickimg, isPicking } = useimgPicker({
    onimgPicked: (uri) => setimg(uri),
  });

  console.log('the imgs', img)

// 1. Bulletproof Extraction: Handles strings, string arrays, and object arrays gracefully
  const displayUri = Array.isArray(img)
    ? (typeof img[0] === 'object' ? img[0]?.uri : img[0])
    : img;  

  return (
    <div className="bg-white">
      <TouchableOpacity
        onPress={handlePickimg}
        disabled={isPicking}
        className="w-full bg-white border-2 border-dashed border-brand-300 rounded-sm items-center justify-center"
        style={{ height: 180 }}
        activeOpacity={0.7}
      >
        {displayUri ? (
          <img
            src={displayUri}
            className="w-full h-full rounded-sm"
            resizeMode="cover"
          />
        ) : (
          <div className="items-center" style={{ gap: 10 }}>
            <div className="w-14 h-14 bg-brand-100 rounded-sm items-center justify-center">
              <Camera size={26} color="#7C6A4E" />
            </div>
            <div className="items-center" style={{ gap: 3 }}>
              <p className="font-jakarta-bold text-sm text-sand-800">
                {isPicking ? 'Opening Gallery...' : 'Upload product photo'}
              </p>
              <p className="font-jakarta text-xs text-sand-400">
                Tap to choose from gallery
              </p>
            </div>
            <div className="px-4 py-1.5 bg-brand-500 rounded-sm">
              <p className="font-jakarta-bold text-xs text-white">Choose Photo</p>
            </div>
          </div>
        )}
      </TouchableOpacity>
    </div>
  );
}