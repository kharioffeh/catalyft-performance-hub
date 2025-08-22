module.exports = function (api) {
  api.cache(true);
  
  const plugins = [];
  
  // Only add reanimated plugin if not in CI
  if (!process.env.CI) {
    try {
      // Try to resolve the plugin first
      require.resolve('react-native-reanimated/plugin');
      plugins.push('react-native-reanimated/plugin');
    } catch (e) {
      // Plugin not available, skip it
      console.log('Skipping reanimated plugin - not available');
    }
  }
  
  return {
    presets: ['babel-preset-expo'],
    plugins,
  };
};