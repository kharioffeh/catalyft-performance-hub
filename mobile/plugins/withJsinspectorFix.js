const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * This plugin fixes the jsinspector-modern header not found issue
 * that occurs with Expo SDK 51 + React Native 0.74.x
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
        if (!podfileContent.includes('jsinspector_fix')) {
          // Add a post_integrate hook to create the symlink after pod install
          const symlinkFix = `
# jsinspector_fix - Create symlink for jsinspector-modern headers
post_integrate do |installer|
  pods_dir = installer.sandbox.root
  public_headers = pods_dir + 'Headers/Public'
  private_headers = pods_dir + 'Headers/Private'

  # Create symlink for jsinspector-modern -> React-jsinspector
  ['Public', 'Private'].each do |type|
    headers_dir = pods_dir + "Headers/#{type}"
    source = headers_dir + 'React-jsinspector'
    target = headers_dir + 'jsinspector-modern'

    if source.exist? && !target.exist?
      FileUtils.ln_sf('React-jsinspector', target.to_s)
      Pod::UI.puts "Created symlink: #{target} -> React-jsinspector".green
    end
  end
rescue => e
  Pod::UI.warn "jsinspector symlink fix failed: #{e.message}"
end

`;

          // Insert after the target block and before post_install
          if (podfileContent.includes('post_install do |installer|')) {
            podfileContent = podfileContent.replace(
              /^(.*post_install do \|installer\|)/m,
              `${symlinkFix}\n$1`
            );
          } else {
            // If no post_install, add at the end before the final 'end'
            podfileContent = podfileContent.replace(
              /(end\s*)$/,
              `${symlinkFix}\n$1`
            );
          }

          // Also ensure we're not using ccache_enabled which can cause issues
          podfileContent = podfileContent.replace(
            /:ccache_enabled\s*=>\s*podfile_properties\['apple\.ccacheEnabled'\]\s*==\s*'true',?\s*/g,
            ''
          );
        }

        if (podfileContent !== originalContent) {
          fs.writeFileSync(podfilePath, podfileContent);
          console.log('✅ Added jsinspector symlink fix to Podfile');
        }
      }

      return config;
    },
  ]);
}

module.exports = withJsinspectorFix;
