/**
 * expo-image-picker (imported in the app as `expo-img-picker`) → <input type="file">.
 * Picked files are exposed with an object URL so previews keep working.
 */

export const MediaTypeOptions = {
  All: 'All',
  Videos: 'Videos',
  Images: 'Images',
  images: 'images',
  videos: 'videos',
} as const;

export const UIImagePickerControllerQualityType = {};

export const requestMediaLibraryPermissionsAsync = async () => ({
  status: 'granted',
  granted: true,
});

export const getMediaLibraryPermissionsAsync = async () => ({
  status: 'granted',
  granted: true,
});

export const requestCameraPermissionsAsync = async () => ({ status: 'granted', granted: true });

const pickFiles = (options?: {
  allowsMultipleSelection?: boolean;
  selectionLimit?: number;
  mediaTypes?: any;
  accept?: string;
}) =>
  new Promise<any>((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = options?.accept || 'image/*';
    if (options?.allowsMultipleSelection) {
      input.multiple = true;
      if (options?.selectionLimit && options.selectionLimit > 0) {
        input.multiple = true;
      }
    }

    input.onchange = () => {
      const files = Array.from(input.files || []);
      const assets = files.map((file) => ({
        uri: URL.createObjectURL(file),
        url: URL.createObjectURL(file),
        fileName: file.name,
        mimeType: file.type,
        type: file.type,
        fileSize: file.size,
        file,
      }));
      resolve({ canceled: assets.length === 0, assets });
    };

    // If the user cancels, the change event never fires; that is acceptable.
    input.click();
  });

export const launchImageLibraryAsync = (options?: any) => pickFiles(options);

// The ported code calls the renamed helper.
export const launchimgLibraryAsync = launchImageLibraryAsync;

export const launchCameraAsync = (options?: any) => pickFiles(options);

export default {
  MediaTypeOptions,
  requestMediaLibraryPermissionsAsync,
  getMediaLibraryPermissionsAsync,
  requestCameraPermissionsAsync,
  launchImageLibraryAsync,
  launchimgLibraryAsync,
  launchCameraAsync,
};
