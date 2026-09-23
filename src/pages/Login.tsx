import { useGlobalContext } from '@/context/globalContext';
import { useToast } from '@/context/toastContext';
import { usePost } from '@/hooks/useApi';
import { useTimer } from '@/hooks/useTimer';
import { FormData } from '@/interfaces/interface';
import {
    googleLogin,
    login,
    register,
    sendResetPassswordCode,
    verifyOtp,
    verifyResetPasswordCode,
} from '@/services/auth';
import { useRouter } from '@/router';
import * as SecureStorage from '@/utils/storage';
import { useEffect, useRef, useState } from 'react';

import {
    ActivityIndicator,
    Platform,
    TextInput,
    TouchableOpacity
} from '@/components/common/ui';
import { KeyboardAwareScrolldiv } from '@/components/layout/KeyboardAwareScrollView';

interface AuthResponse {
    role: 'buyer' | 'seller';
    access?: string;
    refresh?: string;
    [key: string]: any;
}

/* ---- Split-brand-panel design tokens -------------------------------- */
// Small uppercase field label.
const labelCls =
    'text-[11px] font-jakarta-semibold uppercase tracking-[0.14em] text-sand-500 mb-2';
// Underline-only field: border colour is supplied per-field so match/error
// states never fight the base class.
const inputBase =
    'w-full bg-transparent border-b py-3 text-base text-sand-900 placeholder:text-sand-400 focus:border-brand-500 transition-colors';

export default function AuthScreen() {
    const [role, setRole] = useState<'buyer' | 'seller'>('buyer');

    const router = useRouter();
    const { saveSession, user, saveLoginRole } = useGlobalContext();

    const [activeTab, setActiveTab] = useState<'login' | 'register' | 'verify' | 'resetPassword'>('login');

    const [formData, setFormData] = useState<FormData>({
        email: '',
        phoneNumber: '',
        password: '',
        firstName: '',
        lastName: '',
        confirmPassword: '',
        otp: '',
    });

    const [googleLoginLoading, setGoogleLoginLoading] = useState<boolean>(false)

    const { showSuccess, showError } = useToast();
    const { secondsLeft, formattedTime, resetTimer, endTimer } = useTimer();

    // --- SCROLL / FOCUS MANAGEMENT ---
    // Single ref to the KeyboardAwareScrolldiv, plus a map of refs for every
    // TextInput on screen so we can explicitly scroll to whichever one is
    // focused (some fields sit lower than the keyboard-aware defaults handle
    // well on Android, e.g. the last field in a two-column row).
    const scrolldivRef = useRef<KeyboardAwareScrolldiv>(null);
    const inputRefs = useRef<{ [key: string]: any }>({});

    const registerInputRef = (key: string) => (ref: any) => {
        inputRefs.current[key] = ref;
    };

    const scrollToInput = (key: string) => {
        const node = inputRefs.current[key];
        if (node && scrolldivRef.current) {
            // extraHeight below gives the focused field a little breathing
            // room above the keyboard instead of sitting flush against it.
            scrolldivRef.current.scrollToFocusedInput(node, 120);
        }
    };

    useEffect(() => {
        if (activeTab === 'resetPassword') {
            endTimer();
        }
    }, [endTimer, activeTab]);

    // --- API HOOKS ---
    const {
        error: erroRegistering,
        execute: executeRegister,
        loading: registerLoading,
        error: registrationError,
    } = usePost<AuthResponse, FormData>((body) => register(body));

    const {
        execute: executeSendResetCode,
        loading: resetPasswordLoading,
    } = usePost<AuthResponse, FormData>((body) => sendResetPassswordCode(body));

    const {
        execute: executeVerifyResetCode,
        loading: verificationResetLoading,
    } = usePost<AuthResponse, FormData>((body) => verifyResetPasswordCode(body));

    const {
        execute: executeLogin,
        loading: loginLoading,
    } = usePost<AuthResponse, FormData>((body) => login(body));


    const {
        execute: executeVerifyOtp,
        loading: verificationLoading,
    } = usePost<AuthResponse, FormData>((body) => verifyOtp(body));

    const updateField = (field: keyof FormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    // --- HANDLERS ---

    const handleLogin = async () => {
        if (loginLoading) return;

        const result = await executeLogin(formData);
        if (!result || !result.success || !result.data) {
            showError(result.error.detail)
            console.log('the errors', result.error)
            return;
        }
        await saveLoginRole(role)
        await saveSession(result.data.access, result.data.refresh);
        router.replace('./')
    };

    const handleRegister = async () => {
        if (registerLoading) return;
        if (formData.password !== formData.confirmPassword) {
            showError("Passwords do not match");
            return;
        }

        const result = await executeRegister(formData);
        if (!result || !result.success) {
            showError(erroRegistering?.message || 'Registration failed');
            return;
        }

        await SecureStorage.setItemAsync('formData', JSON.stringify(formData));

        resetTimer();
        showSuccess(result?.data?.message || 'Verification code sent');
        console.log('the result sucess message', result.data)
        setActiveTab('verify');
    };

    const handleRegistrationConfirm = async () => {
        if (verificationLoading) return;

        const cachedRaw = await SecureStorage.getItemAsync('formData');
        const cachedFormData: FormData = cachedRaw ? JSON.parse(cachedRaw) : {};
        const payload = { ...cachedFormData, otp: formData.otp };

        const result = await executeVerifyOtp(payload);
        if (!result || !result.success) {
            showError(result?.error.message || 'Verification failed');
            console.log('the result erros', result?.error)
            return;
        }

        await SecureStorage.deleteItemAsync('formData');
        showSuccess(result?.data?.message || 'Verification successful');
        setActiveTab('login');
    };

    const handleGoogleLogin = async () => {
        if (googleLoginLoading) return;

        setGoogleLoginLoading(true)

        const result = await googleLogin();
        if (!result || !result.access) {
            showError('Google Login Failed. Try later');
            setGoogleLoginLoading(false)
            return;
        }

        await saveLoginRole(role)
        await saveSession(result.access, result.refresh);
        showSuccess('Loging in with Google')
        setGoogleLoginLoading(false)
        router.replace('./');
    };

    const handleForgetPassword = async () => {
        setActiveTab('resetPassword');
    };

    const handleSendResetCode = async () => {
        if (resetPasswordLoading) return;
        if (secondsLeft > 0) {
            showError(`Please wait ${formattedTime} before requesting a new code.`);
            return;
        }

        const result = await executeSendResetCode(formData);
        if (!result || !result.success) {
            showError(result?.error || 'Failed to send reset code');
            return;
        }

        resetTimer();
        showSuccess(result?.data?.message);
    };

    const handleVerifyResetPasswordCode = async () => {
        if (verificationResetLoading) return;

        const result = await executeVerifyResetCode(formData);
        if (!result || !result.success) {
            showError(result?.error || 'Code verification failed');
            return;
        }

        showSuccess(result?.data?.message);
    };

    // --- DYNAMIC STYLE HELPERS ---
    // Password/confirm-password match feedback: neutral while empty,
    // "delivery" (success green) once they match, "market" (alert red)
    // once they diverge. Gives real-time visibility instead of only
    // surfacing the mismatch on submit.
    const getMatchFieldStyle = (value: string, compareValue: string) => {
        if (!value || !compareValue) return 'border-sand-300';
        return value === compareValue
            ? 'border-delivery-500'
            : 'border-market-500';
    };

    const passwordsMatchState = (value: string, compareValue: string): 'match' | 'mismatch' | null => {
        if (!value || !compareValue) return null;
        return value === compareValue ? 'match' : 'mismatch';
    };

    const registerMatchState = passwordsMatchState(formData.password, formData.confirmPassword);
    const resetMatchState = passwordsMatchState(formData.password, formData.confirmPassword);

    const otpReady = formData.otp.length === 6;

    // Primary (amber) button styling shared by every submit action.
    const primaryButton = (disabled: boolean) =>
        `w-full py-4 rounded-md items-center justify-center flex-row transition-colors ${
            disabled ? 'bg-sand-200' : 'bg-brand-500 active:bg-brand-600'
        }`;
    const primaryButtonText = (disabled: boolean) =>
        `font-jakarta-bold text-base ${disabled ? 'text-sand-400' : 'text-sand-950'}`;

    const loginDisabled = loginLoading || !formData.email || !formData.password;
    const loginButtonStyle = primaryButton(loginDisabled);
    const loginpStyle = primaryButtonText(loginDisabled);

    const registerDisabled =
        registerLoading ||
        !formData.firstName ||
        !formData.lastName ||
        !formData.email ||
        !formData.password ||
        !formData.confirmPassword;
    const registerButtonStyle = primaryButton(registerDisabled);
    const registerpStyle = primaryButtonText(registerDisabled);

    const sendCodeDisabled = secondsLeft > 0 || resetPasswordLoading || !formData.email;
    const sendCodeCustomStyle = primaryButton(sendCodeDisabled);
    const sendCodepStyle = primaryButtonText(sendCodeDisabled);

    const changePasswordStyleCondition =
        !formData.otp || !formData.password || !formData.confirmPassword;
    const changePasswordDisabled = verificationResetLoading || changePasswordStyleCondition;
    const changePasswordCustomeStyle = primaryButton(changePasswordDisabled);
    const changePasswordpStyle = primaryButtonText(changePasswordDisabled);

    const resendDisabled = secondsLeft > 0 || registerLoading;

    const getRegisteringError = () => {
        if (erroRegistering?.errors && typeof erroRegistering?.errors === 'object') {
            if (Object.prototype.hasOwnProperty.call(erroRegistering.errors, 'password')) {
                return {key: 'password', message: erroRegistering?.errors?.password?.[0]}
            }
        }
    }

    console.log('the error', getRegisteringError()?.message)
    console.log('the base uri', import.meta.env.VITE_API_URL)

    const RoleOption = ({ value, label }: { value: 'buyer' | 'seller'; label: string }) => (
        <TouchableOpacity
            className='flex-row items-center'
            style={{ gap: 8 }}
            onPress={() => setRole(value)}
            activeOpacity={0.7}
        >
            <div className={`w-4 h-4 rounded-full border-2 items-center justify-center ${
                role === value ? 'border-brand-500' : 'border-sand-300'
            }`}>
                {role === value && <div className='w-2 h-2 bg-brand-500 rounded-full' />}
            </div>
            <p className={`text-sm ${role === value
                ? 'text-sand-900 font-jakarta-semibold'
                : 'text-sand-500 font-jakarta'}`}>
                {label}
            </p>
        </TouchableOpacity>
    );

    return (
        <div className="flex-1 flex flex-col md:flex-row min-h-screen bg-sand-50">

            {/* LEFT BRAND PANEL — amber block over a deep charcoal base */}
            <div className="hidden md:flex md:w-2/5 flex-col">
                <div className="flex-1 flex flex-col justify-between bg-brand-500 p-10 lg:p-14">
                    <img
                        src={require('../../assets/images/logo.png')}
                        className="w-40 h-20 object-contain"
                        resizeMode="contain"
                    />
                    <p className="font-syne-extrabold text-sand-950 text-4xl lg:text-5xl leading-[1.05] tracking-tight">
                        WELCOME<br />BACK
                    </p>
                </div>
                <div className="basis-1/3 bg-sand-900" />
            </div>

            {/* MOBILE BRAND HEADER */}
            <div className="md:hidden flex-row items-center justify-between bg-brand-500 px-6 py-5">
                <img
                    src={require('../../assets/images/logo.png')}
                    className="w-28 h-12 object-contain"
                    resizeMode="contain"
                />
                <p className="font-syne-bold text-sand-950 text-lg tracking-tight">WELCOME BACK</p>
            </div>

            {/* RIGHT FORM PANEL */}
            <div className="flex-1 md:w-3/5 flex bg-sand-50">
                <KeyboardAwareScrolldiv
                    ref={scrolldivRef}
                    className="flex-1"
                    contentContainerStyle={{ alignItems: 'center' }}
                    keyboardShouldPersistTaps="handled"
                    enableOnAndroid
                    extraScrollHeight={Platform.OS === 'ios' ? 20 : 120}
                    keyboardOpeningTime={0}
                >
                    <div className="w-full max-w-md px-6 py-10 md:py-16">

                        {/* CONDITIONAL TOP NAVIGATION TABS */}
                        {activeTab !== 'verify' && activeTab !== 'resetPassword' && (
                            <div className="flex-row items-center mb-8 border-b border-sand-200">
                                <TouchableOpacity
                                    className={`flex-1 items-center pb-3 ${activeTab === 'login' ? 'border-b-2 border-brand-500' : ''}`}
                                    onPress={() => setActiveTab('login')}
                                >
                                    <p className={`text-sm tracking-wide ${activeTab === 'login' ? 'text-sand-900 font-jakarta-bold' : 'text-sand-400 font-jakarta-medium'}`}>
                                        Login
                                    </p>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    className={`flex-1 items-center pb-3 ${activeTab === 'register' ? 'border-b-2 border-brand-500' : ''}`}
                                    onPress={() => setActiveTab('register')}
                                >
                                    <p className={`text-sm tracking-wide ${activeTab === 'register' ? 'text-sand-900 font-jakarta-bold' : 'text-sand-400 font-jakarta-medium'}`}>
                                        Register
                                    </p>
                                </TouchableOpacity>
                            </div>
                        )}

                        {/* DYNAMIC FORM CONTENT CONTROLLER */}
                        <div className="space-y-5">

                            {/* SCREEN A: VERIFICATION MODE */}
                            {activeTab === 'verify' && (
                                <div className="space-y-5">
                                    <p className="text-sand-600 text-sm text-center leading-relaxed">
                                        We have sent a 6-digit confirmation code to <span className="font-jakarta-semibold text-brand-600">{formData.email || 'your email'}</span>. Please enter it below to finalize your registration.
                                    </p>

                                    <div>
                                        <p className={labelCls}>Verification Code</p>
                                        <TextInput
                                            ref={registerInputRef('otp')}
                                            onFocus={() => scrollToInput('otp')}
                                            className={`${inputBase} text-center font-jakarta-bold tracking-[0.5em] ${otpReady ? 'border-delivery-500 text-delivery-700' : 'border-sand-300'}`}
                                            placeholder="000000"
                                            placeholderTextColor="#A8A29E"
                                            keyboardType="number-pad"
                                            maxLength={6}
                                            value={formData.otp}
                                            onChangeText={(text) => updateField('otp', text)}
                                        />
                                    </div>

                                    <TouchableOpacity
                                        className={`${primaryButton(!otpReady)} ${verificationLoading ? 'opacity-60' : 'opacity-100'}`}
                                        onPress={handleRegistrationConfirm}
                                        disabled={verificationLoading}
                                        style={{ gap: 10 }}
                                    >
                                        <p className={primaryButtonText(!otpReady)}>
                                            {verificationLoading ? 'Verifying Code...' : 'Verify Code'}
                                        </p>
                                        {verificationLoading && <ActivityIndicator color="#1C1917" size="small" />}
                                    </TouchableOpacity>

                                    <div className="flex-row items-center justify-center" style={{ gap: 8 }}>
                                        <p className="text-sand-600 text-sm">Didn't receive code?</p>
                                        <TouchableOpacity
                                            className={`py-1.5 px-3 rounded-md border border-brand-500 ${resendDisabled ? 'opacity-50' : 'active:bg-brand-50'}`}
                                            onPress={handleRegister}
                                            disabled={resendDisabled}
                                        >
                                            <p className="text-brand-600 text-sm font-jakarta-bold">
                                                {secondsLeft > 0 ? `Resend in ${formattedTime}` : 'Resend Code'}
                                            </p>
                                        </TouchableOpacity>
                                    </div>

                                    <TouchableOpacity
                                        className="items-center"
                                        onPress={() => setActiveTab('register')}
                                    >
                                        <p className="text-brand-600 text-sm font-jakarta-semibold">Back to Registration</p>
                                    </TouchableOpacity>
                                </div>
                            )}

                            {/* SCREEN B: RESET PASSWORD MODE */}
                            {activeTab === 'resetPassword' && (
                                <div className="space-y-5">
                                    <p className="text-sand-600 text-sm text-center leading-relaxed">
                                        Enter the email registered with your account to request a password verification code.
                                    </p>

                                    <div>
                                        <p className={labelCls}>Email Address</p>
                                        <TextInput
                                            ref={registerInputRef('resetEmail')}
                                            onFocus={() => scrollToInput('resetEmail')}
                                            className={`${inputBase} border-sand-300`}
                                            placeholder="yourname@domain.com"
                                            placeholderTextColor="#A8A29E"
                                            autoCapitalize="none"
                                            keyboardType="email-address"
                                            value={formData.email}
                                            onChangeText={(text) => updateField('email', text)}
                                        />
                                    </div>

                                    <div className="items-end">
                                        <TouchableOpacity
                                            onPress={handleSendResetCode}
                                            disabled={sendCodeDisabled}
                                            className={`px-4 py-2.5 rounded-md justify-center items-center flex-row ${sendCodeCustomStyle}`}
                                            style={{ gap: 6, width: 'auto' }}
                                        >
                                            <p className={`text-sm font-jakarta-bold ${sendCodepStyle}`}>
                                                {secondsLeft > 0 ? `Resend Code (${formattedTime})` : 'Send Code'}
                                            </p>
                                            {resetPasswordLoading && <ActivityIndicator color="#1C1917" size="small" />}
                                        </TouchableOpacity>
                                    </div>

                                    <div>
                                        <p className={labelCls}>Reset Code</p>
                                        <TextInput
                                            ref={registerInputRef('resetOtp')}
                                            onFocus={() => scrollToInput('resetOtp')}
                                            className={`${inputBase} border-sand-300`}
                                            placeholder="Enter 6-digit code"
                                            placeholderTextColor="#A8A29E"
                                            keyboardType="number-pad"
                                            maxLength={6}
                                            value={formData.otp}
                                            onChangeText={(text) => updateField('otp', text)}
                                        />
                                    </div>

                                    <div>
                                        <p className={labelCls}>New Password</p>
                                        <TextInput
                                            ref={registerInputRef('resetPassword')}
                                            onFocus={() => scrollToInput('resetPassword')}
                                            className={`${inputBase} border-sand-300`}
                                            placeholder="Minimum 6 characters"
                                            placeholderTextColor="#A8A29E"
                                            secureTextEntry
                                            autoCapitalize="none"
                                            value={formData.password}
                                            onChangeText={(text) => updateField('password', text)}
                                        />
                                    </div>

                                    <div>
                                        <p className={labelCls}>Repeat Password</p>
                                        <TextInput
                                            ref={registerInputRef('resetConfirmPassword')}
                                            onFocus={() => scrollToInput('resetConfirmPassword')}
                                            className={`${inputBase} ${getMatchFieldStyle(formData.password, formData.confirmPassword)}`}
                                            placeholder="Confirm new password"
                                            placeholderTextColor="#A8A29E"
                                            secureTextEntry
                                            autoCapitalize="none"
                                            value={formData.confirmPassword}
                                            onChangeText={(text) => updateField('confirmPassword', text)}
                                        />
                                        {resetMatchState === 'mismatch' && (
                                            <p className="text-market-600 text-xs mt-1.5">Passwords do not match</p>
                                        )}
                                        {resetMatchState === 'match' && (
                                            <p className="text-delivery-600 text-xs mt-1.5">Passwords match</p>
                                        )}
                                    </div>

                                    <TouchableOpacity
                                        onPress={handleVerifyResetPasswordCode}
                                        disabled={changePasswordDisabled}
                                        className={`${changePasswordCustomeStyle} ${verificationResetLoading ? 'opacity-60' : 'opacity-100'}`}
                                        style={{ gap: 10 }}
                                    >
                                        <p className={changePasswordpStyle}>
                                            {verificationResetLoading ? 'Updating Password...' : 'Change Password'}
                                        </p>
                                        {verificationResetLoading && <ActivityIndicator color="#1C1917" size="small" />}
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        className="items-center"
                                        onPress={() => setActiveTab('login')}
                                    >
                                        <p className="text-brand-600 text-sm font-jakarta-semibold">Back to Login</p>
                                    </TouchableOpacity>
                                </div>
                            )}

                            {/* SCREEN C: LOGIN MODE */}
                            {activeTab === 'login' && (
                                <div className="space-y-5">
                                    <div>
                                        <p className={labelCls}>Email Address</p>
                                        <TextInput
                                            ref={registerInputRef('loginEmail')}
                                            onFocus={() => scrollToInput('loginEmail')}
                                            className={`${inputBase} border-sand-300`}
                                            placeholder="yourname@domain.com"
                                            placeholderTextColor="#A8A29E"
                                            autoCapitalize="none"
                                            keyboardType="email-address"
                                            value={formData.email}
                                            onChangeText={(text) => updateField('email', text)}
                                        />
                                    </div>

                                    <div>
                                        <p className={labelCls}>Password</p>
                                        <TextInput
                                            ref={registerInputRef('loginPassword')}
                                            onFocus={() => scrollToInput('loginPassword')}
                                            className={`${inputBase} border-sand-300`}
                                            placeholder="Enter your password"
                                            placeholderTextColor="#A8A29E"
                                            secureTextEntry
                                            autoCapitalize="none"
                                            value={formData.password}
                                            onChangeText={(text) => updateField('password', text)}
                                        />
                                    </div>

                                    <div className='flex-row items-center justify-between border-b border-sand-300 py-3'>
                                        <p className="text-[11px] font-jakarta-semibold uppercase tracking-[0.14em] text-sand-500">Log in as</p>
                                        <div className='flex-row' style={{ gap: 24 }}>
                                            <RoleOption value="buyer" label="Buyer" />
                                            <RoleOption value="seller" label="Seller" />
                                        </div>
                                    </div>

                                    <div className="items-end">
                                        <TouchableOpacity onPress={handleForgetPassword}>
                                            <p className="text-brand-600 text-sm font-jakarta-semibold">Forgot Password?</p>
                                        </TouchableOpacity>
                                    </div>

                                    <TouchableOpacity
                                        className={`${loginButtonStyle} ${loginLoading ? 'opacity-60' : 'opacity-100'}`}
                                        onPress={handleLogin}
                                        disabled={loginDisabled}
                                        style={{ gap: 10 }}
                                    >
                                        <p className={loginpStyle}>
                                            {loginLoading ? 'Signing In...' : 'Sign In'}
                                        </p>
                                        {loginLoading && <ActivityIndicator color="#1C1917" size="small" />}
                                    </TouchableOpacity>

                                    <div className="flex-row items-center my-2">
                                        <div className="flex-1 h-px bg-sand-200" />
                                        <p className="mx-4 text-sand-400 text-[11px] font-jakarta-semibold uppercase tracking-[0.14em]">Or continue with</p>
                                        <div className="flex-1 h-px bg-sand-200" />
                                    </div>

                                    {/* GOOGLE BUTTON */}
                                    <TouchableOpacity
                                        className="w-full flex-row items-center justify-center bg-white border border-sand-200 py-4 rounded-md active:bg-sand-100"
                                        onPress={handleGoogleLogin}
                                        disabled={googleLoginLoading}
                                        style={{ gap: 10 }}
                                    >
                                        <img
                                            src={require('../../assets/imgs/google-icon.png')}
                                            className="w-5 h-5 object-contain"
                                            resizeMode="contain"
                                        />
                                        <p className="text-sand-900 font-jakarta-semibold text-base">Google</p>
                                        {googleLoginLoading && <ActivityIndicator color="#1C1917" size="small" />}
                                    </TouchableOpacity>
                                </div>
                            )}

                            {/* SCREEN D: REGISTRATION MODE */}
                            {activeTab === 'register' && (
                                <div className="space-y-5">
                                    <div className="flex-row" style={{ gap: 16 }}>
                                        <div className="flex-1">
                                            <p className={labelCls}>First Name</p>
                                            <TextInput
                                                ref={registerInputRef('firstName')}
                                                onFocus={() => scrollToInput('firstName')}
                                                className={`${inputBase} border-sand-300`}
                                                placeholder="John"
                                                placeholderTextColor="#A8A29E"
                                                value={formData.firstName}
                                                onChangeText={(text) => updateField('firstName', text)}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <p className={labelCls}>Last Name</p>
                                            <TextInput
                                                ref={registerInputRef('lastName')}
                                                onFocus={() => scrollToInput('lastName')}
                                                className={`${inputBase} border-sand-300`}
                                                placeholder="Doe"
                                                placeholderTextColor="#A8A29E"
                                                value={formData.lastName}
                                                onChangeText={(text) => updateField('lastName', text)}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <p className={labelCls}>Phone Number</p>
                                        <TextInput
                                            ref={registerInputRef('phoneNumber')}
                                            onFocus={() => scrollToInput('phoneNumber')}
                                            className={`${inputBase} border-sand-300`}
                                            placeholder="+254 700 000 000"
                                            placeholderTextColor="#A8A29E"
                                            keyboardType="phone-pad"
                                            value={formData.phoneNumber}
                                            onChangeText={(text) => updateField('phoneNumber', text)}
                                        />
                                    </div>

                                    <div>
                                        <p className={labelCls}>Email Address</p>
                                        <TextInput
                                            ref={registerInputRef('registerEmail')}
                                            onFocus={() => scrollToInput('registerEmail')}
                                            className={`${inputBase} border-sand-300`}
                                            placeholder="name@example.com"
                                            placeholderTextColor="#A8A29E"
                                            autoCapitalize="none"
                                            keyboardType="email-address"
                                            value={formData.email}
                                            onChangeText={(text) => updateField('email', text)}
                                        />
                                    </div>

                                    <div>
                                        <p className={labelCls}>Password</p>
                                        <TextInput
                                            ref={registerInputRef('registerPassword')}
                                            onFocus={() => scrollToInput('registerPassword')}
                                            className={`${inputBase} ${getRegisteringError()?.message ? 'border-market-500' : 'border-sand-300'}`}
                                            placeholder="Minimum 6 characters"
                                            placeholderTextColor="#A8A29E"
                                            secureTextEntry
                                            autoCapitalize="none"
                                            value={formData.password}
                                            onChangeText={(text) => updateField('password', text)}
                                        />
                                        {getRegisteringError()?.key == 'password' && <p className='text-sm text-market-500 mt-1.5'>
                                            {getRegisteringError()?.message}
                                            </p>}
                                    </div>

                                    <div>
                                        <p className={labelCls}>Confirm Password</p>
                                        <TextInput
                                            ref={registerInputRef('registerConfirmPassword')}
                                            onFocus={() => scrollToInput('registerConfirmPassword')}
                                            className={`${inputBase} ${getMatchFieldStyle(formData.password, formData.confirmPassword)}`}
                                            placeholder="Repeat your password"
                                            placeholderTextColor="#A8A29E"
                                            secureTextEntry
                                            autoCapitalize="none"
                                            value={formData.confirmPassword}
                                            onChangeText={(text) => updateField('confirmPassword', text)}
                                        />
                                        {registerMatchState === 'mismatch' && (
                                            <p className="text-market-600 text-xs mt-1.5">Passwords do not match</p>
                                        )}
                                        {registerMatchState === 'match' && (
                                            <p className="text-delivery-600 text-xs mt-1.5">Passwords match</p>
                                        )}
                                    </div>

                                    <TouchableOpacity
                                        className={`${registerButtonStyle} ${registerLoading ? 'opacity-60' : 'opacity-100'}`}
                                        onPress={handleRegister}
                                        disabled={registerDisabled}
                                        style={{ gap: 10 }}
                                    >
                                        <p className={registerpStyle}>
                                            {registerLoading ? 'Creating Account...' : 'Create Account'}
                                        </p>
                                        {registerLoading && <ActivityIndicator color="#1C1917" size="small" />}
                                    </TouchableOpacity>
                                </div>
                            )}

                        </div>
                    </div>
                </KeyboardAwareScrolldiv>
            </div>
        </div>
    );
}
