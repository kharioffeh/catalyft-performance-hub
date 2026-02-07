#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Running postinstall fixes for React Native / Expo build...\n');

// =============================================================================
// FIX 1: jsinspector-modern header issues in podspec files
// =============================================================================
const podspecFiles = [
  'expo-dev-launcher/expo-dev-launcher.podspec',
  'expo-dev-menu/expo-dev-menu.podspec',
  'expo-modules-core/ExpoModulesCore.podspec',
  'react-native/ReactCommon/jsinspector-modern/React-jsinspector.podspec'
];

let fixedCount = 0;

podspecFiles.forEach(relativePath => {
  const podspecPath = path.join(__dirname, '..', 'node_modules', relativePath);

  if (fs.existsSync(podspecPath)) {
    let content = fs.readFileSync(podspecPath, 'utf8');
    const originalContent = content;

    // Pattern 1: Fix invalid add_dependency call with framework_name
    content = content.replace(
      /add_dependency\([^,]+,\s*["']React-jsinspector["'],\s*:framework_name\s*=>\s*['"]jsinspector_modern['"]\)/g,
      's.dependency "React-jsinspector"'
    );

    // Pattern 2: Fix any remaining jsinspector_modern references
    content = content.replace(
      /['"]jsinspector_modern['"]/g,
      '"jsinspector"'
    );

    // Pattern 3: Fix header_dir references to jsinspector-modern
    content = content.replace(
      /header_dir\s*=\s*["']jsinspector-modern["']/g,
      'header_dir = "jsinspector"'
    );

    // Pattern 4: Fix module_name references
    content = content.replace(
      /module_name\s*=\s*["']jsinspector_modern["']/g,
      'module_name = "jsinspector"'
    );

    if (content !== originalContent) {
      fs.writeFileSync(podspecPath, content);
      console.log(`✅ Fixed jsinspector references in ${relativePath}`);
      fixedCount++;
    }
  }
});

if (fixedCount > 0) {
  console.log(`🎉 Fixed ${fixedCount} podspec file(s) with jsinspector issues\n`);
} else {
  console.log('ℹ️  No podspec files needed jsinspector fixes\n');
}

// =============================================================================
// FIX 2: lottie-react-native buildConfig issue for AGP 8.x
// =============================================================================
const lottieBuildGradlePath = path.join(__dirname, '..', 'node_modules', 'lottie-react-native', 'android', 'build.gradle');
if (fs.existsSync(lottieBuildGradlePath)) {
  let lottieBuildGradle = fs.readFileSync(lottieBuildGradlePath, 'utf8');
  const originalLottieContent = lottieBuildGradle;

  if (!lottieBuildGradle.includes('buildConfig true')) {
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

// =============================================================================
// FIX 3: stripe-react-native namespace issue for AGP 8.x
// =============================================================================
const stripeBuildGradlePath = path.join(__dirname, '..', 'node_modules', '@stripe', 'stripe-react-native', 'android', 'build.gradle');
if (fs.existsSync(stripeBuildGradlePath)) {
  let stripeBuildGradle = fs.readFileSync(stripeBuildGradlePath, 'utf8');
  const originalStripeContent = stripeBuildGradle;

  if (!stripeBuildGradle.includes('namespace =') && !stripeBuildGradle.includes("namespace '")) {
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

// =============================================================================
// FIX 4: Kotlin version consistency in Expo modules
// =============================================================================
const KOTLIN_VERSION = '1.9.24';

// Fix Kotlin version references in expo-modules-core plugin
const expoModulesCorePluginPath = path.join(__dirname, '..', 'node_modules', 'expo-modules-core', 'android', 'ExpoModulesCorePlugin.gradle');
if (fs.existsSync(expoModulesCorePluginPath)) {
  let pluginContent = fs.readFileSync(expoModulesCorePluginPath, 'utf8');
  const originalPluginContent = pluginContent;

  // Replace hardcoded Kotlin 1.9.23 references with 1.9.24
  pluginContent = pluginContent.replace(/1\.9\.23/g, KOTLIN_VERSION);

  if (pluginContent !== originalPluginContent) {
    fs.writeFileSync(expoModulesCorePluginPath, pluginContent, 'utf8');
    console.log('✅ Fixed Kotlin version in ExpoModulesCorePlugin.gradle');
  }
}

console.log('\n✨ Postinstall fixes complete!\n');
console.log('Next steps for iOS builds:');
console.log('  1. cd mobile');
console.log('  2. npx expo prebuild --clean');
console.log('  3. cd ios && pod install --repo-update');
console.log('  4. npx expo run:ios\n');
console.log('Next steps for Android builds:');
console.log('  1. cd mobile');
console.log('  2. npx expo prebuild --clean');
console.log('  3. npx expo run:android\n');
