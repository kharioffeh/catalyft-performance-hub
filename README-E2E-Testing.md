# Catalyft Mobile App - E2E Testing Setup

This README provides comprehensive documentation for setting up and running End-to-End (E2E) tests for the Catalyft mobile application using Detox.

## Quick Start

```bash
# Navigate to mobile directory
cd mobile

# Install dependencies
npm install

# Validate E2E setup
npm run detox:validate

# Build and test (iOS)
npm run detox:build:ios
npm run detox:test:ios

# Build and test (Android)
npm run detox:build:android
npm run detox:test:android
```

## Prerequisites

### iOS Testing
- macOS machine
- Xcode installed
- iOS Simulator
- Node.js 18+

### Android Testing
- Android Studio
- Android SDK
- Android Emulator or physical device
- Node.js 18+

## Installation

1. **Install global dependencies:**
   ```bash
   npm install -g @expo/cli detox-cli
   ```

2. **Install project dependencies:**
   ```bash
   cd mobile
   npm install
   ```

3. **iOS-specific setup:**
   ```bash
   # Install applesimutils (required by Detox on iOS)
   brew tap wix/brew
   brew install applesimutils
   ```

4. **Android-specific setup:**
   ```bash
   # Ensure Android SDK is installed and ANDROID_HOME is set
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

## Test Configuration

### Detox Configuration (`.detoxrc.js`)

The project includes separate configurations for:
- `ios.sim.debug` - iOS Simulator debug builds
- `android.emu.debug` - Android Emulator debug builds

### Jest Configuration (`e2e/jest.config.js`)

- TypeScript support with `ts-jest`
- 120-second test timeout
- Single worker for stability
- Proper module resolution

## Test Structure

### Test Files
- `e2e/basic.e2e.ts` - Simple app launch tests
- `e2e/flows.e2e.ts.comprehensive` - Comprehensive user flow tests
- `e2e/helpers.ts` - Test helper functions
- `e2e/setup.js` - Jest setup configuration

### Test Categories

1. **Basic Tests** - App launch and basic functionality
2. **Authentication Flow** - Magic link, login/logout
3. **Dashboard** - Metrics loading, user interface
4. **Training** - Lift logging, calendar, sessions
5. **Analytics** - Charts, data visualization
6. **Nutrition** - Barcode scanning, meal tracking
7. **Offline Mode** - Queue management, sync

## Test IDs Reference

### Navigation
- `tab-Dashboard`, `tab-Training`, `tab-Analytics`, `tab-Nutrition`, `tab-Settings`

### Dashboard
- `dashboard-container`, `dashboard-welcome-text`, `user-profile-avatar`
- `health-metrics-container`, `strain-metric-card`, `recovery-metric-card`

### Training
- `training-container`, `lift-create-button`, `calendar-view-button`
- `start-workout-button`, `aria-chat-button`

### Analytics
- `analytics-container`, `tonnage-chart`, `analytics-charts-container`
- `analytics-period-week`, `analytics-period-month`

### Nutrition
- `nutrition-container`, `barcode-scanner-button`, `quick-add-meal`

### Settings
- `settings-container`, `offline-setting`, `offline-toggle`

## Running Tests

### Local Development

```bash
# iOS
npm run detox:build:ios
npm run detox:test:ios

# Android
npm run detox:build:android
npm run detox:test:android

# Validate setup
npm run detox:validate
```

### Debug Mode

```bash
# Run with verbose output
npx detox test --configuration ios.sim.debug --loglevel verbose

# Run specific test file
npx detox test --configuration ios.sim.debug e2e/basic.e2e.ts

# Keep simulator open after tests
npx detox test --configuration ios.sim.debug --cleanup false
```

## CI/CD Integration

### GitHub Actions

The project includes `.github/workflows/e2e-tests.yml` with:
- **iOS Job**: macOS runner with iOS Simulator
- **Android Job**: Ubuntu runner with Android Emulator
- Automatic dependency caching
- Build artifact preservation
- Test result reporting

### Workflow Triggers
- Push to `main` or `develop` branches
- Pull requests to `main`
- Manual workflow dispatch

## Troubleshooting

### Common Issues

1. **"App binary not found"**
   ```bash
   # Rebuild the app
   npm run detox:build:ios
   # or
   npm run detox:build:android
   ```

2. **"Device not found"**
   ```bash
   # iOS: Check available simulators
   xcrun simctl list devices available
   
   # Android: Check running emulators
   adb devices
   ```

3. **"Tests timing out"**
   - Increase timeout in Jest config
   - Check element testIDs exist
   - Verify app is properly built

4. **"Metro bundler issues"**
   ```bash
   # Reset Metro cache
   npx react-native start --reset-cache
   ```

### iOS-Specific Issues

1. **Simulator not booting**
   ```bash
   # Reset simulator
   xcrun simctl erase all
   xcrun simctl boot "iPhone 15"
   ```

2. **Missing applesimutils**
   ```bash
   brew tap wix/brew
   brew install applesimutils
   ```

### Android-Specific Issues

1. **Emulator not starting**
   ```bash
   # List available AVDs
   emulator -list-avds
   
   # Start specific emulator
   emulator -avd Pixel_4_API_30
   ```

2. **Build failures**
   ```bash
   # Clean build
   cd android
   ./gradlew clean
   cd ..
   ```

## Writing New Tests

### Basic Test Structure

```typescript
import { device, element, by, expect } from 'detox';

describe('Feature Name', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should perform specific action', async () => {
    await element(by.id('button-testid')).tap();
    await expect(element(by.id('result-testid'))).toBeVisible();
  });
});
```

### Using Test Helpers

```typescript
import { E2EHelpers } from './helpers';

// Navigate to tab
await E2EHelpers.navigateToTab('Training');

// Wait for element
await E2EHelpers.waitForElement('training-container');

// Fill lift entry
await E2EHelpers.fillLiftEntry('Bench Press', '135', '10');
```

### Best Practices

1. **Use meaningful testIDs** - Clear, descriptive identifiers
2. **Wait for elements** - Use `waitFor()` for dynamic content
3. **Isolate tests** - Each test should be independent
4. **Clean state** - Reset app state between tests
5. **Mock external dependencies** - API calls, deep links

## Performance Tips

1. **Use single worker** - `maxWorkers: 1` in Jest config
2. **Reload vs relaunch** - Use `reloadReactNative()` for faster setup
3. **Element caching** - Store frequently used elements
4. **Timeout optimization** - Set appropriate timeouts per test

## Advanced Configuration

### Custom Detox Configuration

```javascript
// .detoxrc.js
module.exports = {
  testRunner: {
    args: {
      '$0': 'jest',
      config: 'e2e/jest.config.js'
    }
  },
  apps: {
    'ios.debug': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/YourApp.app',
      build: 'xcodebuild -workspace ios/YourApp.xcworkspace -scheme YourApp -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build'
    }
  }
};
```

### Environment Variables

```bash
# Set in CI/CD or local environment
export DETOX_CONFIGURATION=ios.sim.debug
export DETOX_LOGLEVEL=verbose
export DETOX_CLEANUP=false
```

## Resources

- [Detox Documentation](https://wix.github.io/Detox/)
- [React Native Testing Guide](https://reactnative.dev/docs/testing-overview)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

---

**Note**: This setup supports both local development and CI/CD environments. For Windows users developing iOS apps, use the GitHub Actions workflow for iOS testing while running Android tests locally.

<!-- Trigger workflow run: 2025-01-22 -->
