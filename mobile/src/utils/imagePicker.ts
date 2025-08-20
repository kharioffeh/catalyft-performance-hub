// Safe wrapper for react-native-image-picker
// Handles cases where native modules aren't available (CI/testing)

export type ImagePickerResponse = {
  didCancel?: boolean;
  errorCode?: string;
  errorMessage?: string;
  assets?: Array<{
    uri?: string;
    type?: string;
    fileName?: string;
    fileSize?: number;
    base64?: string;
  }>;
};

export type PhotoQuality = 0 | 0.1 | 0.2 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7 | 0.8 | 0.9 | 1;

export type ImageLibraryOptions = {
  mediaType?: 'photo' | 'video' | 'mixed';
  includeBase64?: boolean;
  maxHeight?: number;
  maxWidth?: number;
  quality?: PhotoQuality;
  selectionLimit?: number;
};

let imagePicker: any;

try {
  imagePicker = require('react-native-image-picker');
} catch (error) {
  // Fallback for when native modules aren't available
  console.log('react-native-image-picker not available, using mock');
  
  // Mock implementation for CI/testing
  imagePicker = {
    launchImageLibrary: (options: ImageLibraryOptions, callback?: (response: ImagePickerResponse) => void): Promise<ImagePickerResponse> => {
      const response: ImagePickerResponse = {
        didCancel: true,
        errorMessage: 'Not available in CI'
      };
      
      if (callback) {
        callback(response);
      }
      
      return Promise.resolve(response);
    },
    
    launchCamera: (options: ImageLibraryOptions, callback?: (response: ImagePickerResponse) => void): Promise<ImagePickerResponse> => {
      const response: ImagePickerResponse = {
        didCancel: true,
        errorMessage: 'Not available in CI'
      };
      
      if (callback) {
        callback(response);
      }
      
      return Promise.resolve(response);
    }
  };
}

export const { launchImageLibrary, launchCamera } = imagePicker;
export default imagePicker;