module.exports = function (api) {
  api.cache(true);
  
  const plugins = [];
  
  // Only add reanimated plugin if not in CI or if the module exists
  if (!process.env.CI) {
    try {
      require.resolve('react-native-worklets-core');
      plugins.push('react-native-reanimated/plugin');
    } catch (e) {
      // Worklets not available, skip reanimated plugin
      console.log('Skipping reanimated plugin - worklets not available');
    }
  }
  
  return {
    presets: ['babel-preset-expo'],
    plugins,
  };
};