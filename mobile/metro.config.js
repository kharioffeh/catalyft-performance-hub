const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.alias = {
  src: path.resolve(__dirname, 'src'),
};

// Add support for react-native-config
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config;
