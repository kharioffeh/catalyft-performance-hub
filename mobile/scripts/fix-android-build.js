#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Android build configuration...');

const androidAppBuildGradle = path.join(__dirname, '..', 'android', 'app', 'build.gradle');

if (!fs.existsSync(androidAppBuildGradle)) {
  console.log('❌ Android build.gradle not found. Make sure to run expo prebuild first.');
  process.exit(1);
}

try {
  // Read the current build.gradle content
  let buildGradleContent = fs.readFileSync(androidAppBuildGradle, 'utf8');
  
  // Check if packagingOptions already exists
  if (buildGradleContent.includes('packagingOptions')) {
    console.log('✅ packagingOptions already configured in build.gradle');
  } else {
    // Add packagingOptions to handle duplicate META-INF files
    const packagingOptionsConfig = `
    packagingOptions {
        pickFirst '**/libc++_shared.so'
        pickFirst '**/libjsc.so'
        pickFirst '**/libfb.so'
        pickFirst 'META-INF/LICENSE'
        pickFirst 'META-INF/LICENSE.md'
        pickFirst 'META-INF/LICENSE.txt'
        pickFirst 'META-INF/NOTICE'
        pickFirst 'META-INF/NOTICE.md'
        pickFirst 'META-INF/NOTICE.txt'
        pickFirst 'META-INF/DEPENDENCIES'
        pickFirst 'META-INF/DEPENDENCIES.txt'
        exclude 'META-INF/LGPL2.1'
        exclude 'META-INF/AL2.0'
    }`;
    
    // Insert packagingOptions into the android block
    const androidBlockRegex = /(android\s*\{[\s\S]*?)((?:\s*}\s*$))/m;
    
    if (androidBlockRegex.test(buildGradleContent)) {
      buildGradleContent = buildGradleContent.replace(
        androidBlockRegex,
        `$1${packagingOptionsConfig}$2`
      );
      
      fs.writeFileSync(androidAppBuildGradle, buildGradleContent);
      console.log('✅ Added packagingOptions to Android build.gradle');
    } else {
      console.log('⚠️  Could not find android block in build.gradle, skipping packagingOptions');
    }
  }
  
  // Also add to gradle.properties for global configuration
  const gradlePropertiesPath = path.join(__dirname, '..', 'android', 'gradle.properties');
  if (fs.existsSync(gradlePropertiesPath)) {
    let gradleProperties = fs.readFileSync(gradlePropertiesPath, 'utf8');
    
    const packagingProperty = 'android.packagingOptions.pickFirsts=**/libc++_shared.so,**/libjsc.so,**/libfb.so,META-INF/LICENSE.md,META-INF/LICENSE.txt,META-INF/NOTICE.md';
    
    if (!gradleProperties.includes('android.packagingOptions.pickFirsts')) {
      gradleProperties += '\n' + packagingProperty + '\n';
      fs.writeFileSync(gradlePropertiesPath, gradleProperties);
      console.log('✅ Added packaging options to gradle.properties');
    } else {
      console.log('✅ Packaging options already in gradle.properties');
    }
  }
  
  console.log('🎉 Android build configuration fixed successfully!');
  
} catch (error) {
  console.error('❌ Error fixing Android build configuration:', error.message);
  process.exit(1);
}