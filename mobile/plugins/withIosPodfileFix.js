const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const withIosPodfileFix = (config) => {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');
      
      if (fs.existsSync(podfilePath)) {
        let podfileContent = fs.readFileSync(podfilePath, 'utf8');
        
        // Fix the ccache_enabled parameter issue
        podfileContent = podfileContent.replace(
          /react_native_post_install\(\s*installer,\s*config\[:reactNativePath\],\s*:mac_catalyst_enabled\s*=>\s*false,\s*:ccache_enabled\s*=>\s*podfile_properties\['apple\.ccacheEnabled'\]\s*==\s*'true',?\s*\)/,
          'react_native_post_install(\n      installer,\n      config[:reactNativePath],\n      :mac_catalyst_enabled => false\n    )'
        );
        
        fs.writeFileSync(podfilePath, podfileContent);
        console.log('✅ Fixed iOS Podfile ccache_enabled issue');
      }
      
      return config;
    },
  ]);
};

module.exports = withIosPodfileFix;