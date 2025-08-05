# E2E Testing Setup for Catalyft Performance Hub

This document outlines how to set up and run End-to-End (E2E) tests for both iOS and Android platforms using Detox in GitHub Actions.

## Quick Start

The E2E tests are automatically triggered on:
- Push to `main` or `develop` branches
- Pull requests to `main` branch
- Manual trigger via GitHub Actions UI

### Manual Trigger
1. Go to **Actions** tab in GitHub
2. Select **E2E Tests** workflow
3. Click **Run workflow**

## Prerequisites

### Local Development (Optional)
- **Node.js 18+**
- **Detox CLI**: `npm install -g detox-cli`
- **For iOS**: Xcode 14+, iOS Simulator
- **For Android**: Android Studio, Android SDK, Emulator

### Cloud-based Testing (Recommended)
All dependencies are automatically installed in GitHub Actions - no local setup required!

## Test Configuration

### Detox Configuration (`.detoxrc.js`)
```javascript
module.exports = {
  testRunner: 'jest',
  runnerConfig: 'e2e/jest.config.js',
  configurations: {
    'ios.sim.debug': {
      device: 'simulator',
      app: 'ios.debug'
    },
    'android.emu.debug': {
      device: 'emulator',
      app: 'android.debug'
    }
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: { type: 'iPhone 15' }
    },
    emulator: {
      type: 'android.emulator',
      device: { avdName: 'test_emulator' }
    }
  },
  apps: {
    'ios.debug': {
      type: 'ios.app',
      build: 'cd ios && xcodebuild -workspace *.xcworkspace -scheme * -configuration Debug -sdk iphonesimulator -derivedDataPath build',
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/*.app'
    },
    'android.debug': {
      type: 'android.apk',
      build: 'cd android && ./gradlew assembleDebug',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk'
    }
  }
};
```

## Available NPM Scripts

Add these to your `mobile/package.json`:

```json
{
  "scripts": {
    "detox:validate": "node scripts/validate-e2e-setup.js",
    "detox:build:ios": "detox build --configuration ios.sim.debug",
    "detox:test:ios": "detox test --configuration ios.sim.debug",
    "detox:build:android": "detox build --configuration android.emu.debug", 
    "detox:test:android": "detox test --configuration android.emu.debug"
  }
}
```

## Test Structure

### Test Files
- **Main Test Suite**: `mobile/e2e/flows.e2e.ts`
- **Test Helpers**: `mobile/e2e/helpers.ts`
- **Jest Config**: `mobile/e2e/jest.config.js`

### Core E2E Flows Tested

1. **Authentication & Onboarding**
   - Web sign-up → magic-link deep-link → mobile landing logged-in
   - Web Stripe checkout webhook stub → mobile premium flag check

2. **Dashboard & Analytics**
   - Dashboard loads demo metrics from Supabase
   - Analytics screen: tonnage + heatmap charts render

3. **Training Features**
   - Lift logger create / edit / delete cycle
   - Calendar schedule → start → finish session

4. **Nutrition & AI**
   - Nutrition scanner: mock barcode photo → macro parsing
   - ARIA chat prompt → program builder response visible

5. **Offline Functionality**
   - Offline mode toggle → action queue replay on reconnect

## Test IDs Reference

Components with `testID` props for testing:

### Dashboard Screen
```jsx
<View testID="dashboard-container">
<Text testID="dashboard-welcome-text">
<TouchableOpacity testID="user-profile-avatar">
<View testID="health-metrics-container">
<View testID="strain-metric-card">
<View testID="recovery-metric-card">
```

### Training Screen
```jsx
<View testID="training-container">
<TouchableOpacity testID="calendar-view-button">
<TouchableOpacity testID="start-workout-button">
<TouchableOpacity testID="lift-create-button">
<TouchableOpacity testID="aria-chat-button">
```

### Analytics Screen
```jsx
<View testID="analytics-container">
<TouchableOpacity testID="analytics-period-7d">
<TouchableOpacity testID="analytics-period-30d">
<View testID="analytics-charts-container">
<Text testID="tonnage-chart-title">
```

### Navigation
```jsx
<Tab.Screen options={{ tabBarTestID: 'tab-Dashboard' }} />
<Tab.Screen options={{ tabBarTestID: 'tab-Training' }} />
<Tab.Screen options={{ tabBarTestID: 'tab-Analytics' }} />
```

## Local Testing Commands

### iOS
```bash
cd mobile
npm run detox:build:ios
npm run detox:test:ios
```

### Android  
```bash
cd mobile
npm run detox:build:android
npm run detox:test:android
```

### Validation
```bash
cd mobile
npm run detox:validate
```

## GitHub Actions Workflow

### Workflow File
`.github/workflows/e2e-tests.yml`

### Jobs
- **e2e-ios**: Runs on `macos-13` with iPhone 15 simulator
- **e2e-android**: Runs on `ubuntu-latest` with Android emulator
- **test-summary**: Aggregates results from both platforms

### Environment Setup
- **iOS**: Automatic Xcode/Simulator setup
- **Android**: SDK, emulator, and KVM acceleration
- **Dependencies**: Node.js, Expo CLI, Detox, Jest

## Troubleshooting

### Common Issues

1. **"Dependencies lock file not found"**
   - Fixed: Removed cache configuration from setup-node action

2. **"Missing script: detox:validate"**
   - Fixed: Added all detox scripts to package.json

3. **iOS build failures**
   - Fixed: Switched from expo run:ios to expo prebuild + xcodebuild

4. **Android emulator issues**
   - Fixed: Added proper KVM setup and missing libraries

5. **Jest TypeScript errors**
   - Fixed: Added ts-jest preset and proper configuration

6. **Android duplicate META-INF files**
   - Fixed: Added packaging options to gradle.properties

### Debug Commands

#### iOS Debugging
```bash
# List available simulators
xcrun simctl list devices available

# Check applesimutils
applesimutils --version

# Manual simulator boot
xcrun simctl boot "iPhone 15"
```

#### Android Debugging
```bash
# Check AVD
$ANDROID_HOME/cmdline-tools/latest/bin/avdmanager list avd

# Check devices
adb devices

# Emulator logs
$ANDROID_HOME/emulator/emulator -avd test_emulator -verbose
```

## CI/CD Integration

### Success Criteria
- All test suites pass on both iOS and Android
- No critical performance regressions detected
- All core user flows working end-to-end

### Failure Handling
- Automatic retry for flaky tests
- Detailed logs and artifacts uploaded on failure
- Summary report with platform-specific results

## Writing New Tests

### Example Test Structure
```typescript
describe('New Feature Flow', () => {
  beforeEach(async () => {
    await device.launchApp();
  });

  it('should handle new user interaction', async () => {
    // Navigate to feature
    await E2EHelpers.navigateToTab('Feature');
    
    // Interact with elements
    await element(by.id('feature-button')).tap();
    
    // Assert expected outcome
    await expect(element(by.id('result-text'))).toBeVisible();
  });
});
```

### Best Practices
1. Use descriptive test IDs
2. Leverage helper functions for common actions
3. Add proper waits for async operations
4. Test both happy path and error scenarios
5. Keep tests isolated and independent

## Performance Monitoring

Tests monitor key performance metrics:
- App launch time
- Screen transition speed  
- API response times
- Memory usage patterns

Results are tracked over time to detect regressions.

---

For more details, see the [main project documentation](../README.md).

<!-- Trigger E2E workflow run - test fix 2025-01-05 -->
