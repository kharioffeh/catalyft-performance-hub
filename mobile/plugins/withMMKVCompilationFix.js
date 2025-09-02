const { withAppBuildGradle, withGradleProperties } = require('@expo/config-plugins');

module.exports = function withMMKVCompilationFix(config) {
  // Update gradle.properties for MMKV compilation
  config = withGradleProperties(config, (config) => {
    // Remove any existing org.gradle.jvmargs and add optimized version
    config.modResults = config.modResults.filter(item => 
      !(item.type === 'property' && item.key === 'org.gradle.jvmargs')
    );
    
    config.modResults.push({
      type: 'property',
      key: 'org.gradle.jvmargs',
      value: '-Xmx4096m -XX:MaxMetaspaceSize=1024m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8'
    });

    // Add specific MMKV compilation properties
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

    return config;
  });

  // Update app-level build.gradle
  config = withAppBuildGradle(config, (config) => {
    // Ensure proper Java compilation options
    if (!config.modResults.contents.includes('compileOptions')) {
      config.modResults.contents = config.modResults.contents.replace(
        /android\s*\{/,
        `android {
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = '17'
    }`
      );
    }

    // Add specific packaging options for MMKV
    if (!config.modResults.contents.includes('packaging {')) {
      config.modResults.contents = config.modResults.contents.replace(
        /(\s+)(\})/,
        `$1packaging {
        resources {
            excludes += [
                'META-INF/LICENSE',
                'META-INF/LICENSE.md',
                'META-INF/LICENSE.txt',
                'META-INF/NOTICE',
                'META-INF/NOTICE.md',
                'META-INF/NOTICE.txt',
                'META-INF/DEPENDENCIES',
                'META-INF/DEPENDENCIES.txt',
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
                '**/libc++_shared.so',
                '**/libjsc.so',
                '**/libfb.so',
                '**/libhermes.so'
            ]
        }
    }
$1$2`
      );
    }

    // Add specific dependencies for MMKV
    if (!config.modResults.contents.includes('implementation("androidx.annotation:annotation")')) {
      config.modResults.contents = config.modResults.contents.replace(
        /dependencies\s*\{/,
        `dependencies {
    implementation("com.facebook.react:react-android")
    implementation("com.facebook.react:hermes-android")
    
    // MMKV compilation fixes
    implementation("androidx.annotation:annotation:1.7.0")
    implementation("com.google.code.findbugs:jsr305:3.0.2")
    implementation("org.jetbrains:annotations:24.0.1")`
      );
    }

    return config;
  });

  return config;
};