const { withGradleProperties, withAppBuildGradle } = require('@expo/config-plugins');

module.exports = function withAndroidGradleConfig(config) {
  // Update gradle.properties
  config = withGradleProperties(config, (config) => {
    // Add Java 17 configuration
    config.modResults.push({
      type: 'property',
      key: 'org.gradle.jvmargs',
      value: '-Xmx2048m -XX:MaxMetaspaceSize=512m'
    });
    
    config.modResults.push({
      type: 'property',
      key: 'org.gradle.parallel',
      value: 'true'
    });
    
    config.modResults.push({
      type: 'property',
      key: 'org.gradle.daemon',
      value: 'true'
    });
    
    config.modResults.push({
      type: 'property',
      key: 'android.enableJetifier',
      value: 'true'
    });

    return config;
  });

  // Update app-level build.gradle
  config = withAppBuildGradle(config, (config) => {
    // Add Java compilation options
    if (!config.modResults.contents.includes('compileOptions')) {
      config.modResults.contents = config.modResults.contents.replace(
        /android\s*\{/,
        `android {
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }`
      );
    }

    return config;
  });

  return config;
};