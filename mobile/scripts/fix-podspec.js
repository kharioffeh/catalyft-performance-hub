#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Fix all podspec files with add_dependency issues
const podspecFiles = [
  'expo-dev-launcher/expo-dev-launcher.podspec',
  'expo-dev-menu/expo-dev-menu.podspec',
  'expo-modules-core/ExpoModulesCore.podspec'
];

let fixedCount = 0;

podspecFiles.forEach(relativePath => {
  const podspecPath = path.join(__dirname, '..', 'node_modules', relativePath);
  
  if (fs.existsSync(podspecPath)) {
    let content = fs.readFileSync(podspecPath, 'utf8');
    
    // Fix the invalid add_dependency call
    const originalContent = content;
    content = content.replace(
      /add_dependency\([^,]+,\s*"React-jsinspector",\s*:framework_name\s*=>\s*'jsinspector_modern'\)/g,
      's.dependency "React-jsinspector"'
    );
    
    if (content !== originalContent) {
      fs.writeFileSync(podspecPath, content);
      console.log(`✅ Fixed ${relativePath} add_dependency issue`);
      fixedCount++;
    }
  } else {
    console.log(`⚠️  ${relativePath} not found, skipping fix`);
  }
});

if (fixedCount > 0) {
  console.log(`🎉 Fixed ${fixedCount} podspec file(s) with add_dependency issues`);
} else {
  console.log('ℹ️  No podspec files needed fixing');
}

// Also fix Gradle wrapper version
const gradleWrapperPath = path.join(__dirname, '..', 'android', 'gradle', 'wrapper', 'gradle-wrapper.properties');
if (fs.existsSync(gradleWrapperPath)) {
  let gradleWrapper = fs.readFileSync(gradleWrapperPath, 'utf8');
  const originalWrapper = gradleWrapper;
  gradleWrapper = gradleWrapper.replace(
    /distributionUrl=https\\:\/\/services\.gradle\.org\/distributions\/gradle-[\d\.]+-all\.zip/,
    'distributionUrl=https\\://services.gradle.org/distributions/gradle-8.2-all.zip'
  );
  if (gradleWrapper !== originalWrapper) {
    fs.writeFileSync(gradleWrapperPath, gradleWrapper);
    console.log('✅ Fixed Gradle wrapper version to 8.2');
  }
}

// Fix lottie-react-native buildConfig issue
const lottieBuildGradlePath = path.join(__dirname, '..', 'node_modules', 'lottie-react-native', 'android', 'build.gradle');
if (fs.existsSync(lottieBuildGradlePath)) {
  let lottieBuildGradle = fs.readFileSync(lottieBuildGradlePath, 'utf8');
  const originalLottieContent = lottieBuildGradle;
  
  // Check if buildConfig is already enabled
  if (!lottieBuildGradle.includes('buildConfig true')) {
    // Add buildConfig feature to android block
    lottieBuildGradle = lottieBuildGradle.replace(
      /android\s*\{/,
      "android {\n    buildFeatures {\n        buildConfig true\n    }"
    );
    
    if (lottieBuildGradle !== originalLottieContent) {
      fs.writeFileSync(lottieBuildGradlePath, lottieBuildGradle, 'utf8');
      console.log('✅ Fixed lottie-react-native buildConfig issue');
    }
  }
}

// Fix stripe-react-native namespace issue for AGP 8.2.2
const stripeBuildGradlePath = path.join(__dirname, '..', 'node_modules', '@stripe', 'stripe-react-native', 'android', 'build.gradle');
if (fs.existsSync(stripeBuildGradlePath)) {
  let stripeBuildGradle = fs.readFileSync(stripeBuildGradlePath, 'utf8');
  const originalStripeContent = stripeBuildGradle;
  
  // Check if namespace is already specified
  if (!stripeBuildGradle.includes('namespace =')) {
    // Add namespace to android block
    stripeBuildGradle = stripeBuildGradle.replace(
      /android\s*\{/,
      "android {\n    namespace = 'com.reactnativestripesdk'"
    );
    
    if (stripeBuildGradle !== originalStripeContent) {
      fs.writeFileSync(stripeBuildGradlePath, stripeBuildGradle, 'utf8');
      console.log('✅ Fixed stripe-react-native namespace issue');
    }
  }
}

// Fix Kotlin version in project build.gradle to ensure consistency
const projectBuildGradlePath = path.join(__dirname, '..', 'android', 'build.gradle');
if (fs.existsSync(projectBuildGradlePath)) {
  let projectBuildGradle = fs.readFileSync(projectBuildGradlePath, 'utf8');
  const originalProjectContent = projectBuildGradle;
  
  // Fix Kotlin version fallback to use 1.7.10 instead of 1.9.23
  projectBuildGradle = projectBuildGradle.replace(
    /kotlinVersion = findProperty\('android\.kotlinVersion'\) \?\: '1\.9\.23'/,
    "kotlinVersion = findProperty('android.kotlinVersion') ?: '1.7.10'"
  );
  
  // Ensure Kotlin version is explicitly set in root project ext for Expo modules
  if (!projectBuildGradle.includes('rootProject.ext.kotlinVersion')) {
    // Add kotlinVersion to the ext block if it doesn't exist
    if (!projectBuildGradle.includes('kotlinVersion = findProperty')) {
      projectBuildGradle = projectBuildGradle.replace(
        /ext\s*\{/,
        "ext {\n        kotlinVersion = findProperty('android.kotlinVersion') ?: '1.7.10'"
      );
    }
  }
  
  if (projectBuildGradle !== originalProjectContent) {
    fs.writeFileSync(projectBuildGradlePath, projectBuildGradle, 'utf8');
    console.log('✅ Fixed Kotlin version consistency in project build.gradle');
  }
}

// Force Kotlin version in all Expo modules to ensure consistency
const expoModules = [
  'expo-modules-core',
  'expo-dev-launcher',
  'expo-dev-menu',
  'expo-splash-screen',
  'expo-updates'
];

expoModules.forEach(moduleName => {
  const moduleBuildGradlePath = path.join(__dirname, '..', 'node_modules', moduleName, 'android', 'build.gradle');
  if (fs.existsSync(moduleBuildGradlePath)) {
    let moduleBuildGradle = fs.readFileSync(moduleBuildGradlePath, 'utf8');
    const originalModuleContent = moduleBuildGradle;
    
    // Force Kotlin version to 1.7.10 in all Expo modules
    moduleBuildGradle = moduleBuildGradle.replace(
      /implementation "org\.jetbrains\.kotlin:kotlin-stdlib[^"]*:\$\{kotlinVersion\(\)\}"/g,
      'implementation "org.jetbrains.kotlin:kotlin-stdlib-jdk7:1.7.10"'
    );
    moduleBuildGradle = moduleBuildGradle.replace(
      /implementation "org\.jetbrains\.kotlin:kotlin-reflect:\$\{kotlinVersion\(\)\}"/g,
      'implementation "org.jetbrains.kotlin:kotlin-reflect:1.7.10"'
    );
    
    if (moduleBuildGradle !== originalModuleContent) {
      fs.writeFileSync(moduleBuildGradlePath, moduleBuildGradle, 'utf8');
      console.log(`✅ Fixed Kotlin version in ${moduleName}`);
    }
  }
});

// Fix ExpoModulesCorePlugin.gradle to use Kotlin 1.7.10
const expoModulesCorePluginPath = path.join(__dirname, '..', 'node_modules', 'expo-modules-core', 'android', 'ExpoModulesCorePlugin.gradle');
if (fs.existsSync(expoModulesCorePluginPath)) {
  let pluginContent = fs.readFileSync(expoModulesCorePluginPath, 'utf8');
  const originalPluginContent = pluginContent;
  
  // Replace all hardcoded Kotlin 1.9.23 references with 1.7.10
  pluginContent = pluginContent.replace(/1\.9\.23/g, '1.7.10');
  
  // Also force any other Kotlin version references to 1.7.10
  pluginContent = pluginContent.replace(/kotlinVersion.*?:\s*"[^"]*"/g, 'kotlinVersion ?: "1.7.10"');
  
  if (pluginContent !== originalPluginContent) {
    fs.writeFileSync(expoModulesCorePluginPath, pluginContent, 'utf8');
    console.log('✅ Fixed Kotlin version in ExpoModulesCorePlugin.gradle');
  }
}

// Fix gradle.properties to force Kotlin version
const gradlePropertiesPath = path.join(__dirname, '..', 'android', 'gradle.properties');
if (fs.existsSync(gradlePropertiesPath)) {
  let gradleProperties = fs.readFileSync(gradlePropertiesPath, 'utf8');
  const originalGradleProperties = gradleProperties;
  
  // Force Kotlin version in gradle.properties
  if (!gradleProperties.includes('kotlin.version=1.7.10')) {
    gradleProperties += '\n# Force Kotlin version for consistency\nkotlin.version=1.7.10\n';
  }
  
  // Also force Kotlin compiler version
  if (!gradleProperties.includes('kotlin.compiler.execution.strategy=in-process')) {
    gradleProperties += 'kotlin.compiler.execution.strategy=in-process\n';
  }
  
  if (gradleProperties !== originalGradleProperties) {
    fs.writeFileSync(gradlePropertiesPath, gradleProperties, 'utf8');
    console.log('✅ Fixed Kotlin version in gradle.properties');
  }
}