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
      // we build a concrete app bundle (not a glob) in CI, but allow glob for local:
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/*.app',
      build: 'if [ ! -d ios ]; then npx expo prebuild --platform ios; fi && cd ios && WORKSPACE_NAME=$(find . -name "*.xcworkspace" | head -1 | sed "s|./||") && SCHEME_NAME=$(xcodebuild -workspace "$WORKSPACE_NAME" -list | grep -A 100 "Schemes:" | grep -v "Schemes:" | head -1 | xargs) && xcodebuild -workspace "$WORKSPACE_NAME" -scheme "$SCHEME_NAME" -configuration Debug -sdk iphonesimulator -derivedDataPath build'
    },

    'ios.release': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Release-iphonesimulator/*.app',
      build: 'if [ ! -d ios ]; then npx expo prebuild --platform ios; fi && cd ios && WORKSPACE_NAME=$(find . -name "*.xcworkspace" | head -1 | sed "s|./||") && SCHEME_NAME=$(xcodebuild -workspace "$WORKSPACE_NAME" -list | grep -A 100 "Schemes:" | grep -v "Schemes:" | head -1 | xargs) && xcodebuild -workspace "$WORKSPACE_NAME" -scheme "$SCHEME_NAME" -configuration Release -sdk iphonesimulator -derivedDataPath build'
    },

    'android.debug': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      // Detox needs the test APK when using instrumentation
      testBinaryPath: 'android/app/build/outputs/apk/androidTest/debug/app-debug-androidTest.apk',
      build: 'if [ ! -d android ]; then npx expo prebuild --platform android; fi && cd android && chmod +x gradlew && ./gradlew assembleDebug assembleAndroidTest',
      reversePorts: [8081]
    },

    'android.release': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/release/app-release.apk',
      build: 'if [ ! -d android ]; then npx expo prebuild --platform android; fi && cd android && chmod +x gradlew && ./gradlew assembleRelease'
    },
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
