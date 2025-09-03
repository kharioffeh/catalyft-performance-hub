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
        "classpath('com.android.tools.build:gradle:8.2.2')"
      );
      
      // Fix Kotlin version to be compatible with React Native Gradle plugin
      buildGradle = buildGradle.replace(
        /classpath\('org\.jetbrains\.kotlin:kotlin-gradle-plugin'\)/,
        "classpath('org.jetbrains.kotlin:kotlin-gradle-plugin:1.9.0')"
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

  // Fix app/build.gradle to apply React Native plugin and fix version catalog references
  config = withAppBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      let appBuildGradle = config.modResults.contents;
      
      // Apply React Native plugin
      appBuildGradle = appBuildGradle.replace(
        /\/\/ apply plugin: "com\.facebook\.react"/,
        "apply plugin: \"com.facebook.react\""
      );
      
      // Replace version catalog references with hardcoded versions
      appBuildGradle = appBuildGradle.replace(
        /\$\{reactAndroidLibs\.versions\.fresco\.get\(\)\}/g,
        "2.5.0"
      );
      
      // Enable buildConfig feature
      appBuildGradle = appBuildGradle.replace(
        /android\s*\{/,
        "android {\n    buildFeatures {\n        buildConfig true\n    }"
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
      
      // Comment out version catalog to avoid libs.versions.toml dependency
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

  // Fix Gradle wrapper version after prebuild
  const gradleWrapperPath = path.join(__dirname, '..', 'android', 'gradle', 'wrapper', 'gradle-wrapper.properties');
  if (fs.existsSync(gradleWrapperPath)) {
    let gradleWrapper = fs.readFileSync(gradleWrapperPath, 'utf8');
    gradleWrapper = gradleWrapper.replace(
      /distributionUrl=https\\:\/\/services\.gradle\.org\/distributions\/gradle-[\d\.]+-all\.zip/,
      'distributionUrl=https\\://services.gradle.org/distributions/gradle-8.2-all.zip'
    );
    fs.writeFileSync(gradleWrapperPath, gradleWrapper);
  }

  return config;
};

module.exports = withAndroidBuildFix;