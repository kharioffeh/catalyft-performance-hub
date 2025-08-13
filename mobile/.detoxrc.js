/** @type {Detox.DetoxConfig} */
module.exports = {
  testRunner: {
    $0: 'jest',
    args: { config: 'e2e/jest.config.js' }
  },
  jest: {
    setupTimeout: 180000
  },
  apps: {
    'ios.debug': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/*.app',
      build:
        'rm -rf ios && npx expo prebuild --platform ios && cd ios && ' +
        'WORKSPACE_NAME=$(find . -name "*.xcworkspace" | head -1 | sed "s|./||") && ' +
        'SCHEME_NAME=$(xcodebuild -workspace "$WORKSPACE_NAME" -list | grep -A 100 "Schemes:" | grep -v "Schemes:" | head -1 | xargs) && ' +
        'xcodebuild -workspace "$WORKSPACE_NAME" -scheme "$SCHEME_NAME" -configuration Debug -sdk iphonesimulator -derivedDataPath build'
    },
    'ios.release': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Release-iphonesimulator/*.app',
      build:
        'rm -rf ios && npx expo prebuild --platform ios && cd ios && ' +
        'WORKSPACE_NAME=$(find . -name "*.xcworkspace" | head -1 | sed "s|./||") && ' +
        'SCHEME_NAME=$(xcodebuild -workspace "$WORKSPACE_NAME" -list | grep -A 100 "Schemes:" | grep -v "Schemes:" | head -1 | xargs) && ' +
        'xcodebuild -workspace "$WORKSPACE_NAME" -scheme "$SCHEME_NAME" -configuration Release -sdk iphonesimulator -derivedDataPath build'
    },
    'android.debug': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      // REQUIRED so Detox can install the androidTest APK:
      testBinaryPath: 'android/app/build/outputs/apk/androidTest/debug/app-debug-androidTest.apk',
      build:
        'rm -rf android && npx expo prebuild --platform android && cd android && chmod +x gradlew && ' +
        './gradlew assembleDebug assembleAndroidTest'
    },
    'android.release': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/release/app-release.apk',
      build:
        'rm -rf android && npx expo prebuild --platform android && cd android && chmod +x gradlew && ' +
        './gradlew assembleRelease'
    }
  }, // ← IMPORTANT trailing comma so "devices" parses

  // Keep artifacts minimal to speed CI
  artifacts: {
    rootDir: 'artifacts',
    plugins: {
      log: { enabled: false },
      video: { enabled: false },
      instruments: { enabled: false },
      uiHierarchy: { enabled: false },
      screenshot: {
        enabled: true,
        shouldTakeAutomaticSnapshots: false,
        keepOnlyFailedTestsArtifacts: true
      }
    }
  },

  behavior: {
    init: { keepLockFile: false, reinstallApp: true, exposeGlobals: true },
    cleanup: { shutdownDevice: false },
    launchApp: 'auto'
  },

  devices: {
    simulator: { type: 'ios.simulator', device: { type: 'iPhone 14' } },
    emulator:  { type: 'android.emulator', device: { avdName: 'Pixel_6_API_35' } }
  },

  configurations: {
    'ios.sim.debug':     { device: 'simulator', app: 'ios.debug' },
    'android.emu.debug': { device: 'emulator',  app: 'android.debug' }
  }
};
