const { withDangerousMod } = require('@expo/config-plugins');
const { readFileSync, writeFileSync } = require('fs');
const path = require('path');

function withModularHeaders(config) {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');
      
      try {
        let podfileContents = readFileSync(podfilePath, 'utf8');
        
        // Check if use_modular_headers! is already added
        if (!podfileContents.includes('use_modular_headers!')) {
          // Find the platform line and add use_modular_headers! after it
          podfileContents = podfileContents.replace(
            /(platform :ios.*$)/m,
            '$1\nuse_modular_headers!'
          );
          
          console.log('✅ Added use_modular_headers! to Podfile');
        } else {
          console.log('✅ use_modular_headers! already present in Podfile');
        }
        
        // Also ensure deployment target is set correctly
        podfileContents = podfileContents.replace(
          /(platform :ios,\s*)'[\d.]+'/, 
          "$1'15.0'"
        );
        
        writeFileSync(podfilePath, podfileContents);
      } catch (error) {
        console.error('❌ Error modifying Podfile:', error);
        // Don't throw - let the build continue
      }
      
      return config;
    },
  ]);
}

module.exports = withModularHeaders;