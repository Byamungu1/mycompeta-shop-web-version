/** expo-web-browser → window.open */

export const maybeCompleteAuthSession = () => {};

export const warmUpAsync = async () => {};

export const coolDownAsync = async () => {};

export const openBrowserAsync = async (url: string) => {
  window.open(url, '_blank', 'noopener,noreferrer');
  return { type: 'opened' };
};

/**
 * On the web the OAuth round-trip cannot deep-link back into a custom scheme,
 * so this opens the provider page in a popup and reports "dismissed". Google
 * sign-in therefore needs a web redirect URI configured on the backend.
 */
export const openAuthSessionAsync = async (url: string, _redirectUrl?: string) => {
  const resolved = url.startsWith('http') ? url : window.location.origin + url;
  window.open(resolved, '_blank', 'noopener,noreferrer,width=520,height=640');
  return { type: 'dismiss' as const, url: null };
};

export const dismissBrowser = () => {};

export const dismissAuthSession = () => {};

export const mayBeCompleteAuthSession = () => false;

export const WebBrowserAuthSessionResult = {};

export default { maybeCompleteAuthSession, warmUpAsync, coolDownAsync, openBrowserAsync, openAuthSessionAsync };
