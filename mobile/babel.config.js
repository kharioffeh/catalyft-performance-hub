module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Add reanimated plugin if using animations
      'react-native-reanimated/plugin',
    ],
  };
};