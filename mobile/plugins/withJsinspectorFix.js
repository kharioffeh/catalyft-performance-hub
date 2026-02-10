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
          // Add header search paths AND create symlinks in the post_install block
          const headerFix = `
    # jsinspector header search paths fix
    # Create symlinks for jsinspector-modern -> React-jsinspector
    public_headers = File.join(installer.sandbox.root, 'Headers', 'Public')
    private_headers = File.join(installer.sandbox.root, 'Headers', 'Private')

    # Create public symlink
    jsinspector_src = File.join(public_headers, 'React-jsinspector')
    jsinspector_dest = File.join(public_headers, 'jsinspector-modern')
    if File.directory?(jsinspector_src) && !File.exist?(jsinspector_dest)
      FileUtils.ln_sf('React-jsinspector', jsinspector_dest)
      puts "✅ Created jsinspector-modern symlink in public headers"
    end

    # Create private symlink
    jsinspector_priv_src = File.join(private_headers, 'React-jsinspector')
    jsinspector_priv_dest = File.join(private_headers, 'jsinspector-modern')
    if File.directory?(jsinspector_priv_src) && !File.exist?(jsinspector_priv_dest)
      FileUtils.ln_sf('React-jsinspector', jsinspector_priv_dest)
      puts "✅ Created jsinspector-modern symlink in private headers"
    end

    # Add header search paths to all targets
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |build_config|
        build_config.build_settings['HEADER_SEARCH_PATHS'] ||= ['$(inherited)']
        header_paths = build_config.build_settings['HEADER_SEARCH_PATHS']
        unless header_paths.to_s.include?('jsinspector')
          build_config.build_settings['HEADER_SEARCH_PATHS'] << '"$(PODS_ROOT)/Headers/Public/React-jsinspector"'
          build_config.build_settings['HEADER_SEARCH_PATHS'] << '"$(PODS_ROOT)/Headers/Public/jsinspector-modern"'
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
