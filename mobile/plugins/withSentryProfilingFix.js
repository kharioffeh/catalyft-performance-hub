const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * This plugin fixes the Sentry profiling C++ compilation issue
 * by adding a post_install hook that disables problematic compiler flags
 * for the Sentry-Profiling pod.
 */

function withSentryProfilingFix(config) {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');

      if (fs.existsSync(podfilePath)) {
        let podfileContent = fs.readFileSync(podfilePath, 'utf8');
        const originalContent = podfileContent;

        // Add a fix for Sentry profiling C++ issues if not already present
        if (!podfileContent.includes('Sentry profiling fix')) {
          // Find the post_install block and add our fix
          const postInstallFix = `
    # Sentry profiling fix - Disable strict C++ allocator checks for Sentry profiling
    installer.pods_project.targets.each do |target|
      if target.name.include?('Sentry')
        target.build_configurations.each do |config|
          # Use C++14 for Sentry to avoid C++17 allocator issues
          config.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++14'
          # Disable problematic warnings as errors
          config.build_settings['GCC_TREAT_WARNINGS_AS_ERRORS'] = 'NO'
          # Add preprocessor define to skip problematic profiling code
          existing_flags = config.build_settings['OTHER_CPLUSPLUSFLAGS'] || '$(inherited)'
          if existing_flags.is_a?(Array)
            existing_flags = existing_flags.join(' ')
          end
          config.build_settings['OTHER_CPLUSPLUSFLAGS'] = existing_flags + ' -DSENTRY_PROFILING_DISABLED=1'
        end
      end
    end
`;
          // Insert the fix into the post_install block
          podfileContent = podfileContent.replace(
            /(post_install do \|installer\|[\s\S]*?)(^\s*end\s*$)/m,
            `$1${postInstallFix}\n$2`
          );
        }

        if (podfileContent !== originalContent) {
          fs.writeFileSync(podfilePath, podfileContent);
          console.log('✅ Added Sentry profiling fix to Podfile');
        }
      }

      return config;
    },
  ]);
}

module.exports = withSentryProfilingFix;
