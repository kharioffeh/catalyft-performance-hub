module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Reanimated plugin temporarily disabled for CI compatibility
      // Will be re-enabled once worklets dependency is properly configured
      // 'react-native-reanimated/plugin'
    ],
  };
};