/*import api from '@/utils/api';
import * as Application from '@/utils/platform/application';
import * as Updates from '@/utils/platform/updates';
import { useEffect } from 'react';
import { Alert, Linking } from '@/components/common/ui';

export const useAppUpdates = () => {
  useEffect(() => {
    async function checkUpdates() {
      if (__DEV__) return;

      try {
        // 1. Check for Instant OTA Updates
        const update = await Updates.checkForUpdateAsync();

        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();

          Alert.alert(
            "New Update Ready",
            "An update has been downloaded. Restart app now?",
            [
              { text: "Later", style: "cancel" },
              { text: "Restart", onPress: async () => await Updates.reloadAsync() }
            ]
          );
          return;
        }

        // 2. Check Django API for Native APK Updates
        await checkNativeApkUpdate();

      } catch (error) {
        console.log("Error checking for app updates:", error);
      }
    }

    checkUpdates();
  }, []);
};

async function checkNativeApkUpdate() {
  // ✅ Constants.nativeBuildVersion reads the Android versionCode directly from the native binary
  const rawVersion = Application.nativeBuildVersion || "1";
  const currentVersionCode = parseInt(String(rawVersion), 10);

  try {
    const response = await api.get('app-version/latest/');
    const data = response.data;

    console.log("Local Native Code:", currentVersionCode);
    console.log("Remote Code from Server:", data.latestVersionCode);

    if (data.latestVersionCode > currentVersionCode) {
      Alert.alert(
        "Major Update Available",
        "A new version of the app is available with critical updates.",
        [
          {
            text: "Download Now",
            onPress: () => Linking.openURL(data.download_url)
          }
        ],
        { cancelable: !data.forceUpdate }
      );
    }
  } catch (err) {
    console.log("Could not reach version server:", err);
  }
}
*/