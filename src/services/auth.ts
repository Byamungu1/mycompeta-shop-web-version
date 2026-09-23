import { FormData } from "@/interfaces/interface";
import api from "@/utils/api";
import * as Linking from '@/utils/platform/linking';
import * as SecureStorage from '@/utils/storage';
import * as WebBrowser from '@/utils/platform/webBrowser';

WebBrowser.maybeCompleteAuthSession();


export const login = async (formData: { email: string; password: string }) => {
   console.log('the email and passwrod', formData.email, formData.password)

   const response = await api.post('auth/login/', {
      email: formData.email,
      password: formData.password
   })
   console.log('the login data', response.data)
   return response
};

export const register = async (formData: FormData) => {
   console.log('the api public key', import.meta.env.VITE_API_URL)
   const response = await api.post('auth/register/', {
      email: formData.email,
      first_name: formData.firstName,
      last_name: formData.lastName,
      phone_number: formData.phoneNumber,
      password: formData.password
   })

   await SecureStorage.setItemAsync('formData', JSON.stringify(formData))

   return response
};

export const verifyOtp = async (formData: FormData) => {
   console.log('the form data', formData)

   const response = await api.post('auth/verify/', {
      email: formData.email,
      phone_number: formData.phoneNumber,
      first_name: formData.firstName,
      last_name: formData.lastName,
      password: formData.password,
      otp: formData.otp
   })
   return response

};

export const getUser = async () => {
   try {
      const response = await api.get('user/me/')
      return response
   } catch (erro) {
      return false
   }
}

export const getSellerProfile = async () => {
   const response = await api.get('sellers/')
   console.log('the seller', response.data)
   return response
}

export const getBuyerProfile = async () => {
   const response = api.get('buyer/profile/settings/')
   return response
}



export const googleLogin = async () => {
   await WebBrowser.warmUpAsync();

   // 1. Force the custom scheme ('mycompeta://login-callback')
   const redirectUri = Linking.createURL('login-callback', { scheme: 'mycompetashop' });
   console.log('📱 Expected Redirect URI for WebBrowser:', redirectUri);

   // 2. Append the redirectUri as a query parameter so Django knows where to deep link back
   const baseUrl = `${import.meta.env.VITE_API_URL || 'https://shop.mycompeta.online/api/'}auth/google/login/`; //'http://10.93.105.42:8000/api/auth/google/login/' 
   const backendLoginUrl = `${baseUrl}?redirect_uri=${encodeURIComponent(redirectUri)}`;

   try {
      // 3. Open the browser session listening specifically for mycompeta://
      const result = await WebBrowser.openAuthSessionAsync(backendLoginUrl, redirectUri);

      if (result.type === 'success' && result.url) {
         const credentials = await processTokenRedirect(result.url);
         return credentials;
      }

      return false;
   } catch (err) {
      console.error('Login error:', err);
      return false;
   } finally {
      // Clean up browser instance
      await WebBrowser.coolDownAsync();
   }
};

const processTokenRedirect = async (url: string) => {
   try {
      const parsedUrl = Linking.parse(url);
      const { access, refresh, error } = parsedUrl.queryParams as {
         access?: string;
         refresh?: string;
         error?: string;
      };

      if (error) {
         console.error('Auth error param:', error);
         return false;
      }

      if (access && refresh) {
         return { access, refresh };
      }
   } catch (e) {
      console.error('Error parsing token deep link:', e);
   }
   return false;
};

export const sendResetPassswordCode = async (formData: FormData) => {
   try {
      const response = await api.post('auth/reset', {
         email: formData.email,
         code: formData.otp
      })
      return response
   } catch (errors) {
      throw errors
   }
}

export const verifyResetPasswordCode = async (formData: FormData) => {
   try {
      const response = await api.post('auth/reset-verify-otp', {
         email: formData.email,
         otp: formData.otp,
         password: formData.password,
         confirm_password: formData.confirmPassword
      })
      return response

   } catch (errors) {
      throw errors
   }

}

