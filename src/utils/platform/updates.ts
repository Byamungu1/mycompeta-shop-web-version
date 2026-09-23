/** expo-updates → no OTA updates on the web. */

export const checkForUpdateAsync = async () => ({
  isAvailable: false,
  isRollBackToEmbedded: false,
  manifest: null,
});

export const fetchUpdateAsync = async () => ({ isNew: false });

export const reloadAsync = async () => {
  window.location.reload();
};

export const addListener = (_event: string, _cb: any) => ({ remove: () => {} });

export const useUpdates = () => ({
  isChecking: false,
  isDownloading: false,
  isUpdateAvailable: false,
  isUpdatePending: false,
  availableUpdate: null,
  downloadedUpdate: null,
  checkError: null,
  downloadError: null,
  initializationError: null,
  lastCheckForUpdateTimeSinceRestart: null,
});

export const isEnabled = false;
export const updateId = null;
export const channel = null;
export const runtimeVersion = '1.0.1';

export default { checkForUpdateAsync, fetchUpdateAsync, reloadAsync, useUpdates };
