/** @type {Detox.DetoxConfig} */
module.exports = {
  testRunner: {
    args: {
      '$0': 'jest',
      config: 'e2e/jest.config.js'
    },
    jest: {
      setupTimeout: 180000
    }
  },
  apps: {
    'ios.debug': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/*.app',
      build: 'rm -rf ios && npx expo prebuild --platform ios && cd ios && WORKSPACE_NAME=$(find . -name "*.xcworkspace" | head -1 | sed "s|./||") && SCHEME_NAME=$(xcodebuild -workspace "$WORKSPACE_NAME" -list | grep -A 100 "Schemes:" | grep -v "Schemes:" | head -1 | xargs) && xcodebuild -workspace "$WORKSPACE_NAME" -scheme "$SCHEME_NAME" -configuration Debug -sdk iphonesimulator -derivedDataPath build'
    },
    'ios.release': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Release-iphonesimulator/*.app',
      build: 'rm -rf ios && npx expo prebuild --platform ios && cd ios && WORKSPACE_NAME=$(find . -name "*.xcworkspace" | head -1 | sed "s|./||") && SCHEME_NAME=$(xcodebuild -workspace "$WORKSPACE_NAME" -list | grep -A 100 "Schemes:" | grep -v "Schemes:" | head -1 | xargs) && xcodebuild -workspace "$WORKSPACE_NAME" -scheme "$SCHEME_NAME" -configuration Release -sdk iphonesimulator -derivedDataPath build'
    },
    'android.debug': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
        testBinaryPath: 'android/app/build/outputs/apk/androidTest/debug/app-debug-androidTest.apk',
      build: 'rm -rf android && npx expo prebuild --platform android && cd android && chmod +x gradlew && ./gradlew assembleDebug',
      reversePorts: [
        8081
      ]
    },
    'android.release': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/release/app-release.apk',
      build: 'rm -rf android && npx expo prebuild --platform android && cd android && chmod +x gradlew && ./gradlew assembleRelease'
    }
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: {
        type: 'iPhone 14'
      }
    },
    attached: {
      type: 'android.attached',
      device: {
        adbName: '.*'
      }
    },
    emulator: {
      type: 'android.emulator',
      device: {
        avdName: 'test_emulator'
      }
    }
  },
  configurations: {
    'ios.sim.debug': {
      device: 'simulator',
      app: 'ios.debug'
    },
    'ios.sim.release': {
      device: 'simulator',
      app: 'ios.release'
    },
    'android.att.debug': {
      device: 'attached',
      app: 'android.debug'
    },
    'android.att.release': {
      device: 'attached',
      app: 'android.release'
    },
    'android.emu.debug': {
      device: 'emulator',
      app: 'android.debug'
    },
    'android.emu.release': {
      device: 'emulator',
      app: 'android.release'
    }
  }
};
