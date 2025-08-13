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
        'npx expo prebuild --platform ios --non-interactive --no-install',
        'cd ios',
        // discover workspace & a non-Pods/non-library scheme
        'WORKSPACE=$(ls -1 *.xcworkspace | head -1)',
        `SCHEME=$(xcodebuild -workspace "$WORKSPACE" -list \
          | sed -n '/Schemes:/,$p' | tail -n +2 | sed 's/^\\s*//' | sed '/^$/d' \
          | grep -v -E 'Pods|boost|Sentry|RN|RCT|Yoga|Hermes|Flipper' \
          | head -1)`,
        'echo "Using iOS scheme: $SCHEME"',
        'xcodebuild -workspace "$WORKSPACE" -scheme "$SCHEME" -configuration Debug -sdk iphonesimulator -derivedDataPath build CODE_SIGNING_ALLOWED=NO'
      ].join(' && ')
    },
    'ios.release': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Release-iphonesimulator/*.app',
      build: [
        'rm -rf ios',
        'npx expo prebuild --platform ios --non-interactive --no-install',
        'cd ios',
        // discover workspace & a non-Pods/non-library scheme
        'WORKSPACE=$(ls -1 *.xcworkspace | head -1)',
        `SCHEME=$(xcodebuild -workspace "$WORKSPACE" -list \
          | sed -n '/Schemes:/,$p' | tail -n +2 | sed 's/^\\s*//' | sed '/^$/d' \
          | grep -v -E 'Pods|boost|Sentry|RN|RCT|Yoga|Hermes|Flipper' \
          | head -1)`,
        'echo "Using iOS scheme: $SCHEME"',
        'xcodebuild -workspace "$WORKSPACE" -scheme "$SCHEME" -configuration Release -sdk iphonesimulator -derivedDataPath build CODE_SIGNING_ALLOWED=NO'
      ].join(' && ')
    },

    'android.debug': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      testBinaryPath: 'android/app/build/outputs/apk/androidTest/debug/app-debug-androidTest.apk',
      build: [
        'rm -rf android',
        'npx expo prebuild --platform android --non-interactive --clean',
        // inject packagingOptions into android/app/build.gradle if missing
        `perl -0777 -pe 's/android \\{\\n(\\s*)defaultConfig:/android {\\n$1packagingOptions {\\n$1    resources {\\n$1        excludes += ["META-INF\\/LICENSE*", "META-INF\\/NOTICE*", "META-INF\\/DEPENDENCIES"]\\n$1    }\\n$1}\\n\\n$1defaultConfig:/s' -i android/app/build.gradle`,
        'cd android',
        'chmod +x gradlew',
        './gradlew --no-daemon assembleDebug assembleAndroidTest'
      ].join(' && '),
      reversePorts: [8081]
    },
    'android.release': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/release/app-release.apk',
      build: [
        'rm -rf android',
        'npx expo prebuild --platform android --non-interactive --clean',
        // inject packagingOptions into android/app/build.gradle if missing
        `perl -0777 -pe 's/android \\{\\n(\\s*)defaultConfig:/android {\\n$1packagingOptions {\\n$1    resources {\\n$1        excludes += ["META-INF\\/LICENSE*", "META-INF\\/NOTICE*", "META-INF\\/DEPENDENCIES"]\\n$1    }\\n$1}\\n\\n$1defaultConfig:/s' -i android/app/build.gradle`,
        'cd android',
        'chmod +x gradlew',
        './gradlew --no-daemon assembleRelease'
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
