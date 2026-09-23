import Header from '@/components/layout/Header'
import LogoutDecisionModal from '@/components/common/LogoutDecisionModal'
import { CartIcon, NotificationIcon } from '@/components/layout/NotificationIcon'
import { useGlobalContext } from '@/context/globalContext'
import { useFocusEffect, useRouter } from '@/router'
import * as SecureStore from '@/utils/storage'
import { ChevronRight, Download, LogOut, Package, Settings, X } from 'lucide-react'
import { useCallback, useState } from 'react'
import { TouchableOpacity } from '@/components/common/ui'
import { SafeAreadiv } from '@/components/layout/SafeArea'
import api from '@/utils/api'

interface ProfileItemProps {
    icon: any
    title: string
    showArrow?: boolean
    customStyles?: any
    onPress?: () => void
}

const ProfileItem = ({ icon, title, showArrow = false, customStyles, onPress }: ProfileItemProps) => {
    return (
        <TouchableOpacity onPress={onPress} className={`flex-row flex items-center justify-between 
        rounded-lg p-4 ${customStyles ? customStyles : 'bg-white border border-sand-200'}`}>
            <div className='flex flex-row gap-4 flex-1 items-center'>
                {icon}
                <p className={`text-base font-jakarta-semibold ${customStyles ? 'text-sand-50' : 'text-sand-800'}`}>{title}</p>
            </div>
            <div>
                {showArrow && <ChevronRight size={20} className='text-sand-400' />}
            </div>

        </TouchableOpacity>
    )
}


const profile = () => {
    const router = useRouter();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showInstallModal, setShowInstallModal] = useState(false);
    const [appDownloadUrl, setAppDownloadUrl] = useState<string | null>(null);
    const [loadingDownload, setLoadingDownload] = useState(false);

    const { user,
        token,
        isAuthenticated,
        isLoading,
        refreshUserProfile,
        logout
    } = useGlobalContext()

    const handleLogout = async () => {
        setShowLogoutModal(true);
    }

    const confirmLogout = async () => {
        await SecureStore.deleteItemAsync('login_role')
        await logout()
        setShowLogoutModal(false);
    }

    const cancelLogout = () => {
        setShowLogoutModal(false);
    }

    const handleDownloadApp = () => {
        if (appDownloadUrl) {
            window.open(appDownloadUrl, '_blank');
        }
    }

    const fetchAppDownloadUrl = async () => {
        if (loadingDownload) return;

        setLoadingDownload(true);
        try {
            const response = await api.get('app-version/latest/');

            console.log('the response data', response.data);
            setAppDownloadUrl(response.data.apk_url);
        } catch (error) {
            console.error('Failed to fetch app download URL:', error);
        } finally {
            setLoadingDownload(false);
        }
    }

    // Fetch download URL when modal opens
    const handleOpenInstallModal = async () => {
        await fetchAppDownloadUrl();
        setShowInstallModal(true);
    }

    useFocusEffect(
        useCallback(() => {
            refreshUserProfile()
        }, [])
    )

    const getAvatarInitials = (fullName?: string, username?: string) => {
        const target = fullName || username;
        if (!target || target.trim().length === 0) return '?';

        // Takes the first letter and turns it uppercase (e.g., "Chamu" -> "C")
        return target.trim().charAt(0).toUpperCase();
    };

    console.log('the app download url is', appDownloadUrl)

    return (
        <SafeAreadiv className="bg-sand-50">
            <div className='h-full w-full px-4 md:px-6 lg:px-8 mt-5 max-w-4xl'>
                <div className='flex-row items-center justify-between'>
                    <Header title="Profile" subtitle='Edit your profile' />
                    <div className='flex-row items-center'>
                        <NotificationIcon onPress={() => router.push('/notification')} />
                        <CartIcon />
                    </div>
                </div>
                <div className='items-center justify-center mt-8 bg-white border border-sand-200 rounded-lg py-8 shadow-sm'>
                    <div className="w-24 h-24 rounded-full bg-brand-500 items-center justify-center">
                        <p className="text-sand-950 text-4xl font-jakarta-bold">
                            {getAvatarInitials(user?.first_name, user?.username)}
                        </p>
                    </div>
                    <p className="text-sm font-jakarta text-sand-900 mt-2">{user?.username}</p>
                    {
                        user?.phone_number &&
                        <p className="text-sm font-jakarta text-sand-600 mt-1">0{user?.phone_number}</p>
                    }
                </div>

                {/* Download App Card */}
                <div className='mt-6 bg-brand-500 border border-brand-300 rounded-lg p-4 shadow-md'>
                    <div className='flex-row items-center justify-between'>
                        <div className='flex-row items-center' style={{ gap: 12 }}>
                            <div className='bg-sand-950/20 rounded-full p-2'>
                                <Download size={20} className='text-sand-950' />
                            </div>
                            <div>
                                <p className='font-jakarta-bold text-base text-sand-950'>Get Our Mobile App</p>
                                <p className='font-jakarta text-xs text-sand-800'>Better experience on the go</p>
                            </div>
                        </div>
                        <TouchableOpacity
                            onPress={handleOpenInstallModal}
                            className='bg-sand-950 px-4 py-2 rounded-lg'
                        >
                            <p className='font-jakarta-bold text-sm text-sand-50'>Download</p>
                        </TouchableOpacity>
                    </div>
                </div>

                <div
                    style={{ gap: 10 }}
                    className='flex flex-col mt-8 bg-white border border-sand-200 rounded-lg p-2'>

                    <ProfileItem
                        onPress={() => router.push('/settings')}
                        icon={<Settings size={24} className='text-brand-600' />} title="Settings" showArrow={true} />
                    <ProfileItem
                        icon={<Package size={24} className='text-brand-600' />}
                        title="Orders"
                        showArrow={true}
                        onPress={() => router.push('/order')}
                    />
                </div>
                <div className="mt-8">
                    <ProfileItem icon={<LogOut
                        size={24} className='text-sand-50' />}
                        customStyles='bg-market-600'
                        title="Logout"
                        showArrow={false}
                        onPress={handleLogout}
                    />
                </div>

                {/* Logout Confirmation Modal */}
                <LogoutDecisionModal
                  showLogoutModal={showLogoutModal}
                  cancelLogout={cancelLogout}
                  confirmLogout={confirmLogout}
                />

                {/* App Installation Instructions Modal */}
                {showInstallModal && (
                    <div className='absolute inset-0 bg-black/50 flex items-center justify-center px-4 z-50'>
                        <div className='bg-white rounded-xl p-6 w-full max-w-md shadow-2xl'>
                            <div className='flex-row justify-between items-center mb-4'>
                                <p className='text-lg font-jakarta-bold text-sand-900'>Download Mobile App</p>
                                <TouchableOpacity onPress={() => setShowInstallModal(false)}>
                                    <X size={20} className='text-sand-400' />
                                </TouchableOpacity>
                            </div>

                            <div className='mb-4'>
                                <p className='text-sm font-jakarta-semibold text-sand-700 mb-2'>Why Download Our App?</p>
                                <p className='text-xs text-sand-600 leading-relaxed'>
                                    Get the best experience with faster performance, precise location detection, and mobile-optimized features.
                                </p>
                            </div>

                            <div className='bg-info-50 border border-info-200 rounded-lg p-4 mb-4'>
                                <p className='text-sm font-jakarta-bold text-info-700 mb-2'>Installation Instructions:</p>
                                <div style={{ gap: 8 }}>
                                    <div className='flex-row items-start' style={{ gap: 8 }}>
                                        <div className='bg-info-500 text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5'>
                                            <p className='text-xs font-bold'>1</p>
                                        </div>
                                        <p className='text-xs text-info-600 flex-1'>Click the Download button below to get the APK file</p>
                                    </div>
                                    <div className='flex-row items-start' style={{ gap: 8 }}>
                                        <div className='bg-info-500 text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5'>
                                            <p className='text-xs font-bold'>2</p>
                                        </div>
                                        <p className='text-xs text-info-600 flex-1'>If Play Store blocks installation, go to Settings → Security → Allow unknown sources</p>
                                    </div>
                                    <div className='flex-row items-start' style={{ gap: 8 }}>
                                        <div className='bg-info-500 text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5'>
                                            <p className='text-xs font-bold'>3</p>
                                        </div>
                                        <p className='text-xs text-info-600 flex-1'>Open the downloaded APK file from your Downloads folder</p>
                                    </div>
                                    <div className='flex-row items-start' style={{ gap: 8 }}>
                                        <div className='bg-info-500 text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5'>
                                            <p className='text-xs font-bold'>4</p>
                                        </div>
                                        <p className='text-xs text-info-600 flex-1'>Tap "Install" when prompted to complete installation</p>
                                    </div>
                                </div>
                            </div>

                            <TouchableOpacity
                                onPress={handleDownloadApp}
                                disabled={loadingDownload || !appDownloadUrl}
                                className={`py-3 rounded-lg items-center mb-2 ${loadingDownload || !appDownloadUrl ? 'bg-sand-300' : 'bg-brand-500'}`}
                            >
                                {loadingDownload ? (
                                    <p className='font-jakarta-bold text-sm text-sand-600'>Loading...</p>
                                ) : (
                                    <p className='font-jakarta-bold text-sm text-sand-50'>Download APK File</p>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => setShowInstallModal(false)}
                                className='items-center'
                            >
                                <p className='text-brand-600 font-jakarta-semibold text-sm'>Cancel</p>
                            </TouchableOpacity>
                        </div>
                    </div>
                )}
            </div>
        </SafeAreadiv>
    )
}

export default profile