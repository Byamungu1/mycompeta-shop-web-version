/**
 * expo-secure-store → localStorage.
 *
 * On the web the app's persistent storage (session tokens, the shopping cart,
 * direct-buy items) is backed by localStorage. The API stays async so the
 * existing `await SecureStore.getItemAsync(...)` call sites are unchanged.
 */

const storage = (): Storage | null => {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

export const getItemAsync = async (key: string): Promise<string | null> => {
  try {
    return storage()?.getItem(key) ?? null;
  } catch {
    return null;
  }
};

export const setItemAsync = async (key: string, value: string): Promise<void> => {
  try {
    storage()?.setItem(key, String(value));
  } catch {
    /* storage full / unavailable — ignore */
  }
};

export const deleteItemAsync = async (key: string): Promise<void> => {
  try {
    storage()?.removeItem(key);
  } catch {
    /* ignore */
  }
};

export const isAvailableAsync = async (): Promise<boolean> => storage() !== null;

export const getItem = getItemAsync;
export const setItem = setItemAsync;
export const deleteItem = deleteItemAsync;

export const AFTER_FIRST_UNLOCK = 'AFTER_FIRST_UNLOCK';
export const WHEN_UNLOCKED = 'WHEN_UNLOCKED';
export const ALWAYS = 'ALWAYS';
