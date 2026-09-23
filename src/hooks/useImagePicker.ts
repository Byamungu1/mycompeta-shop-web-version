import * as imgPicker from '@/utils/platform/imagePicker';
import { useState } from 'react';
import { Alert } from '@/components/common/ui';

interface UseimgPickerOptions {
    onimgPicked?: (uri: string) => void;
}

export const useimgPicker = (options?: UseimgPickerOptions) => {
    const [img, setimg] = useState<string | null>(null);
    const [isPicking, setIsPicking] = useState<boolean>(false);

    const handlePickimg = async () => {
        setIsPicking(true);
        try {
            // Request permission to access the media gallery
            const permissionResult = await imgPicker.requestMediaLibraryPermissionsAsync();

            if (permissionResult.granted === false) {
                Alert.alert(
                    "Permission Required",
                    "You need to allow gallery access to upload product pictures for Competa Shop items."
                );
                return;
            }

            // Launch the system native media file picking tray overlay layout window
            const result = await imgPicker.launchimgLibraryAsync({
                mediaTypes: imgPicker.MediaTypeOptions.imgs, // Force imgs only
                allowsEditing: true,   // Show cropping grid
                aspect: [4, 3],        // Constrain crop box ratio aspect parameters
                quality: 1,            // Keep quality value scale high
            });

            // Check if the user didn't cancel out of the operation
            if (!result.canceled && result.assets && result.assets.length > 0) {
                const selectedimgUri = result.assets[0].uri;
                setimg(selectedimgUri);

                // Run side-effects if a parent container needs to capture the change
                if (options?.onimgPicked) {
                    options.onimgPicked(selectedimgUri);
                }
            }
        } catch (error) {
            console.error("Failed handling img picker runtime process:", error);
            Alert.alert("Error", "An error occurred while accessing the photo library.");
        } finally {
            setIsPicking(false);
        }
    };

    const clearimg = () => {
        setimg(null);
    };

    return {
        img,
        isPicking,
        handlePickimg,
        clearimg,
        setimg,
    };
};