/* eslint-disable */
const path = require("path");

module.exports = {
  testRunner: {
    args: { $0: "jest", config: "e2e/jest.config.js" },
    jest: { setupTimeout: 120000 }
  },

  apps: {
    "ios.debug": {
      type: "ios.app",
      // Xcode derived data path below; wildcard is fine for Detox
      binaryPath: "ios/build/Build/Products/Debug-iphonesimulator/*.app",
      build: [
        "rm -rf ios",
        "CI=1 npx expo prebuild --platform ios --clean",
        "cd ios && npx pod-install",
        `bash -lc 'cd ios; WORKSPACE=$(ls -1 *.xcworkspace | head -1); \
SCHEME=$(xcodebuild -list -json -workspace "$WORKSPACE" | /usr/bin/python3 -c "import sys,json; print(json.load(sys.stdin)[\\"workspace\\"][\\"schemes\\"][0])"); \
xcodebuild -workspace "$WORKSPACE" -scheme "$SCHEME" -configuration Debug -sdk iphonesimulator -derivedDataPath build CODE_SIGNING_ALLOWED=NO'`
      ].join(" && ")
    },

    "android.debug": {
      type: "android.apk",
      binaryPath: "android/app/build/outputs/apk/debug/app-debug.apk",
      testBinaryPath: "android/app/build/outputs/apk/androidTest/debug/app-debug-androidTest.apk",
      build: [
        "rm -rf android",
        "CI=1 npx expo prebuild --platform android --clean",
        // Inject global packaging excludes for ALL modules & androidTest (prebuild wipes local changes)
        `bash -lc 'cat >> android/build.gradle <<'\\''EOF'\\''
/* ---- CI: Packaging fix for Detox androidTest ---- */
subprojects {
  afterEvaluate { project ->
    if (project.plugins.hasPlugin("com.android.application") || project.plugins.hasPlugin("com.android.library")) {
      def ext = project.extensions.findByName("android")
      if (ext != null) {
        ext.packaging {
          resources {
            excludes += [
              "META-INF/LICENSE","META-INF/LICENSE.md","META-INF/LICENSE.txt",
              "META-INF/NOTICE","META-INF/NOTICE.md","META-INF/NOTICE.txt",
              "META-INF/DEPENDENCIES","META-INF/AL2.0","META-INF/LGPL2.1"
            ]
          }
        }
        ext.testOptions {
          packaging {
            resources {
              excludes += [
                "META-INF/LICENSE","META-INF/LICENSE.md","META-INF/LICENSE.txt",
                "META-INF/NOTICE","META-INF/NOTICE.md","META-INF/NOTICE.txt",
                "META-INF/DEPENDENCIES","META-INF/AL2.0","META-INF/LGPL2.1"
              ]
            }
          }
        }
      }
    }
  }
}
/* ---- end fix ---- */
EOF'`,
        // Build ONLY the app module (avoid :expo-dev-client androidTest merge step)
        "cd android && chmod +x gradlew && ./gradlew --no-daemon :app:assembleDebug :app:assembleAndroidTest -x lint --info"
      ].join(" && ")
    }
  },

  devices: {
    "ios.sim": { type: "ios.simulator", device: { type: "iPhone 15" } },
    "android.emu": { type: "android.emulator", device: { avdName: "Pixel_7_API_34" } }
  },

  configurations: {
    "ios.sim.debug": { device: "ios.sim", app: "ios.debug" },
    "android.emu.debug": { device: "android.emu", app: "android.debug" }
  }
};