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
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/mobile.app',
      build: 'rm -rf ios && npx expo prebuild --platform ios --clean && cd ios && pod install && xcodebuild -workspace mobile.xcworkspace -scheme mobile -configuration Debug -sdk iphonesimulator -derivedDataPath build -destination "platform=iOS Simulator,name=iPhone 14" CODE_SIGNING_ALLOWED=NO | xcpretty --color --simple'
    },
    'ios.release': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Release-iphonesimulator/mobile.app',
      build: 'rm -rf ios && npx expo prebuild --platform ios --clean && cd ios && pod install && xcodebuild -workspace mobile.xcworkspace -scheme mobile -configuration Release -sdk iphonesimulator -derivedDataPath build -destination "platform=iOS Simulator,name=iPhone 14" CODE_SIGNING_ALLOWED=NO | xcpretty --color --simple'
    },

    'android.debug': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      testBinaryPath: 'android/app/build/outputs/apk/androidTest/debug/app-debug-androidTest.apk',
      build: 'rm -rf android && npx expo prebuild --platform android --clean && cd android && chmod +x gradlew && ./gradlew clean && ./gradlew assembleDebug assembleAndroidTest -x lint --stacktrace',
      reversePorts: [8081]
    },
    'android.release': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/release/app-release.apk',
      build: 'rm -rf android && npx expo prebuild --platform android --clean && cd android && chmod +x gradlew && ./gradlew clean && ./gradlew assembleRelease -x lint --stacktrace'
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
