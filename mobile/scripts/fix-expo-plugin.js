#!/usr/bin/env node

/**
 * Fix expo-root-project plugin issues
 * Handles Kotlin version mapping and other plugin conflicts
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing expo-root-project plugin...');

const buildGradlePath = path.join(__dirname, '..', 'android', 'build.gradle');

if (!fs.existsSync(buildGradlePath)) {
  console.log('⚠️  android/build.gradle not found.');
  process.exit(0);
}

try {
  let buildGradle = fs.readFileSync(buildGradlePath, 'utf8');
  const originalContent = buildGradle;
  
  // Remove or fix the problematic plugin application
  // The error suggests the plugin is trying to access a Kotlin version that doesn't exist
  
  // Option 1: Remove the expo-root-project plugin if it's causing issues
  if (buildGradle.includes("apply plugin: 'expo-root-project'")) {
    buildGradle = buildGradle.replace(
      /apply plugin:\s*['"]expo-root-project['"]/g,
      '// apply plugin: "expo-root-project" // Commented out due to version conflict'
    );
    console.log('✅ Disabled expo-root-project plugin');
  }
  
  // Option 2: Fix the Kotlin version mapping
  // Add a proper Kotlin version to the ext block
  if (!buildGradle.includes('kotlinVersion')) {
    buildGradle = buildGradle.replace(
      /buildscript\s*{\s*ext\s*{/,
      `buildscript {
    ext {
        kotlinVersion = "1.8.22"
        kotlin_version = "1.8.22"`
    );
    console.log('✅ Added Kotlin version to ext block');
  }
  
  // Fix any version map references
  buildGradle = buildGradle.replace(
    /getByName\(['"]kotlin['"]\)\.version\s*=\s*getKotlinVersion\(\)\.get\(\)/g,
    'getByName("kotlin").version = "1.8.22"'
  );
  
  // Ensure buildToolsVersion is set
  if (!buildGradle.includes('buildToolsVersion')) {
    buildGradle = buildGradle.replace(
      /compileSdkVersion\s*=\s*\d+/,
      'compileSdkVersion = 35\n        buildToolsVersion = "35.0.0"'
    );
  }
  
  // Write the fixed file
  if (buildGradle !== originalContent) {
    fs.writeFileSync(buildGradlePath, buildGradle);
    console.log('✅ Fixed build.gradle');
  }
  
  // Also create a gradle.properties file with proper settings
  const gradlePropertiesPath = path.join(__dirname, '..', 'android', 'gradle.properties');
  const gradleProperties = `
# Project-wide Gradle settings
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=1024m
org.gradle.parallel=true
org.gradle.configureondemand=false
org.gradle.caching=true

# Android settings
android.useAndroidX=true
android.enableJetifier=true

# Versions (to override any plugin issues)
android.compileSdk=35
android.targetSdk=35
android.minSdk=23
android.buildToolsVersion=35.0.0

# Kotlin
kotlin.code.style=official
kotlinVersion=1.8.22

# Expo
expo.jsEngine=jsc

# New Architecture
newArchEnabled=false
`;
  
  fs.writeFileSync(gradlePropertiesPath, gradleProperties.trim());
  console.log('✅ Updated gradle.properties');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

console.log('✨ Expo plugin fix complete!');