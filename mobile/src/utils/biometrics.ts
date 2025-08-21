// Safe wrapper for react-native-biometrics
// Handles cases where native modules aren't available (CI/testing)

let ReactNativeBiometrics: any;

try {
  ReactNativeBiometrics = require('react-native-biometrics').default;
} catch (error) {
  // Fallback for when native modules aren't available
  console.log('react-native-biometrics not available, using mock');
  
  // Mock implementation for CI/testing
  ReactNativeBiometrics = class MockBiometrics {
    static async isSensorAvailable() {
      return {
        available: false,
        biometryType: null,
        error: 'Not available in CI'
      };
    }
    
    static async simplePrompt(options: any) {
      return {
        success: false,
        error: 'Not available in CI'
      };
    }
    
    static async createKeys() {
      return {
        publicKey: 'mock-key'
      };
    }
    
    static async deleteKeys() {
      return {
        keysDeleted: true
      };
    }
    
    static async createSignature(options: any) {
      return {
        success: false,
        signature: '',
        error: 'Not available in CI'
      };
    }
    
    static async biometricKeysExist() {
      return {
        keysExist: false
      };
    }
  };
}

export default ReactNativeBiometrics;