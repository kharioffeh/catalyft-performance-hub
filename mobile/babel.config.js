module.exports = function (api) {
  api.cache(true);
  
  // Determine which .env file to use based on the environment
  const envMode = process.env.NODE_ENV || 'development';
  let envPath = '.env';
  
  if (envMode === 'production') {
    envPath = '.env.production';
  } else if (envMode === 'staging') {
    envPath = '.env.staging';
  }
  
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module:react-native-dotenv', {
        envName: 'APP_ENV',
        moduleName: 'react-native-config',
        path: envPath,
        safe: false,
        allowUndefined: true,
        verbose: false,
      }]
    ],
  };
};