import api from '@/utils/api';
import { useState, useEffect } from 'react';

interface AppUpdateInfo {
  latestVersionCode: number;
  download_url: string;
  version_name: string;
  release_notes: string;
  forceUpdate: boolean;
}

export const useAppUpdates = () => {
  const [updateInfo, setUpdateInfo] = useState<AppUpdateInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkForUpdates = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get('app-version/latest/');
      const data = response.data;

      setUpdateInfo({
        latestVersionCode: data.latestVersionCode,
        download_url: data.download_url,
        version_name: data.version_name || 'Latest',
        release_notes: data.release_notes || 'Bug fixes and improvements',
        forceUpdate: data.forceUpdate || false
      });
    } catch (err) {
      console.error('Could not reach version server:', err);
      setError('Failed to check for updates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkForUpdates();
  }, []);

  return {
    updateInfo,
    loading,
    error,
    checkForUpdates
  };
};
