#!/usr/bin/env node

/**
 * Fix Kotlin version in Android build.gradle
 * Ensures compatibility with Expo and current Gradle
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Kotlin version...');

// Path to android/build.gradle
const buildGradlePath = path.join(__dirname, '..', 'android', 'build.gradle');

if (!fs.existsSync(buildGradlePath)) {
  console.log('⚠️  android/build.gradle not found. Run expo prebuild first.');
  process.exit(0);
}

try {
  let buildGradle = fs.readFileSync(buildGradlePath, 'utf8');
  const originalContent = buildGradle;
  
  // Fix Kotlin version references
  // Replace any kotlin version with a known working one
  buildGradle = buildGradle.replace(
    /kotlinVersion\s*=\s*["'][\d.]+["']/g,
    'kotlinVersion = "1.8.22"'
  );
  
  // Also fix in ext block if present
  buildGradle = buildGradle.replace(
    /kotlin_version\s*=\s*["'][\d.]+["']/g,
    'kotlin_version = "1.8.22"'
  );
  
  // Fix the specific error pattern
  buildGradle = buildGradle.replace(
    /getKotlinVersion\(\)\.get\(\)/g,
    '"1.8.22"'
  );
  
  // If kotlinVersion is referenced but not defined, add it
  if (buildGradle.includes('kotlinVersion') && !buildGradle.includes('kotlinVersion =')) {
    buildGradle = buildGradle.replace(
      /buildscript\s*{/,
      `buildscript {
    ext {
        kotlinVersion = "1.8.22"
    }`
    );
  }
  
  if (buildGradle !== originalContent) {
    fs.writeFileSync(buildGradlePath, buildGradle);
    console.log('✅ Fixed Kotlin version to 1.8.22');
  } else {
    console.log('ℹ️  No Kotlin version changes needed');
  }
  
} catch (error) {
  console.error('❌ Error fixing Kotlin version:', error.message);
  process.exit(1);
}

// Also check app/build.gradle
const appBuildGradlePath = path.join(__dirname, '..', 'android', 'app', 'build.gradle');

if (fs.existsSync(appBuildGradlePath)) {
  try {
    let appBuildGradle = fs.readFileSync(appBuildGradlePath, 'utf8');
    const originalAppContent = appBuildGradle;
    
    // Fix any Kotlin version references in app build.gradle
    appBuildGradle = appBuildGradle.replace(
      /kotlinVersion\s*=\s*["'][\d.]+["']/g,
      'kotlinVersion = "1.8.22"'
    );
    
    if (appBuildGradle !== originalAppContent) {
      fs.writeFileSync(appBuildGradlePath, appBuildGradle);
      console.log('✅ Fixed Kotlin version in app/build.gradle');
    }
    
  } catch (error) {
    console.error('⚠️  Could not update app/build.gradle:', error.message);
  }
}

console.log('✨ Kotlin version fix complete!');