const { withDangerousMod, withPlugins } = require('@expo/config-plugins');
const { readFileSync, writeFileSync } = require('fs');
const path = require('path');

function withFirebaseIOS(config) {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');
      
      try {
        let podfileContents = readFileSync(podfilePath, 'utf8');
        
        // Add use_modular_headers! globally for Firebase compatibility
        if (!podfileContents.includes('use_modular_headers!')) {
          // Add after the platform line
          podfileContents = podfileContents.replace(
            /platform :ios.*$/m,
            `$&\n\nuse_modular_headers!`
          );
        }
        
        // Also add specific Firebase pod configurations
        if (!podfileContents.includes('pod_target_xcconfig')) {
          const firebaseConfig = `
  # Firebase configuration for static libraries
  pod 'Firebase', :modular_headers => true
  pod 'FirebaseCore', :modular_headers => true
  pod 'FirebaseCoreInternal', :modular_headers => true
  pod 'GoogleUtilities', :modular_headers => true
  pod 'FirebaseInstallations', :modular_headers => true
  pod 'GoogleDataTransport', :modular_headers => true
  pod 'nanopb', :modular_headers => true
  
  # Additional configuration for Firebase
  post_install do |installer|
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '15.0'
        config.build_settings["EXCLUDED_ARCHS[sdk=iphonesimulator*]"] = "arm64"
        config.build_settings['ENABLE_BITCODE'] = 'NO'
        
        # Enable modular headers for all Firebase pods
        if target.name.include?('Firebase') || target.name.include?('Google')
          config.build_settings['DEFINES_MODULE'] = 'YES'
        end
      end
    end
  end
`;
          
          // Add before the last 'end' in the file
          const lastEndIndex = podfileContents.lastIndexOf('end');
          if (lastEndIndex !== -1) {
            podfileContents = 
              podfileContents.slice(0, lastEndIndex) + 
              firebaseConfig + '\n' +
              podfileContents.slice(lastEndIndex);
          }
        }
        
        writeFileSync(podfilePath, podfileContents);
        console.log('✅ Podfile updated with Firebase modular headers configuration');
      } catch (error) {
        console.error('Error modifying Podfile:', error);
      }
      
      return config;
    },
  ]);
}

module.exports = withFirebaseIOS;