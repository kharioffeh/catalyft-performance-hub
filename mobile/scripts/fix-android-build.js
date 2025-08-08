#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const buildGradlePath = path.join(__dirname, '..', 'android', 'app', 'build.gradle');

console.log('🔧 Fixing Android build configuration...');

if (!fs.existsSync(buildGradlePath)) {
  console.log('❌ build.gradle not found at:', buildGradlePath);
  process.exit(1);
}

let buildGradleContent = fs.readFileSync(buildGradlePath, 'utf8');

// Check if packagingOptions already exists
if (buildGradleContent.includes('packagingOptions')) {
  console.log('✅ packagingOptions already configured in build.gradle');
  process.exit(0);
}

// Find the android block and inject packagingOptions
const androidBlockRegex = /android\s*\{/;
const match = buildGradleContent.match(androidBlockRegex);

if (!match) {
  console.log('❌ Could not find android block in build.gradle');
  process.exit(1);
}

const packagingOptionsBlock = `
    packagingOptions {
        pickFirst '**/libc++_shared.so'
        pickFirst '**/libjsc.so'
        pickFirst '**/libjscexecutor.so'
        pickFirst 'META-INF/LICENSE.md'
        pickFirst 'META-INF/LICENSE'
        pickFirst 'META-INF/NOTICE.md'
        pickFirst 'META-INF/NOTICE'
        pickFirst 'META-INF/ASL2.0'
        pickFirst 'META-INF/*.md'
        exclude 'META-INF/DEPENDENCIES'
        exclude 'META-INF/INDEX.LIST'
        exclude 'META-INF/io.netty.versions.properties'
    }
`;

// Insert packagingOptions right after the android { line
const insertIndex = match.index + match[0].length;
buildGradleContent = buildGradleContent.slice(0, insertIndex) + 
                   packagingOptionsBlock + 
                   buildGradleContent.slice(insertIndex);

// Write the modified content back
fs.writeFileSync(buildGradlePath, buildGradleContent, 'utf8');

console.log('✅ Successfully added packagingOptions to build.gradle');
console.log('📦 This should resolve META-INF/LICENSE.md conflicts during test APK builds');