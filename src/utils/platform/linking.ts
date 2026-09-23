/** expo-linking → window.location / URL */

export const createURL = (path: string, options?: { scheme?: string }) =>
  `${options?.scheme || 'app'}://${String(path).replace(/^\/+/, '')}`;

export const parse = (url: string) => {
  try {
    const parsed = new URL(url);
    const queryParams: Record<string, string> = {};
    parsed.searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });
    return {
      scheme: parsed.protocol.replace(':', ''),
      hostname: parsed.hostname,
      path: parsed.pathname,
      queryParams,
    };
  } catch {
    return { scheme: null, hostname: null, path: null, queryParams: {} };
  }
};

export const openURL = async (url: string) => {
  window.location.href = url;
};

export const canOpenURL = async (_url: string) => true;

export const openSettings = async () => {};

export const getInitialURL = async () => window.location.href;

export const addEventListener = (_type: string, _handler: any) => ({ remove: () => {} });

export const removeEventListener = () => {};

export const useURL = () => [window.location.href, () => {}] as const;

export default { createURL, parse, openURL, canOpenURL, openSettings, getInitialURL, addEventListener };
