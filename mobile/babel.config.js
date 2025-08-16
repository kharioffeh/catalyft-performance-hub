module.exports = function (api) {
  api.cache(true);
  
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Remove react-native-dotenv plugin since we're using react-native-config
      // The app uses Config from 'react-native-config' for environment variables
    ],
  };
};