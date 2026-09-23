import { useEffect, useState } from 'react';
import { Keyboard } from '@/components/common/ui';

/**
 * Custom hook to track whether the software keyboard is currently visible.
 * @returns boolean - true if keyboard is open, false otherwise.
 */
export const useKeyboardActive = (): {isKeyboardActive: boolean, setIsKeyboardActive: React.Dispatch<React.SetStateAction<boolean>>} => {
  const [isKeyboardActive, setIsKeyboardActive] = useState<boolean>(false);

  useEffect(() => {
    // 1. Listen for the native device events
    // Note: 'keyboardDidShow'/'keyboardDidHide' work smoothly on both Android and iOS
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setIsKeyboardActive(true);
    });
    
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardActive(false);
    });

    // 2. Safely remove active listener subscriptions on component unmount
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return {isKeyboardActive, setIsKeyboardActive};
};

export default useKeyboardActive;