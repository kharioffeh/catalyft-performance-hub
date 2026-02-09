const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * This plugin fixes the jsinspector-modern header not found issue
 * by modifying the Podfile to add header search paths
 */

function withJsinspectorFix(config) {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');

      if (fs.existsSync(podfilePath)) {
        let podfileContent = fs.readFileSync(podfilePath, 'utf8');
        const originalContent = podfileContent;

        // Check if our fix is already present
        if (!podfileContent.includes('jsinspector header search paths fix')) {
          // Add header search paths in the post_install block
          const headerFix = `
    # jsinspector header search paths fix
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |build_config|
        build_config.build_settings['HEADER_SEARCH_PATHS'] ||= ['$(inherited)']
        unless build_config.build_settings['HEADER_SEARCH_PATHS'].include?('jsinspector')
          build_config.build_settings['HEADER_SEARCH_PATHS'] << '"$(PODS_ROOT)/Headers/Public/React-jsinspector"'
        end
      end
    end
`;

          // Find the post_install block and add our fix after react_native_post_install
          const postInstallRegex = /(react_native_post_install\([^)]+\))/;
          if (postInstallRegex.test(podfileContent)) {
            podfileContent = podfileContent.replace(
              postInstallRegex,
              `$1\n${headerFix}`
            );
          }

          // Remove ccache_enabled if present (can cause issues)
          podfileContent = podfileContent.replace(
            /:ccache_enabled\s*=>\s*podfile_properties\['apple\.ccacheEnabled'\]\s*==\s*'true',?\s*/g,
            ''
          );
        }

        if (podfileContent !== originalContent) {
          fs.writeFileSync(podfilePath, podfileContent);
          console.log('✅ Added jsinspector header search paths fix to Podfile');
        }
      }

      return config;
    },
  ]);
}

module.exports = withJsinspectorFix;
