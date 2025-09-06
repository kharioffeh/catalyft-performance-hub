const { withAppBuildGradle, withGradleProperties } = require('@expo/config-plugins');

module.exports = function withMMKVAlternative(config) {
  // Update gradle.properties for MMKV 2.x compatibility
  config = withGradleProperties(config, (config) => {
    // Remove any existing org.gradle.jvmargs and add MMKV 2.x optimized version
    config.modResults = config.modResults.filter(item => 
      !(item.type === 'property' && item.key === 'org.gradle.jvmargs')
    );
    
    config.modResults.push({
      type: 'property',
      key: 'org.gradle.jvmargs',
      value: '-Xmx3072m -XX:MaxMetaspaceSize=512m -XX:+HeapDumpOnOutOfMemoryError'
    });

    // Add MMKV 2.x specific properties
    config.modResults.push({
      type: 'property',
      key: 'android.enableR8.fullMode',
      value: 'false'
    });
    
    config.modResults.push({
      type: 'property',
      key: 'android.enableDexingArtifactTransform',
      value: 'false'
    });

    config.modResults.push({
      type: 'property',
      key: 'android.enableProguardInReleaseBuilds',
      value: 'false'
    });

    // Add legacy packaging for MMKV 2.x
    config.modResults.push({
      type: 'property',
      key: 'expo.useLegacyPackaging',
      value: 'true'
    });

    return config;
  });

  // Update app-level build.gradle for MMKV 2.x
  config = withAppBuildGradle(config, (config) => {
    // Ensure proper Java compilation options for MMKV 2.x
    if (!config.modResults.contents.includes('compileOptions')) {
      config.modResults.contents = config.modResults.contents.replace(
        /android\s*\{/,
        `android {
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_11
        targetCompatibility JavaVersion.VERSION_11
    }
    kotlinOptions {
        jvmTarget = '11'
    }`
      );
    }

    // Add legacy packaging options for MMKV 2.x
    if (!config.modResults.contents.includes('packagingOptions')) {
      config.modResults.contents = config.modResults.contents.replace(
        /(\s+)(\})/,
        `$1packagingOptions {
        pickFirst '**/libc++_shared.so'
        pickFirst '**/libjsc.so'
        pickFirst '**/libfb.so'
        pickFirst 'META-INF/LICENSE'
        pickFirst 'META-INF/LICENSE.md'
        pickFirst 'META-INF/LICENSE.txt'
        pickFirst 'META-INF/NOTICE'
        pickFirst 'META-INF/NOTICE.md'
        pickFirst 'META-INF/NOTICE.txt'
        pickFirst 'META-INF/DEPENDENCIES'
        pickFirst 'META-INF/DEPENDENCIES.txt'
        exclude 'META-INF/LGPL2.1'
        exclude 'META-INF/AL2.0'
    }
$1$2`
      );
    }

    return config;
  });

  return config;
};