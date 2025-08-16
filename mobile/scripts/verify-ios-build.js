#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const appPath = path.join(__dirname, '../ios/build/Build/Products/Debug-iphonesimulator/mobile.app');
const infoPlistPath = path.join(appPath, 'Info.plist');

console.log('Verifying iOS build...');
console.log('App path:', appPath);
console.log('Info.plist path:', infoPlistPath);

// Check if app exists
if (!fs.existsSync(appPath)) {
  console.error('❌ App bundle not found at:', appPath);
  console.log('\nChecking build directory structure:');
  
  const buildDir = path.join(__dirname, '../ios/build');
  if (fs.existsSync(buildDir)) {
    try {
      const findResult = execSync(`find ${buildDir} -name "*.app" -type d`, { encoding: 'utf8' });
      console.log('Found .app bundles:\n', findResult);
    } catch (e) {
      console.log('No .app bundles found');
    }
  } else {
    console.log('Build directory does not exist');
  }
  process.exit(1);
}

// Check if Info.plist exists
if (!fs.existsSync(infoPlistPath)) {
  console.error('❌ Info.plist not found at:', infoPlistPath);
  console.log('\nApp bundle contents:');
  const files = fs.readdirSync(appPath);
  console.log(files.join('\n'));
  process.exit(1);
}

// Read CFBundleIdentifier from Info.plist
try {
  const bundleId = execSync(
    `/usr/libexec/PlistBuddy -c 'Print :CFBundleIdentifier' "${infoPlistPath}"`,
    { encoding: 'utf8' }
  ).trim();
  
  console.log('✅ CFBundleIdentifier found:', bundleId);
  
  // Verify it matches expected value
  const expectedBundleId = 'com.anonymous.catalyft-mobile';
  if (bundleId !== expectedBundleId) {
    console.warn(`⚠️  Bundle ID mismatch. Expected: ${expectedBundleId}, Got: ${bundleId}`);
    console.log('\nUpdate .detoxrc.js with the correct bundleId:', bundleId);
  }
} catch (error) {
  console.error('❌ Failed to read CFBundleIdentifier:', error.message);
  console.log('\nTrying alternative method...');
  
  // Try to read the plist as text
  try {
    const plistContent = fs.readFileSync(infoPlistPath, 'utf8');
    const match = plistContent.match(/<key>CFBundleIdentifier<\/key>\s*<string>([^<]+)<\/string>/);
    if (match) {
      console.log('Found bundle ID via text search:', match[1]);
    } else {
      console.log('Could not find CFBundleIdentifier in Info.plist');
    }
  } catch (e) {
    console.error('Failed to read Info.plist:', e.message);
  }
  
  process.exit(1);
}

console.log('\n✅ iOS build verification complete');