#!/usr/bin/env node

/**
 * Fix AndroidX vs Android Support Library conflicts
 * Forces all dependencies to use AndroidX
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing AndroidX conflicts...');

// 1. Update gradle.properties to force AndroidX
const gradlePropertiesPath = path.join(__dirname, '..', 'android', 'gradle.properties');

const gradleProperties = `
# Project-wide Gradle settings
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=1024m
org.gradle.parallel=true
org.gradle.configureondemand=false
org.gradle.caching=true

# CRITICAL: Force AndroidX and Jetifier
android.useAndroidX=true
android.enableJetifier=true

# Versions
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

# Force AndroidX migrations
android.jetifier.ignorelist=
android.jetifier.blacklist=
`;

fs.writeFileSync(gradlePropertiesPath, gradleProperties.trim());
console.log('✅ Updated gradle.properties with AndroidX enforcement');

// 2. Update root build.gradle to exclude support libraries
const rootBuildGradlePath = path.join(__dirname, '..', 'android', 'build.gradle');

if (fs.existsSync(rootBuildGradlePath)) {
  let buildGradle = fs.readFileSync(rootBuildGradlePath, 'utf8');
  
  // Add configurations to exclude Android Support Library
  const exclusionConfig = `
    configurations.all {
        resolutionStrategy {
            // Force AndroidX versions
            force 'androidx.core:core:1.13.1'
            force 'androidx.core:core-ktx:1.13.1'
            force 'androidx.appcompat:appcompat:1.6.1'
            force 'androidx.vectordrawable:vectordrawable:1.1.0'
            force 'androidx.vectordrawable:vectordrawable-animated:1.1.0'
            force 'androidx.versionedparcelable:versionedparcelable:1.1.1'
            
            // Exclude all Android Support Library
            exclude group: 'com.android.support'
            
            // Replace support library with AndroidX
            eachDependency { DependencyResolveDetails details ->
                if (details.requested.group == 'com.android.support') {
                    if (details.requested.name == 'support-v4') {
                        details.useTarget 'androidx.legacy:legacy-support-v4:1.0.0'
                    } else if (details.requested.name == 'appcompat-v7') {
                        details.useTarget 'androidx.appcompat:appcompat:1.6.1'
                    } else if (details.requested.name == 'support-vector-drawable') {
                        details.useTarget 'androidx.vectordrawable:vectordrawable:1.1.0'
                    } else if (details.requested.name == 'animated-vector-drawable') {
                        details.useTarget 'androidx.vectordrawable:vectordrawable-animated:1.1.0'
                    } else if (details.requested.name == 'versionedparcelable') {
                        details.useTarget 'androidx.versionedparcelable:versionedparcelable:1.1.1'
                    }
                }
            }
        }
    }`;
  
  // Check if allprojects block exists and add our configuration
  if (buildGradle.includes('allprojects {')) {
    if (!buildGradle.includes('configurations.all')) {
      buildGradle = buildGradle.replace(
        /allprojects\s*{/,
        `allprojects {${exclusionConfig}`
      );
      console.log('✅ Added AndroidX resolution strategy');
    }
  } else {
    // Add allprojects block if it doesn't exist
    buildGradle += `
allprojects {${exclusionConfig}
}`;
    console.log('✅ Added allprojects with AndroidX configuration');
  }
  
  fs.writeFileSync(rootBuildGradlePath, buildGradle);
}

// 3. Update app/build.gradle to exclude support libraries
const appBuildGradlePath = path.join(__dirname, '..', 'android', 'app', 'build.gradle');

if (fs.existsSync(appBuildGradlePath)) {
  let appBuildGradle = fs.readFileSync(appBuildGradlePath, 'utf8');
  
  // Add packagingOptions to exclude duplicate files
  if (!appBuildGradle.includes('packagingOptions')) {
    appBuildGradle = appBuildGradle.replace(
      /android\s*{/,
      `android {
    packagingOptions {
        exclude 'META-INF/DEPENDENCIES'
        exclude 'META-INF/LICENSE'
        exclude 'META-INF/LICENSE.txt'
        exclude 'META-INF/NOTICE'
        exclude 'META-INF/NOTICE.txt'
        pickFirst '**/*.so'
        pickFirst '**/libc++_shared.so'
        pickFirst '**/libjsc.so'
    }`
    );
    console.log('✅ Added packagingOptions to app/build.gradle');
  }
  
  // Add configurations block to dependencies
  if (!appBuildGradle.includes('configurations.all')) {
    const configurationsBlock = `
configurations.all {
    exclude group: 'com.android.support'
}

`;
    appBuildGradle = appBuildGradle.replace(
      /dependencies\s*{/,
      configurationsBlock + 'dependencies {'
    );
    console.log('✅ Added support library exclusion to app/build.gradle');
  }
  
  fs.writeFileSync(appBuildGradlePath, appBuildGradle);
}

console.log('✨ AndroidX conflict resolution complete!');