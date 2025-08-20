module.exports = function (api) {
  api.cache(true);
  
  const plugins = [];
  
  // Skip heavy plugins in CI to speed up build
  if (process.env.CI !== 'true' && process.env.CI !== '1') {
    plugins.push('react-native-worklets/plugin');
    plugins.push('react-native-reanimated/plugin');
  }
  
  return {
    presets: ['babel-preset-expo'],
    plugins,
  };
};