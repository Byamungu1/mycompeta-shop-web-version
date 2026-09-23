import { useGlobalContext } from '@/context/globalContext';
import { Redirect, useFocusEffect } from '@/router';
import { useCallback } from 'react';

export default function Index() {
  const { sellerProfile, user, isLoading, refetchLoginRole, loginRole } = useGlobalContext();

  useFocusEffect(
    useCallback(() => {
      refetchLoginRole()
    }, []))


  if (isLoading) return null; // or a splash/loading screen

  if (!user) return <Redirect href="/login" />;

   console.log('the seller in index', sellerProfile)
   console.log('the login role', loginRole)
   console.log('the user', user)
   console.log('is loading', isLoading)

  if (loginRole == 'buyer' && user) {
    return <Redirect href="/(root)/(buyerTabs)" />;
  } else if (user && sellerProfile && loginRole == 'seller') {
    return <Redirect href="/(root)/(sellerTabs)" />;
  }else{
      return <Redirect href="/login" />
  }


}