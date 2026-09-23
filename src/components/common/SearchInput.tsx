import { useFocusEffect, useRouter } from '@/router';
import { Search } from 'lucide-react';
import { useCallback, useRef } from 'react';
import { TextInput, TouchableOpacity } from '@/components/common/ui';

interface InputProps {
    value: string
    onPress?: ()=> void
    placeholder: string
    focus?: boolean
    search: ()=>void;
    onChangeText?: (text: string) => void;
}

const SearchInput = ({ value, onPress, placeholder, focus, search, onChangeText }: InputProps) => {
    const router = useRouter();
    const inputRef = useRef<TextInput>(null);

    useFocusEffect(
        useCallback(() => {
        if (focus) {
            const timeout = setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
            return () => clearTimeout(timeout);
        }
    }, [focus]));

    return (
        <div className='flex flex-row items-center relative' >
            <TextInput
                value={value}
                onPress={onPress}
                onChangeText={onChangeText || ((e) => router.setParams({ query: e }))}
                className='w-full h-11 text-sm text-sand-700 bg-white border border-sand-200 rounded-md px-4 mb-2 font-jakarta focus:border-brand-500'
                placeholder={placeholder}
                placeholderTextColor={'#A8A29E'}
                ref={inputRef}
            />
            <TouchableOpacity
            className='absolute right-4 bottom-5 items-center'
            onPress={search}
            >
            <Search
                className='text-brand-500'
            />
            </TouchableOpacity>
        </div>
    )
}

export default SearchInput