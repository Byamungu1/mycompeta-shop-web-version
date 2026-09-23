import * as imgPicker from '@/utils/platform/imagePicker';
import { ImagePlus, Plus, X } from 'lucide-react';
import { Scrolldiv, TouchableOpacity } from '@/components/common/ui';

const FieldLabel = ({ icon, text, required = false }: {
  icon: React.ReactNode;
  text: string;
  required?: boolean;
}) => (
  <div className='flex flex-row items-center mb-2' style={{ gap: 6 }}>
    {icon}
    <p className='font-jakarta-semibold text-sm text-sand-700'>{text}</p>
    {required && <p className='text-brand-500 font-jakarta-bold text-sm'>*</p>}
  </div>
);
const MAX_images = 6;

export const MultiimagesUpload = ({ images, setimages }: {
  images: string[];
  setimages: (uris: string[]) => void;
}) => {
  const pickimages = async () => {
    const remaining = MAX_images - images.length;
    if (remaining <= 0) return;

    const result = await imgPicker.launchimgLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.length) {
      const newUris = result.assets.map(a => a.uri);
      setimages([...images, ...newUris]);
    }
  };

  const removeimg = (index: number) => {
    setimages(images.filter((_, i) => i !== index));
  };

  return (
    <div>
      <FieldLabel icon={<ImagePlus size={14} color='#7C6A4E' />} text={`Photos (${images.length}/${MAX_images})`} required />
      <Scrolldiv horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
        {images.map((uri, index) => (
          <div key={index} style={{ width: 90, height: 90, position: 'relative' }} className='rounded-lg overflow-hidden'>
            <img src={uri} style={{ width: 90, height: 90, borderRadius: 8 }} />
            {index === 0 && (
              <div className='absolute bottom-1 left-1 bg-brand-500 rounded-sm px-1.5 py-0.5'>
                <p className='font-jakarta-bold text-[9px] text-white'>Cover</p>
              </div>
            )}
            <TouchableOpacity
              onPress={() => removeimg(index)}
              activeOpacity={0.7}
              className='absolute -top-2 -right-2 bg-white rounded-full w-6 h-6 items-center justify-center border border-sand-200'>
              <X size={12} color='#64748B' />
            </TouchableOpacity>
          </div>
        ))}

        {images.length < MAX_images && (
          <TouchableOpacity
            onPress={pickimages}
            activeOpacity={0.7}
            style={{ width: 90, height: 90 }}
            className='items-center justify-center border border-dashed border-brand-300 rounded-lg bg-brand-50'>
            <Plus size={20} color='#7C6A4E' />
            <p className='font-jakarta-semibold text-[10px] text-brand-500 mt-1'>Add</p>
          </TouchableOpacity>
        )}
      </Scrolldiv>
      {images.length === 0 && (
        <p className='font-jakarta text-xs text-sand-400 mt-1.5'>Add at least one photo. First photo becomes the cover.</p>
      )}
    </div>
  );
};

