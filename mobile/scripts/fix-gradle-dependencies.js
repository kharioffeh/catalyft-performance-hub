#!/usr/bin/env node

/**
 * Fix Gradle dependency conflicts
 * Forces all AndroidX dependencies to use compatible versions
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Gradle dependency conflicts...');

// Create or update android/build.gradle allprojects configuration
const rootBuildGradlePath = path.join(__dirname, '..', 'android', 'build.gradle');

if (!fs.existsSync(rootBuildGradlePath)) {
  console.log('⚠️  android/build.gradle not found. Run expo prebuild first.');
  process.exit(0);
}

try {
  let buildGradle = fs.readFileSync(rootBuildGradlePath, 'utf8');
  
  // Check if resolutionStrategy already exists
  if (!buildGradle.includes('resolutionStrategy')) {
    // Add resolutionStrategy to force dependency versions
    const strategyBlock = `
    configurations.all {
        resolutionStrategy {
            force 'androidx.core:core:1.13.1'
            force 'androidx.core:core-ktx:1.13.1'
            force 'androidx.appcompat:appcompat:1.6.1'
            force 'androidx.activity:activity-ktx:1.8.2'
            force 'androidx.fragment:fragment-ktx:1.6.2'
            force 'com.google.android.material:material:1.11.0'
        }
    }`;
    
    // Find allprojects block and add resolutionStrategy
    if (buildGradle.includes('allprojects {')) {
      buildGradle = buildGradle.replace(
        /allprojects\s*{/,
        `allprojects {${strategyBlock}`
      );
      console.log('✅ Added dependency resolution strategy');
    }
  }
  
  // Ensure compileSdkVersion is 35 in all subprojects
  if (!buildGradle.includes('subprojects {')) {
    const subprojectsBlock = `
subprojects {
    afterEvaluate { project ->
        if (project.hasProperty("android")) {
            android {
                compileSdkVersion 35
                buildToolsVersion "35.0.0"
                
                defaultConfig {
                    targetSdkVersion 35
                }
            }
        }
    }
}`;
    
    buildGradle += subprojectsBlock;
    console.log('✅ Added subprojects SDK version override');
  }
  
  fs.writeFileSync(rootBuildGradlePath, buildGradle);
  console.log('✅ Updated android/build.gradle');
  
} catch (error) {
  console.error('❌ Error updating build.gradle:', error.message);
  process.exit(1);
}

// Create gradle.properties with proper configuration
const gradlePropertiesPath = path.join(__dirname, '..', 'android', 'gradle.properties');

const gradleProperties = `
# Project-wide Gradle settings.
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=1024m -XX:+HeapDumpOnOutOfMemoryError
org.gradle.parallel=true
org.gradle.configureondemand=false
org.gradle.caching=true
org.gradle.daemon=true

# Android settings
android.useAndroidX=true
android.enableJetifier=true
android.compileSdkVersion=35
android.targetSdkVersion=35
android.buildToolsVersion=35.0.0

# Kotlin
kotlin.code.style=official

# Network timeouts for CI
systemProp.http.connectionTimeout=120000
systemProp.http.socketTimeout=120000

# Enable R8 (ProGuard replacement)
android.enableR8=true

# New Architecture (disable if causing issues)
newArchEnabled=false

# Expo
expo.jsEngine=jsc
`;

try {
  fs.writeFileSync(gradlePropertiesPath, gradleProperties);
  console.log('✅ Updated gradle.properties');
} catch (error) {
  console.error('⚠️  Could not update gradle.properties:', error.message);
}

console.log('✨ Gradle dependency fixes complete!');