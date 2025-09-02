const { withProjectBuildGradle, withSettingsGradle, withAppBuildGradle, withGradleProperties } = require('@expo/config-plugins');

const withAndroidBuildFix = (config) => {
  // Fix build.gradle for React Native 0.72.15 compatibility
  config = withProjectBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      let buildGradle = config.modResults.contents;
      
      // Fix Android Gradle Plugin version
      buildGradle = buildGradle.replace(
        /classpath\('com\.android\.tools\.build:gradle'\)/,
        "classpath('com.android.tools.build:gradle:8.1.0')"
      );
      
      // Fix Kotlin version to be compatible with React Native Gradle plugin
      buildGradle = buildGradle.replace(
        /classpath\('org\.jetbrains\.kotlin:kotlin-gradle-plugin'\)/,
        "classpath('org.jetbrains.kotlin:kotlin-gradle-plugin:1.7.10')"
      );
      
      // Keep React Native Gradle plugin classpath but use compatible version
      buildGradle = buildGradle.replace(
        /classpath\('com\.facebook\.react:react-native-gradle-plugin'\)/,
        "classpath('com.facebook.react:react-native-gradle-plugin:0.72.11')"
      );
      
      // Comment out rootproject plugin
      buildGradle = buildGradle.replace(
        /apply plugin: "com\.facebook\.react\.rootproject"/,
        "// apply plugin: \"com.facebook.react.rootproject\""
      );
      
      config.modResults.contents = buildGradle;
    }
    return config;
  });

  // Fix app/build.gradle to remove React Native plugin
  config = withAppBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      let appBuildGradle = config.modResults.contents;
      
      // Keep React Native plugin
      // appBuildGradle = appBuildGradle.replace(
      //   /apply plugin: "com\.facebook\.react"/,
      //   "// apply plugin: \"com.facebook.react\""
      // );
      
      config.modResults.contents = appBuildGradle;
    }
    return config;
  });

  // Fix settings.gradle for React Native 0.72.15 compatibility
  config = withSettingsGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      let settingsGradle = config.modResults.contents;
      
      // Keep React Native settings plugin
      // settingsGradle = settingsGradle.replace(
      //   /plugins \{ id\("com\.facebook\.react\.settings"\) \}/,
      //   ""
      // );
      
      // Keep includeBuild for React Native Gradle plugin
      // settingsGradle = settingsGradle.replace(
      //   /includeBuild\(new File\(\["node", "--print", "require\.resolve\('@react-native\/gradle-plugin\/package\.json'\)"\]\.execute\(null, rootDir\)\.text\.trim\(\)\)\.getParentFile\(\)\.toString\(\)\)/,
      //   ""
      // );
      
      // Keep the second includeBuild for React Native Gradle plugin
      // settingsGradle = settingsGradle.replace(
      //   /includeBuild\(new File\(\["node", "--print", "require\.resolve\('@react-native\/gradle-plugin\/package\.json', \{ paths: \[require\.resolve\('react-native\/package\.json'\)\] \}\)"\]\.execute\(null, rootDir\)\.text\.trim\(\)\)\.getParentFile\(\)\)/,
      //   ""
      // );
      
      // Comment out version catalog - find the entire block and comment it out
      const versionCatalogRegex = /dependencyResolutionManagement\s*\{[^}]*versionCatalogs\s*\{[^}]*reactAndroidLibs\s*\{[^}]*\}[^}]*\}[^}]*\}/s;
      if (versionCatalogRegex.test(settingsGradle)) {
        settingsGradle = settingsGradle.replace(versionCatalogRegex, (match) => {
          return match.split('\n').map(line => '// ' + line).join('\n');
        });
      }
      
      config.modResults.contents = settingsGradle;
    }
    return config;
  });

  return config;
};

module.exports = withAndroidBuildFix;