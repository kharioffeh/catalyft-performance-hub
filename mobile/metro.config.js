const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// For CI builds, exclude heavy modules
if (process.env.CI === 'true' || process.env.CI === '1') {
  config.resolver.blockList = [
    /.*react-native-reanimated.*/,
    /.*react-native-svg.*/,
    /.*lottie-react-native.*/,
    /.*react-native-mmkv.*/,
    /.*react-native-biometrics.*/,
    /.*react-native-image-picker.*/,
    /.*react-native-keychain.*/,
    /.*react-native-config.*/,
    /.*react-native-haptic-feedback.*/,
    /.*react-native-worklets.*/,
  ];
}

module.exports = config;