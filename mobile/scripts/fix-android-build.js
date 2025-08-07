#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Android build configuration...');

const androidAppBuildGradlePath = path.join(__dirname, '..', 'android', 'app', 'build.gradle');

if (!fs.existsSync(androidAppBuildGradlePath)) {
  console.log('❌ Android build.gradle not found. Make sure you run expo prebuild first.');
  process.exit(1);
}

let buildGradleContent = fs.readFileSync(androidAppBuildGradlePath, 'utf8');

// Check if packagingOptions already exists
if (buildGradleContent.includes('packagingOptions')) {
  console.log('✅ PackagingOptions already configured');
  process.exit(0);
}

// Find the android block and add packagingOptions
const androidBlockRegex = /android\s*\{/;
const match = buildGradleContent.match(androidBlockRegex);

if (!match) {
  console.log('❌ Could not find android block in build.gradle');
  process.exit(1);
}

const insertionPoint = match.index + match[0].length;

const packagingOptionsBlock = `
    packagingOptions {
        pickFirst '**/libc++_shared.so'
        pickFirst '**/libjsc.so'
        pickFirst '**/libflipper.so'
        pickFirst 'META-INF/LICENSE.md'
        pickFirst 'META-INF/LICENSE-notice.md'
        pickFirst 'META-INF/NOTICE.md'
        exclude 'META-INF/DEPENDENCIES'
        exclude 'META-INF/DEPENDENCIES.txt'
        exclude 'META-INF/LICENSE.txt'
        exclude 'META-INF/NOTICE.txt'
    }
`;

const newContent = 
  buildGradleContent.slice(0, insertionPoint) + 
  packagingOptionsBlock + 
  buildGradleContent.slice(insertionPoint);

fs.writeFileSync(androidAppBuildGradlePath, newContent);

console.log('✅ Android build.gradle updated with packagingOptions');
console.log('🚀 Android build should now handle duplicate META-INF files correctly');