import { useRouter } from '@/router'
import { ChevronLeft } from 'lucide-react'
import { TouchableOpacity } from '@/components/common/ui'

export default function Header({ title, subtitle }: { title: string, subtitle?: any }) {
    const router = useRouter()
    return (
        <div className='flex flex-row items-center' style={{ gap: 12 }}>
            <TouchableOpacity
                onPress={() => router.back()}
                activeOpacity={0.7}
                className='w-9 h-9 bg-white border border-sand-200 rounded-md items-center justify-center active:bg-sand-100'>
                <ChevronLeft size={18} color='#44403C' />
            </TouchableOpacity>
            <div>
                <p className='font-jakarta-bold text-lg text-sand-900'>{title}</p>
                {subtitle ? <p className='font-jakarta text-xs text-sand-400'>{subtitle}</p> : null}
            </div>
        </div>
    )
}
