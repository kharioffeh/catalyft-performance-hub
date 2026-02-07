const { withDangerousMod, withXcodeProject } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * This plugin fixes the jsinspector-modern header not found issue
 * that occurs with Expo SDK 51 + React Native 0.74.x
 *
 * The issue is that some Expo modules reference 'jsinspector-modern/InspectorInterfaces.h'
 * but the actual header is at a different path in RN 0.74.
 */

function withJsinspectorFix(config) {
  // First, modify the Podfile to add header search paths
  config = withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');

      if (fs.existsSync(podfilePath)) {
        let podfileContent = fs.readFileSync(podfilePath, 'utf8');
        const originalContent = podfileContent;

        // Add post_install hook to fix header search paths if not present
        if (!podfileContent.includes('jsinspector header fix')) {
          // Find the existing post_install block and add our fix
          const postInstallMatch = podfileContent.match(/post_install do \|installer\|([\s\S]*?)(?=\n\s*end\s*\n)/);

          if (postInstallMatch) {
            const headerFix = `
    # jsinspector header fix - Add header search paths for jsinspector-modern
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        # Add header search paths for jsinspector compatibility
        current_paths = config.build_settings['HEADER_SEARCH_PATHS'] || '$(inherited)'
        if current_paths.is_a?(Array)
          current_paths = current_paths.join(' ')
        end
        unless current_paths.include?('jsinspector')
          config.build_settings['HEADER_SEARCH_PATHS'] = [
            current_paths,
            '"$(PODS_ROOT)/Headers/Public/React-jsinspector"',
            '"$(PODS_ROOT)/Headers/Private/React-jsinspector"',
            '"$(PODS_TARGET_SRCROOT)/../../node_modules/react-native/ReactCommon/jsinspector-modern"'
          ].flatten.compact.join(' ')
        end

        # Suppress jsinspector-modern warnings
        config.build_settings['GCC_WARN_INHIBIT_ALL_WARNINGS'] = 'YES' if target.name.include?('jsinspector')
      end
    end
`;
            podfileContent = podfileContent.replace(
              /post_install do \|installer\|([\s\S]*?)(react_native_post_install)/,
              `post_install do |installer|$1${headerFix}\n    $2`
            );
          }
        }

        // Also ensure we're not using ccache_enabled which can cause issues
        podfileContent = podfileContent.replace(
          /:ccache_enabled\s*=>\s*podfile_properties\['apple\.ccacheEnabled'\]\s*==\s*'true',?\s*/g,
          ''
        );

        if (podfileContent !== originalContent) {
          fs.writeFileSync(podfilePath, podfileContent);
          console.log('✅ Added jsinspector header fix to Podfile');
        }
      }

      return config;
    },
  ]);

  // Also fix the Xcode project header search paths
  config = withXcodeProject(config, async (config) => {
    const xcodeProject = config.modResults;

    // Add header search paths to all build configurations
    const buildConfigurations = xcodeProject.pbxXCBuildConfigurationSection();

    for (const key in buildConfigurations) {
      const buildConfig = buildConfigurations[key];
      if (buildConfig.buildSettings) {
        const currentPaths = buildConfig.buildSettings.HEADER_SEARCH_PATHS || [];
        const pathsArray = Array.isArray(currentPaths) ? currentPaths : [currentPaths];

        // Add jsinspector paths if not present
        const jsinspectorPath = '"$(PODS_ROOT)/Headers/Public/React-jsinspector"';
        if (!pathsArray.some(p => p && p.includes('jsinspector'))) {
          pathsArray.push(jsinspectorPath);
          buildConfig.buildSettings.HEADER_SEARCH_PATHS = pathsArray;
        }
      }
    }

    console.log('✅ Added jsinspector header search paths to Xcode project');
    return config;
  });

  return config;
}

module.exports = withJsinspectorFix;
