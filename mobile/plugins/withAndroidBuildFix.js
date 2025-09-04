const { withProjectBuildGradle, withSettingsGradle, withAppBuildGradle, withGradleProperties, withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const withAndroidBuildFix = (config) => {
  // Fix project/build.gradle for React Native 0.72.15 compatibility
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
              "classpath('org.jetbrains.kotlin:kotlin-gradle-plugin:1.7.10')"
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
      
      // Add dependency resolution at project level to fix fbjni version conflict
      if (!buildGradle.includes('force \'com.facebook.fbjni:fbjni:0.3.0\'')) {
        // Try to add to existing allprojects block first
        if (buildGradle.includes('allprojects')) {
          buildGradle = buildGradle.replace(
            /allprojects\s*\{/,
            "allprojects {\n    configurations.all {\n        resolutionStrategy {\n            force 'com.facebook.fbjni:fbjni:0.3.0'\n        }\n    }"
          );
        } else {
          // Add new allprojects block if none exists
          buildGradle = buildGradle.replace(
            /buildscript\s*\{[\s\S]*?\}\s*$/,
            (match) => {
              return match + '\n\nallprojects {\n    configurations.all {\n        resolutionStrategy {\n            force \'com.facebook.fbjni:fbjni:0.3.0\'\n        }\n    }\n}';
            }
          );
        }
      }
      
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
      
      // Add dependency resolution to fix fbjni version conflict
      if (!appBuildGradle.includes('configurations.all')) {
        appBuildGradle = appBuildGradle.replace(
          /android\s*\{[\s\S]*?\}/,
          (match) => {
            return match + '\n\nconfigurations.all {\n    resolutionStrategy {\n        force \'com.facebook.fbjni:fbjni:0.3.0\'\n    }\n}';
          }
        );
      }
      
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
  const gradleWrapperPath = path.join(__dirname, '..', 'android', 'gradle', 'wrapper', 'gradle-wrapper.properties');
  if (fs.existsSync(gradleWrapperPath)) {
    let gradleWrapper = fs.readFileSync(gradleWrapperPath, 'utf8');
    gradleWrapper = gradleWrapper.replace(
      /distributionUrl=https\\:\/\/services\.gradle\.org\/distributions\/gradle-[\d\.]+-all\.zip/,
      'distributionUrl=https\\://services.gradle.org/distributions/gradle-8.2-all.zip'
    );
    fs.writeFileSync(gradleWrapperPath, gradleWrapper);
  }

  // Fix Kotlin version in build.gradle to ensure consistency
  const projectBuildGradlePath = path.join(__dirname, '..', 'android', 'build.gradle');
  if (fs.existsSync(projectBuildGradlePath)) {
    let projectBuildGradle = fs.readFileSync(projectBuildGradlePath, 'utf8');
    const originalProjectContent = projectBuildGradle;
    
    // Fix Kotlin version fallback to use 1.7.10 instead of 1.9.23
    projectBuildGradle = projectBuildGradle.replace(
      /kotlinVersion = findProperty\('android\.kotlinVersion'\) \?\: '1\.9\.23'/,
      "kotlinVersion = findProperty('android.kotlinVersion') ?: '1.7.10'"
    );
    
    if (projectBuildGradle !== originalProjectContent) {
      fs.writeFileSync(projectBuildGradlePath, projectBuildGradle, 'utf8');
      console.log('✅ Fixed Kotlin version fallback in project build.gradle');
    }
  }

  // Enable buildConfig for all modules (including lottie-react-native)
  config = withDangerousMod(config, [
    'android',
    async (config) => {
      const androidDir = config.modRequest.platformProjectRoot;
      
      // Function to enable buildConfig in a build.gradle file
      const enableBuildConfig = (buildGradlePath) => {
        if (fs.existsSync(buildGradlePath)) {
          let content = fs.readFileSync(buildGradlePath, 'utf8');
          const originalContent = content;
          
          // Check if buildConfig is already enabled
          if (!content.includes('buildConfig true')) {
            // Add buildConfig feature to android block
            content = content.replace(
              /android\s*\{/,
              "android {\n    buildFeatures {\n        buildConfig true\n    }"
            );
            
            if (content !== originalContent) {
              fs.writeFileSync(buildGradlePath, content, 'utf8');
              console.log(`✅ Enabled buildConfig in ${buildGradlePath}`);
            }
          }
        }
      };
      
      // Enable buildConfig for all module build.gradle files
      const findAndFixBuildGradleFiles = (dir) => {
        if (!fs.existsSync(dir)) return;
        
        const items = fs.readdirSync(dir);
        for (const item of items) {
          const itemPath = path.join(dir, item);
          const stat = fs.statSync(itemPath);
          
          if (stat.isDirectory()) {
            // Check if this is a module directory (contains build.gradle)
            const buildGradlePath = path.join(itemPath, 'build.gradle');
            if (fs.existsSync(buildGradlePath)) {
              enableBuildConfig(buildGradlePath);
            }
            // Recursively search subdirectories
            findAndFixBuildGradleFiles(itemPath);
          }
        }
      };
      
      // Start from the android directory
      findAndFixBuildGradleFiles(androidDir);
      
      return config;
    },
  ]);

  return config;
};

module.exports = withAndroidBuildFix;