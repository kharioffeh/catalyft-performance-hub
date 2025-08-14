const { withAppBuildGradle } = require('@expo/config-plugins');

module.exports = function withAndroidPackagingOptions(config) {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.contents.includes('packagingOptions')) {
      return config;
    }

    // Add packagingOptions right after the android { block
    config.modResults.contents = config.modResults.contents.replace(
      /android\s*\{/,
      `android {
    packagingOptions {
        resources {
            excludes += [
                'META-INF/LICENSE',
                'META-INF/LICENSE.md',
                'META-INF/LICENSE.txt',
                'META-INF/LICENSE-APACHE',
                'META-INF/LICENSE-APACHE.txt',
                'META-INF/NOTICE',
                'META-INF/NOTICE.md',
                'META-INF/NOTICE.txt',
                'META-INF/DEPENDENCIES',
                'META-INF/AL2.0',
                'META-INF/LGPL2.1',
                'META-INF/versions/**'
            ]
            pickFirsts += [
                'META-INF/LICENSE',
                'META-INF/LICENSE.md',
                'META-INF/NOTICE',
                'META-INF/NOTICE.md'
            ]
        }
    }`
    );

    return config;
  });
};