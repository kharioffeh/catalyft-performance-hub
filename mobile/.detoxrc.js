/** @type {import('detox').DetoxConfig} */
module.exports = {
  testRunner: {
    $0: 'jest',
    args: { config: 'e2e/jest.config.js' },
  },

  jest: { setupTimeout: 180000 },

  apps: {
    'ios.debug': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/*.app',
      build: [
        'rm -rf ios',
        'npx expo prebuild --platform ios --clean',
        'cd ios',
        // Use mobile.xcodeproj directly - it's the standard name from expo prebuild
        `SCHEME=$(xcodebuild -project mobile.xcodeproj -list \
          | sed -n '/Schemes:/,$p' | tail -n +2 | sed 's/^\\s*//' | sed '/^$/d' \
          | grep -v -E 'Pods|boost|Sentry|RN|RCT|Yoga|Hermes|Flipper' \
          | head -1)`,
        'echo "Using iOS scheme: $SCHEME"',
        'xcodebuild -project mobile.xcodeproj -scheme "$SCHEME" -configuration Debug -sdk iphonesimulator -derivedDataPath build CODE_SIGNING_ALLOWED=NO'
      ].join(' && ')
    },
    'ios.release': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Release-iphonesimulator/*.app',
      build: [
        'rm -rf ios',
        'npx expo prebuild --platform ios --clean',
        'cd ios',
        // Use mobile.xcodeproj directly - it's the standard name from expo prebuild
        `SCHEME=$(xcodebuild -project mobile.xcodeproj -list \
          | sed -n '/Schemes:/,$p' | tail -n +2 | sed 's/^\\s*//' | sed '/^$/d' \
          | grep -v -E 'Pods|boost|Sentry|RN|RCT|Yoga|Hermes|Flipper' \
          | head -1)`,
        'echo "Using iOS scheme: $SCHEME"',
        'xcodebuild -project mobile.xcodeproj -scheme "$SCHEME" -configuration Release -sdk iphonesimulator -derivedDataPath build CODE_SIGNING_ALLOWED=NO'
      ].join(' && ')
    },

    'android.debug': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      testBinaryPath: 'android/app/build/outputs/apk/androidTest/debug/app-debug-androidTest.apk',
      build: [
        'rm -rf android',
        'npx expo prebuild --platform android --clean',
        'cd android',
        // Create a gradle init script to apply packagingOptions to all projects
        `echo 'allprojects { afterEvaluate { if (it.hasProperty("android")) { android { packagingOptions { resources { excludes += ["META-INF/LICENSE", "META-INF/LICENSE.md", "META-INF/LICENSE.txt", "META-INF/NOTICE", "META-INF/NOTICE.md", "META-INF/NOTICE.txt", "META-INF/DEPENDENCIES", "META-INF/AL2.0", "META-INF/LGPL2.1"] pickFirsts += ["META-INF/LICENSE", "META-INF/LICENSE.md", "META-INF/NOTICE", "META-INF/NOTICE.md"] } } } } }' > packaging.gradle.init`,
        'chmod +x gradlew',
        './gradlew --no-daemon --init-script packaging.gradle.init assembleDebug assembleAndroidTest'
      ].join(' && '),
      reversePorts: [8081]
    },
    'android.release': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/release/app-release.apk',
      build: [
        'rm -rf android',
        'npx expo prebuild --platform android --clean',
        'cd android',
        // Create a gradle init script to apply packagingOptions to all projects
        `echo 'allprojects { afterEvaluate { if (it.hasProperty("android")) { android { packagingOptions { resources { excludes += ["META-INF/LICENSE", "META-INF/LICENSE.md", "META-INF/LICENSE.txt", "META-INF/NOTICE", "META-INF/NOTICE.md", "META-INF/NOTICE.txt", "META-INF/DEPENDENCIES", "META-INF/AL2.0", "META-INF/LGPL2.1"] pickFirsts += ["META-INF/LICENSE", "META-INF/LICENSE.md", "META-INF/NOTICE", "META-INF/NOTICE.md"] } } } } }' > packaging.gradle.init`,
        'chmod +x gradlew',
        './gradlew --no-daemon --init-script packaging.gradle.init assembleRelease'
      ].join(' && ')
    }
  },

  devices: {
    simulator: { type: 'ios.simulator', device: { type: 'iPhone 14' } },
    emulator:  { type: 'android.emulator', avdName: 'test_emulator' }
  },

  configurations: {
    'ios.sim.debug':     { device: 'simulator', app: 'ios.debug' },
    'android.emu.debug': { device: 'emulator',  app: 'android.debug' },
  },
};
