const { withAppBuildGradle } = require('@expo/config-plugins');

module.exports = function withAndroidPackagingOptions(config) {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.contents.includes('packaging {')) {
      return config;
    }

    // Add packaging block right after the android { block (Gradle 8+ syntax)
    config.modResults.contents = config.modResults.contents.replace(
      /android\s*\{/,
      `android {
    packaging {
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
                'META-INF/versions/**',
                'META-INF/MANIFEST.MF'
            ]
            pickFirsts += [
                'META-INF/LICENSE',
                'META-INF/LICENSE.md',
                'META-INF/LICENSE.txt',
                'META-INF/NOTICE',
                'META-INF/NOTICE.md',
                'META-INF/NOTICE.txt',
                'META-INF/DEPENDENCIES',
                'META-INF/DEPENDENCIES.txt',
                'lib/x86/libc++_shared.so',
                'lib/x86_64/libc++_shared.so',
                'lib/arm64-v8a/libc++_shared.so',
                'lib/armeabi-v7a/libc++_shared.so',
                '**/libc++_shared.so',
                '**/libjsc.so',
                '**/libfb.so'
            ]
        }
    }`
    );

    return config;
  });
};