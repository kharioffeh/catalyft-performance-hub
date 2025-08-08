# E2E Testing Documentation

This guide provides comprehensive instructions for setting up and running End-to-End (E2E) tests for the CataLyft Performance Hub mobile application using Detox and GitHub Actions.

## Overview

Our E2E testing setup supports both iOS and Android platforms with cloud-based testing via GitHub Actions. The tests cover core user flows including authentication, dashboard interactions, training sessions, analytics, nutrition tracking, and settings management.

## Quick Start

```bash
# In the mobile directory
npm install
npm run detox:validate
npm run detox:build:ios     # For iOS testing  
npm run detox:test:ios      # Run iOS tests
npm run detox:build:android # For Android testing
npm run detox:test:android  # Run Android tests
```

## Prerequisites

### For Local iOS Testing (macOS only)
- Xcode 14.0 or later
- iOS Simulator
- Node.js 18+
- Homebrew

### For Local Android Testing
- Android Studio
- Android SDK (API 30+)
- Android Virtual Device (AVD)
- Node.js 18+

### For GitHub Actions (Cloud Testing)
- GitHub repository with Actions enabled
- No local setup required - runs in the cloud!

## Installation

### 1. Install Dependencies

```bash
cd mobile
npm install
```

### 2. Install Platform-Specific Tools

#### iOS (macOS only)
```bash
# Install Detox CLI globally
npm install -g detox-cli

# Install applesimutils (required by Detox)
brew tap wix/brew
brew install applesimutils
```

#### Android
```bash
# Install Detox CLI globally  
npm install -g detox-cli

# Ensure Android SDK is properly configured
export ANDROID_HOME=$HOME/Library/Android/sdk  # macOS
export ANDROID_HOME=$HOME/Android/Sdk          # Linux
```

## Configuration

### Detox Configuration

The Detox configuration is defined in `.detoxrc.js`:

```javascript
module.exports = {
  testRunner: {
    args: {
      '$0': 'jest',
      config: 'e2e/jest.config.js'
    },
    jest: {
      setupTimeout: 120000
    }
  },
  apps: {
    'ios.debug': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/mobile.app',
      build: 'xcodebuild -workspace ios/mobile.xcworkspace -scheme mobile -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build'
    },
    'android.debug': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      build: 'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug',
      reversePorts: [8081]
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
  configurations: {
    'ios.sim.debug': {
      device: 'simulator',
      app: 'ios.debug'
    },
    'android.emu.debug': {
      device: 'emulator', 
      app: 'android.debug'
    }
  }
};
```

### Test Scripts

Available npm scripts in `package.json`:

```json
{
  "scripts": {
    "detox:validate": "node scripts/validate-e2e-setup.js",
    "detox:build:ios": "detox build --configuration ios.sim.debug",
    "detox:test:ios": "detox test --configuration ios.sim.debug", 
    "detox:build:android": "detox build --configuration android.emu.debug",
    "detox:test:android": "detox test --configuration android.emu.debug",
    "detox:smoke:ios": "detox test --configuration ios.sim.debug e2e/smoke.e2e.ts",
    "detox:smoke:android": "detox test --configuration android.emu.debug e2e/smoke.e2e.ts"
  }
}
```

## Test Structure

### Test Files

- `e2e/flows.e2e.ts` - Main E2E test suite covering all user flows
- `e2e/smoke.e2e.ts` - Basic smoke tests for quick validation
- `e2e/helpers.ts` - Utility functions and common test operations
- `e2e/jest.config.js` - Jest configuration for Detox
- `e2e/init.js` - Test environment initialization  
- `e2e/setup.js` - Global test setup

### Test Flows Covered

1. **Authentication & Onboarding**
   - Web sign-up → magic-link deep-link → mobile landing logged-in
   - Web Stripe checkout webhook stub → mobile premium flag check

2. **Dashboard & Metrics**
   - Dashboard loads demo metrics from Supabase
   - Health metrics display and interaction

3. **Training & Workouts** 
   - Lift logger create / edit / delete cycle
   - Calendar schedule → start → finish session

4. **Analytics & Reporting**
   - Analytics screen: tonnage + heatmap charts render
   - Performance tracking and visualization

5. **Nutrition Tracking**
   - Nutrition scanner: mock barcode photo → macro parsing
   - Meal logging and macro calculations

6. **AI & Personalization**
   - ARIA chat prompt → program builder response visible
   - Personalized workout recommendations

7. **Offline Functionality**
   - Offline mode toggle → action queue replay on reconnect
   - Data synchronization

## Test IDs Reference

### Navigation
- `tab-Dashboard` - Dashboard tab
- `tab-Training` - Training tab  
- `tab-Analytics` - Analytics tab
- `tab-Nutrition` - Nutrition tab
- `tab-Settings` - Settings tab

### Dashboard Screen
- `dashboard-container` - Main dashboard container
- `dashboard-refresh-control` - Pull-to-refresh control
- `dashboard-welcome-text` - Welcome message
- `user-profile-avatar` - User avatar
- `health-metrics-container` - Health metrics section
- `strain-metric-card` - Strain metric card
- `recovery-metric-card` - Recovery metric card
- `sleep-metric-card` - Sleep metric card  
- `hrv-metric-card` - HRV metric card

### Training Screen
- `training-container` - Main training container
- `calendar-view-button` - Calendar view toggle
- `start-workout-button` - Start workout button
- `lift-create-button` - Create new lift button
- `aria-chat-button` - ARIA chat interface

### Analytics Screen  
- `analytics-container` - Main analytics container
- `analytics-refresh-control` - Pull-to-refresh control
- `analytics-period-week` - Weekly view button
- `analytics-period-month` - Monthly view button
- `analytics-period-year` - Yearly view button
- `analytics-charts-container` - Charts container
- `tonnage-chart` - Tonnage chart
- `tonnage-chart-title` - Chart title

### Nutrition Screen
- `nutrition-container` - Main nutrition container
- `barcode-scanner-button` - Barcode scanner
- `quick-add-meal` - Quick add meal button

### Settings Screen
- `settings-container` - Main settings container
- `offline-setting` - Offline mode setting
- `offline-setting-toggle` - Offline mode toggle switch

## Running Tests

### Local Testing

#### iOS
```bash
# Start iOS simulator first
open -a Simulator

# Build and test
npm run detox:build:ios
npm run detox:test:ios

# Or run smoke tests only
npm run detox:smoke:ios
```

#### Android
```bash
# Start Android emulator first
$ANDROID_HOME/emulator/emulator -avd test_emulator

# Build and test
npm run detox:build:android  
npm run detox:test:android

# Or run smoke tests only
npm run detox:smoke:android
```

### GitHub Actions (Cloud Testing)

Tests run automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main` branch
- Manual workflow dispatch

**Manual Trigger:**
1. Go to GitHub Actions tab
2. Select "E2E Tests" workflow
3. Click "Run workflow"
4. Choose branch and click "Run workflow"

### Test Output

Tests generate detailed output including:
- Test results and assertions
- Screenshots on failures
- Device logs and crash reports
- Performance metrics
- Artifact uploads for debugging

## Troubleshooting

### Common Issues

#### iOS Simulator Issues
```bash
# Reset simulator
xcrun simctl erase all

# List available simulators  
xcrun simctl list devices

# Boot specific simulator
xcrun simctl boot "iPhone 15"
```

#### Android Emulator Issues
```bash
# List AVDs
$ANDROID_HOME/cmdline-tools/latest/bin/avdmanager list avd

# Delete and recreate AVD
$ANDROID_HOME/cmdline-tools/latest/bin/avdmanager delete avd -n test_emulator
$ANDROID_HOME/cmdline-tools/latest/bin/avdmanager create avd -n test_emulator -k "system-images;android-33;google_apis;x86_64"

# Start emulator with specific options
$ANDROID_HOME/emulator/emulator -avd test_emulator -no-audio -no-window
```

#### Build Issues
```bash
# Clean build artifacts
rm -rf ios/build android/app/build

# Clean node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clean Expo cache
npx expo r --clear
```

#### Test Failures
```bash
# Run with verbose logging
DETOX_LOGLEVEL=trace npm run detox:test:ios

# Run specific test file
npx detox test e2e/smoke.e2e.ts --configuration ios.sim.debug

# Debug mode (keeps simulator open)
npx detox test --configuration ios.sim.debug --debug-synchronization
```

### Environment Variables

```bash
# iOS
export DETOX_LOGLEVEL=info
export SIMCTL_CHILD_DYLD_INSERT_LIBRARIES=""

# Android  
export ANDROID_HOME=/path/to/android/sdk
export ANDROID_AVD_HOME=$HOME/.android/avd
export DETOX_LOGLEVEL=info
```

### Performance Tips

- Use `--maxWorkers 1` for Jest to avoid conflicts
- Enable hardware acceleration for Android emulator
- Close unnecessary applications during testing
- Use SSD storage for better emulator performance

## CI/CD Integration

### GitHub Actions Workflow

The `.github/workflows/e2e-tests.yml` file defines our CI pipeline:

```yaml
name: E2E Tests
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  workflow_dispatch:

jobs:
  e2e-ios:
    runs-on: macos-13
    # iOS testing steps...
    
  e2e-android:  
    runs-on: ubuntu-latest
    # Android testing steps...
```

### Workflow Features

- **Parallel Testing**: iOS and Android run simultaneously
- **Matrix Testing**: Multiple device/OS combinations
- **Artifact Upload**: Test results, screenshots, and logs
- **Smart Caching**: Dependencies and build artifacts
- **Retry Logic**: Automatic retry on transient failures
- **Notifications**: Slack/email alerts on failures

## Best Practices

### Writing Tests

1. **Use Page Object Pattern**
   ```typescript
   // helpers.ts
   export class LoginPage {
     static async login(email: string, password: string) {
       await element(by.id('email-input')).typeText(email);
       await element(by.id('password-input')).typeText(password);
       await element(by.id('login-button')).tap();
     }
   }
   ```

2. **Add Meaningful Test IDs**
   ```tsx
   <TouchableOpacity testID="submit-workout-button">
     <Text>Submit Workout</Text>
   </TouchableOpacity>
   ```

3. **Use Descriptive Test Names**
   ```typescript
   it('should create new workout when user taps create button and fills form', async () => {
     // Test implementation
   });
   ```

4. **Handle Async Operations**
   ```typescript
   await waitFor(element(by.id('loading-indicator')))
     .not.toBeVisible()
     .withTimeout(10000);
   ```

### Test Organization

- Group related tests in `describe` blocks
- Use `beforeEach` for common setup
- Clean up state between tests
- Use meaningful assertions with clear error messages

### Performance

- Minimize app launches (use `device.reloadReactNative()`)
- Batch similar operations
- Use efficient selectors (`by.id` > `by.text`)
- Clean up test data

## Maintenance

### Regular Tasks

1. **Update Dependencies**
   ```bash
   npm update detox
   npm update jest
   ```

2. **Clean Artifacts**
   ```bash
   rm -rf artifacts/
   rm -rf ios/build/
   rm -rf android/app/build/
   ```

3. **Update Test Data**
   - Review and update mock data
   - Validate API responses
   - Update test credentials

### Monitoring

- Track test execution times
- Monitor failure rates
- Review test coverage
- Update test scenarios based on new features

## Support

### Resources

- [Detox Documentation](https://wix.github.io/Detox/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Native Testing](https://reactnative.dev/docs/testing-overview)
- [GitHub Actions](https://docs.github.com/en/actions)

### Getting Help

1. Check this documentation first
2. Review existing test files for examples
3. Check GitHub Actions logs for CI issues
4. Create an issue in the repository for bugs
5. Reach out to the development team for guidance

---

**Last Updated**: August 2025  
**Version**: 1.0.0

## Status Dashboard

🚀 **Latest Update**: Testing with improved Jest TypeScript configuration and Android META-INF duplicate file handling

## Testing the CI/CD Pipeline

The GitHub Actions workflow runs automatically on:
- Pushes to `main` or `develop` branches
- Pull requests to `main` branch
- Manual trigger via `workflow_dispatch`

All critical Android build issues have been resolved, including:
- System image installation with fallbacks
- Missing library dependencies (libpulse0, libasound2t64, etc.)  
- META-INF duplicate file conflicts
- Jest TypeScript configuration
- Emulator startup optimization

**Latest Test Run**: 2025-01-05 - Monitoring workflow execution with all fixes ✅
