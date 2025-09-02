#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Fix expo-dev-launcher.podspec add_dependency issue
const podspecPath = path.join(__dirname, '..', 'node_modules', 'expo-dev-launcher', 'expo-dev-launcher.podspec');

if (fs.existsSync(podspecPath)) {
  let content = fs.readFileSync(podspecPath, 'utf8');
  
  // Fix the invalid add_dependency call
  content = content.replace(
    /add_dependency\(s, "React-jsinspector", :framework_name => 'jsinspector_modern'\)/,
    's.dependency "React-jsinspector"'
  );
  
  fs.writeFileSync(podspecPath, content);
  console.log('✅ Fixed expo-dev-launcher.podspec add_dependency issue');
} else {
  console.log('⚠️  expo-dev-launcher.podspec not found, skipping fix');
}