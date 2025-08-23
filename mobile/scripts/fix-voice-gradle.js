#!/usr/bin/env node

/**
 * Fix react-native-voice Gradle build issues
 * This script replaces deprecated 'compile' with 'implementation'
 */

const fs = require('fs');
const path = require('path');

// Try both possible package locations
const possiblePaths = [
  path.join(__dirname, '..', 'node_modules', '@react-native-voice', 'voice', 'android', 'build.gradle'),
  path.join(__dirname, '..', 'node_modules', 'react-native-voice', 'android', 'build.gradle')
];

let voiceGradlePath = null;
for (const p of possiblePaths) {
  if (fs.existsSync(p)) {
    voiceGradlePath = p;
    break;
  }
}

console.log('🔧 Fixing react-native-voice Gradle configuration...');

if (!voiceGradlePath) {
  console.log('⚠️  react-native-voice not found. Skipping fix.');
  process.exit(0);
}

try {
  let content = fs.readFileSync(voiceGradlePath, 'utf8');
  
  // Check if already fixed
  if (!content.includes('compile ')) {
    console.log('✅ Already fixed or no deprecated syntax found');
    process.exit(0);
  }
  
  // Replace deprecated 'compile' with 'implementation'
  const originalContent = content;
  content = content.replace(/compile\s+fileTree/g, 'implementation fileTree');
  content = content.replace(/compile\s+"com\.facebook\.react/g, 'implementation "com.facebook.react');
  content = content.replace(/compile\s+'com\.google\.android/g, 'implementation \'com.google.android');
  content = content.replace(/compile\s+'/g, 'implementation \'');
  content = content.replace(/compile\s+"/g, 'implementation "');
  
  if (content !== originalContent) {
    fs.writeFileSync(voiceGradlePath, content);
    console.log('✅ Fixed deprecated Gradle syntax in react-native-voice');
    console.log('   Replaced "compile" with "implementation"');
  } else {
    console.log('ℹ️  No changes needed');
  }
  
} catch (error) {
  console.error('❌ Error fixing Gradle file:', error.message);
  process.exit(1);
}

console.log('✨ Done!');