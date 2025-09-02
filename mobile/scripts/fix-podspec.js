#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Fix all podspec files with add_dependency issues
const podspecFiles = [
  'expo-dev-launcher/expo-dev-launcher.podspec',
  'expo-dev-menu/expo-dev-menu.podspec',
  'expo-modules-core/ExpoModulesCore.podspec'
];

let fixedCount = 0;

podspecFiles.forEach(relativePath => {
  const podspecPath = path.join(__dirname, '..', 'node_modules', relativePath);
  
  if (fs.existsSync(podspecPath)) {
    let content = fs.readFileSync(podspecPath, 'utf8');
    
    // Fix the invalid add_dependency call
    const originalContent = content;
    content = content.replace(
      /add_dependency\([^,]+,\s*"React-jsinspector",\s*:framework_name\s*=>\s*'jsinspector_modern'\)/g,
      's.dependency "React-jsinspector"'
    );
    
    if (content !== originalContent) {
      fs.writeFileSync(podspecPath, content);
      console.log(`✅ Fixed ${relativePath} add_dependency issue`);
      fixedCount++;
    }
  } else {
    console.log(`⚠️  ${relativePath} not found, skipping fix`);
  }
});

if (fixedCount > 0) {
  console.log(`🎉 Fixed ${fixedCount} podspec file(s) with add_dependency issues`);
} else {
  console.log('ℹ️  No podspec files needed fixing');
}

// Also fix Gradle wrapper version
const gradleWrapperPath = path.join(__dirname, '..', 'android', 'gradle', 'wrapper', 'gradle-wrapper.properties');
if (fs.existsSync(gradleWrapperPath)) {
  let gradleWrapper = fs.readFileSync(gradleWrapperPath, 'utf8');
  const originalWrapper = gradleWrapper;
  gradleWrapper = gradleWrapper.replace(
    /distributionUrl=https\\:\/\/services\.gradle\.org\/distributions\/gradle-[\d\.]+-all\.zip/,
    'distributionUrl=https\\://services.gradle.org/distributions/gradle-7.6.4-all.zip'
  );
  if (gradleWrapper !== originalWrapper) {
    fs.writeFileSync(gradleWrapperPath, gradleWrapper);
    console.log('✅ Fixed Gradle wrapper version to 7.6.4');
  }
}