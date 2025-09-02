#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Fix all podspec files with add_dependency issues
const podspecFiles = [
  'expo-dev-launcher/expo-dev-launcher.podspec',
  'expo-dev-menu/expo-dev-menu.podspec'
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