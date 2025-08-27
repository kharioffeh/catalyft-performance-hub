const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Fix for Hermes engine
config.resolver.sourceExts = [...config.resolver.sourceExts, 'cjs'];

// Ensure proper module resolution
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Fix for require() not defined error
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

module.exports = config;