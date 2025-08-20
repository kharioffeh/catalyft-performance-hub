module.exports = function (api) {
  api.cache(true);
  
  const plugins = [];
  
  // Only add plugin if not in CI
  if (process.env.CI !== 'true') {
    plugins.push('react-native-reanimated/plugin');
  }
  
  return {
    presets: ['babel-preset-expo'],
    plugins,
  };
};