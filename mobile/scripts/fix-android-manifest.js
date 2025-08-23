#!/usr/bin/env node

/**
 * Fix Android Manifest merger issues
 * Particularly for react-native-voice and other packages
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Android Manifest merger issues...');

// Path to the Android manifest
const manifestPath = path.join(
  __dirname,
  '..',
  'android',
  'app',
  'src',
  'main',
  'AndroidManifest.xml'
);

// Check if manifest exists
if (!fs.existsSync(manifestPath)) {
  console.log('⚠️  AndroidManifest.xml not found. Run expo prebuild first.');
  process.exit(0);
}

try {
  let manifest = fs.readFileSync(manifestPath, 'utf8');
  const originalManifest = manifest;
  
  // Add tools namespace if not present
  if (!manifest.includes('xmlns:tools=')) {
    manifest = manifest.replace(
      '<manifest',
      '<manifest xmlns:tools="http://schemas.android.com/tools"'
    );
    console.log('✅ Added tools namespace');
  }
  
  // Fix duplicate RECORD_AUDIO permission
  const recordAudioRegex = /<uses-permission android:name="android\.permission\.RECORD_AUDIO".*?\/>/g;
  const recordAudioMatches = manifest.match(recordAudioRegex);
  if (recordAudioMatches && recordAudioMatches.length > 1) {
    // Remove all instances
    manifest = manifest.replace(recordAudioRegex, '');
    // Add single instance with tools:node="replace"
    const permissionsEnd = manifest.lastIndexOf('</application>');
    manifest = manifest.slice(0, permissionsEnd) + 
      '  <uses-permission android:name="android.permission.RECORD_AUDIO" tools:node="replace" />\n' +
      manifest.slice(permissionsEnd);
    console.log('✅ Fixed duplicate RECORD_AUDIO permission');
  }
  
  // Add RECORD_AUDIO if missing
  if (!manifest.includes('android.permission.RECORD_AUDIO')) {
    const permissionsEnd = manifest.lastIndexOf('</application>');
    manifest = manifest.slice(0, permissionsEnd) + 
      '  <uses-permission android:name="android.permission.RECORD_AUDIO" />\n' +
      manifest.slice(permissionsEnd);
    console.log('✅ Added RECORD_AUDIO permission');
  }
  
  // Fix duplicate CAMERA permission
  const cameraRegex = /<uses-permission android:name="android\.permission\.CAMERA".*?\/>/g;
  const cameraMatches = manifest.match(cameraRegex);
  if (cameraMatches && cameraMatches.length > 1) {
    manifest = manifest.replace(cameraRegex, '');
    const permissionsEnd = manifest.lastIndexOf('</application>');
    manifest = manifest.slice(0, permissionsEnd) + 
      '  <uses-permission android:name="android.permission.CAMERA" tools:node="replace" />\n' +
      manifest.slice(permissionsEnd);
    console.log('✅ Fixed duplicate CAMERA permission');
  }
  
  // Fix duplicate INTERNET permission
  const internetRegex = /<uses-permission android:name="android\.permission\.INTERNET".*?\/>/g;
  const internetMatches = manifest.match(internetRegex);
  if (internetMatches && internetMatches.length > 1) {
    manifest = manifest.replace(internetRegex, '');
    const permissionsEnd = manifest.lastIndexOf('</application>');
    manifest = manifest.slice(0, permissionsEnd) + 
      '  <uses-permission android:name="android.permission.INTERNET" tools:node="replace" />\n' +
      manifest.slice(permissionsEnd);
    console.log('✅ Fixed duplicate INTERNET permission');
  }
  
  // Add tools:replace to application tag if needed
  if (!manifest.includes('tools:replace')) {
    manifest = manifest.replace(
      '<application',
      '<application tools:replace="android:allowBackup"'
    );
    console.log('✅ Added tools:replace to application tag');
  }
  
  // Write back if changed
  if (manifest !== originalManifest) {
    fs.writeFileSync(manifestPath, manifest);
    console.log('✅ AndroidManifest.xml updated');
  } else {
    console.log('ℹ️  No changes needed');
  }
  
} catch (error) {
  console.error('❌ Error fixing manifest:', error.message);
  process.exit(1);
}

console.log('✨ Manifest fix complete!');