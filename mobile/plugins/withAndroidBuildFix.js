const { withProjectBuildGradle, withSettingsGradle, withAppBuildGradle, withGradleProperties } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const withAndroidBuildFix = (config) => {
  // Fix build.gradle for React Native 0.72.15 compatibility
  config = withProjectBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      let buildGradle = config.modResults.contents;
      
      // Fix Android Gradle Plugin version
      buildGradle = buildGradle.replace(
        /classpath\('com\.android\.tools\.build:gradle'\)/,
        "classpath('com.android.tools.build:gradle:7.3.1')"
      );
      
      // Fix Kotlin version to be compatible with React Native Gradle plugin
      buildGradle = buildGradle.replace(
        /classpath\('org\.jetbrains\.kotlin:kotlin-gradle-plugin'\)/,
        "classpath('org.jetbrains.kotlin:kotlin-gradle-plugin:1.8.0')"
      );
      
      // Remove React Native Gradle plugin classpath since we're using local version
      buildGradle = buildGradle.replace(
        /classpath\('com\.facebook\.react:react-native-gradle-plugin'\)/,
        ""
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
      
      // Remove React Native plugin
      appBuildGradle = appBuildGradle.replace(
        /apply plugin: "com\.facebook\.react"/,
        "// apply plugin: \"com.facebook.react\""
      );
      
      config.modResults.contents = appBuildGradle;
    }
    return config;
  });

  // Fix settings.gradle for React Native 0.72.15 compatibility
  config = withSettingsGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      let settingsGradle = config.modResults.contents;
      
      // Remove React Native settings plugin completely
      settingsGradle = settingsGradle.replace(
        /plugins \{ id\("com\.facebook\.react\.settings"\) \}/,
        ""
      );
      
      // Add includeBuild for React Native Gradle plugin to use local version
      if (!settingsGradle.includes('includeBuild(new File([')) {
        settingsGradle = settingsGradle.replace(
          /rootProject\.name = .*/,
          'rootProject.name = "Catalyft"\n\nincludeBuild(new File(["node", "--print", "require.resolve(\'@react-native/gradle-plugin/package.json\')"].execute(null, rootDir).text.trim()).getParentFile().toString())'
        );
      }
      
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

  // Fix Gradle wrapper version after prebuild
  config = withGradleProperties(config, (config) => {
    // This will run after prebuild, so we can fix the gradle wrapper
    const gradleWrapperPath = path.join(config.modRequest.platformProjectRoot, 'gradle', 'wrapper', 'gradle-wrapper.properties');
    if (fs.existsSync(gradleWrapperPath)) {
      let gradleWrapper = fs.readFileSync(gradleWrapperPath, 'utf8');
      gradleWrapper = gradleWrapper.replace(
        /distributionUrl=https\\:\/\/services\.gradle\.org\/distributions\/gradle-[\d\.]+-all\.zip/,
        'distributionUrl=https\\://services.gradle.org/distributions/gradle-8.3-all.zip'
      );
      fs.writeFileSync(gradleWrapperPath, gradleWrapper);
    }
    return config;
  });

  return config;
};

module.exports = withAndroidBuildFix;