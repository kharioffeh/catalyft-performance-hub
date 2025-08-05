# Catalyft Mobile App - E2E Testing Guide

This guide covers how to set up and run end-to-end tests for the Catalyft mobile app using Detox.

## 📋 Prerequisites

### iOS Testing
- macOS with Xcode installed
- iOS Simulator (iPhone 14 recommended)
- Node.js 16+ and npm/yarn
- Expo CLI

### Android Testing  
- Android Studio with SDK
- Android Emulator (Pixel 7 API 34 recommended)
- Node.js 16+ and npm/yarn
- Expo CLI

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd mobile
npm install
```

### 2. iOS Setup

First, build the iOS app for testing:

```bash
# Build the app for iOS simulator
npm run detox:build:ios
```

Then run the tests:

```bash
# Run E2E tests on iOS simulator
npm run detox:test:ios
```

### 3. Android Setup

Build the Android app for testing:

```bash
# Build the app for Android emulator
npm run detox:build:android
```

Then run the tests:

```bash
# Run E2E tests on Android emulator
npm run detox:test:android
```

## 📱 Test Configurations

The following Detox configurations are available:

- `ios.sim.debug` - iOS Simulator Debug build
- `ios.sim.release` - iOS Simulator Release build  
- `android.emu.debug` - Android Emulator Debug build
- `android.emu.release` - Android Emulator Release build
- `android.att.debug` - Android Attached Device Debug
- `android.att.release` - Android Attached Device Release

### Custom Configuration Commands

```bash
# Run specific configuration
detox test --configuration ios.sim.debug

# Run with custom options
detox test --configuration android.emu.debug --loglevel verbose

# Run specific test file
detox test --configuration ios.sim.debug e2e/flows.e2e.ts

# Run tests with cleanup
detox test --configuration ios.sim.debug --cleanup
```

## 🧪 Test Structure

### Main Test Suite: `e2e/flows.e2e.ts`

This comprehensive test suite covers all major app flows:

#### 🔐 Authentication & Onboarding
- **Web sign-up → magic-link deep-link → mobile landing logged-in**
  - Simulates user signing up on web and opening mobile app via magic link
  - Tests deep link handling and authentication state transfer
  
- **Web Stripe checkout webhook stub → mobile premium flag check**
  - Verifies premium features are unlocked after successful payment
  - Tests subscription status synchronization

#### 📊 Dashboard & Metrics
- **Dashboard loads demo metrics from Supabase**
  - Tests health metrics display (strain, recovery, sleep, HRV)
  - Verifies data loading and refresh functionality
  - Tests metric card interactions

#### 🏋️ Lift Logger CRUD Operations
- **Create/Edit/Delete cycle for lift entries**
  - Tests adding new exercise entries
  - Tests modifying existing entries
  - Tests deleting entries with confirmation
  - Verifies data persistence

#### 📅 Calendar & Sessions
- **Schedule → start → finish session flow**
  - Tests workout session scheduling
  - Tests live session tracking
  - Tests session completion and summary
  - Verifies calendar integration

#### 📈 Analytics & Charts
- **Tonnage + heatmap charts render**
  - Tests chart loading and display
  - Tests chart interactions and tooltips
  - Tests period switching (7d, 30d, 90d)
  - Tests muscle group heatmap interactions

#### 🥗 Nutrition Scanner
- **Mock barcode photo → macro parsing**
  - Tests barcode scanning simulation
  - Tests product recognition and macro parsing
  - Tests adding scanned items to food log
  - Verifies macro calculations update

#### 🤖 ARIA Chat & Program Builder
- **Chat prompt → program builder response**
  - Tests AI chat interface
  - Tests program generation from prompts
  - Tests accepting and saving generated programs
  - Verifies program appears in training library

#### 📡 Offline Mode & Sync
- **Offline toggle → action queue → replay on reconnect**
  - Tests offline mode activation
  - Tests action queuing while offline
  - Tests sync replay when reconnecting
  - Verifies data consistency

### Test Helpers: `e2e/helpers.ts`

Utility functions for common test operations:

```typescript
import { E2EHelpers } from './helpers';

// Navigate to tab and verify
await E2EHelpers.navigateToTab('Training');

// Fill lift entry form
await E2EHelpers.fillLiftEntry('Bench Press', '185', '8', '3');

// Simulate barcode scanning
await E2EHelpers.performBarcodeScanning();

// Send ARIA chat message
await E2EHelpers.sendARIAChatMessage('Create a strength program');

// Toggle offline mode
await E2EHelpers.toggleOfflineMode(true);
```

## 🎯 Test IDs Reference

All interactive elements have `testID` props for reliable testing:

### Navigation
- `tab-Dashboard` - Dashboard tab
- `tab-Analytics` - Analytics tab  
- `tab-Training` - Training tab
- `tab-Nutrition` - Nutrition tab
- `tab-Settings` - Settings tab

### Dashboard
- `dashboard-container` - Main dashboard container
- `dashboard-welcome-text` - Welcome message
- `user-profile-avatar` - Profile avatar button
- `health-metrics-container` - Metrics grid
- `strain-metric-card` - Strain metric card
- `recovery-metric-card` - Recovery metric card
- `sleep-metric-card` - Sleep metric card
- `hrv-metric-card` - HRV metric card

### Training
- `training-container` - Main training container
- `lift-create-button` - Create lift entry button
- `aria-chat-button` - ARIA chat button
- `calendar-view-button` - Calendar view button
- `start-workout-button` - Start workout button

### Analytics
- `analytics-container` - Main analytics container
- `analytics-charts-container` - Charts container
- `tonnage-chart` - Tonnage chart
- `analytics-period-7d` - 7-day period selector
- `analytics-period-30d` - 30-day period selector
- `analytics-period-90d` - 90-day period selector

### Nutrition
- `nutrition-container` - Main nutrition container
- `barcode-scanner-button` - Barcode scanner button
- `quick-add-meal` - Quick add meal button

### Settings
- `settings-container` - Main settings container
- `offline-toggle` - Offline mode toggle
- `{settingId}-setting` - Individual setting items
- `{settingId}-toggle` - Setting toggle switches

## 🛠️ Troubleshooting

### Common Issues

#### iOS Simulator Not Found
```bash
# List available simulators
xcrun simctl list devices available

# Boot specific simulator
xcrun simctl boot "iPhone 14"
```

#### Android Emulator Issues
```bash
# List available AVDs
emulator -list-avds

# Start emulator
emulator -avd Pixel_7_API_34
```

#### Build Failures
```bash
# Clean and rebuild
cd ios && xcodebuild clean && cd ..
npm run detox:build:ios

# For Android
cd android && ./gradlew clean && cd ..
npm run detox:build:android
```

#### Test Failures
```bash
# Run with verbose logging
detox test --configuration ios.sim.debug --loglevel verbose

# Take screenshots on failure
detox test --configuration ios.sim.debug --take-screenshots failing
```

### Debug Mode

Enable debug mode for detailed test execution logs:

```bash
# Set debug environment
export DEBUG=detox:*

# Run tests with debug output
detox test --configuration ios.sim.debug
```

### Performance Tips

1. **Use Release Builds for Final Testing**
   ```bash
   detox test --configuration ios.sim.release
   ```

2. **Parallel Test Execution**
   ```bash
   detox test --configuration ios.sim.debug --workers 2
   ```

3. **Test Specific Flows**
   ```bash
   detox test --configuration ios.sim.debug --grep "Dashboard"
   ```

## 📝 Writing New Tests

### Test Structure Template

```typescript
describe('New Feature Flow', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should test specific functionality', async () => {
    // 1. Setup/Navigation
    await E2EHelpers.navigateToTab('Training');
    
    // 2. Action
    await element(by.id('new-feature-button')).tap();
    
    // 3. Verification
    await expect(element(by.id('expected-result'))).toBeVisible();
  });
});
```

### Adding Test IDs

When adding new components, include `testID` props:

```tsx
<TouchableOpacity 
  testID="my-button"
  onPress={handlePress}
>
  <Text>My Button</Text>
</TouchableOpacity>
```

### Test ID Naming Convention

- Use kebab-case: `my-button-name`
- Be descriptive: `lift-create-button` vs `button1`
- Include context: `analytics-period-7d` vs `7d`
- Use consistent patterns: `{screen}-container`, `{feature}-button`

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  e2e-ios:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd mobile
          npm install
      
      - name: Build iOS app
        run: |
          cd mobile
          npm run detox:build:ios
      
      - name: Run E2E tests
        run: |
          cd mobile
          npm run detox:test:ios
      
      - name: Upload test artifacts
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: e2e-test-artifacts
          path: mobile/artifacts/
```

## 📞 Support

For E2E testing issues:

1. Check the [Detox documentation](https://wix.github.io/Detox/)
2. Review test logs in `mobile/artifacts/`
3. Take screenshots during test failures
4. Check device/simulator logs

## 🔗 Related Documentation

- [DETOX_SETUP.md](mobile/DETOX_SETUP.md) - Detailed setup guide
- [E2E_SETUP_COMPLETE.md](mobile/E2E_SETUP_COMPLETE.md) - Implementation summary
- [Detox Configuration Reference](https://wix.github.io/Detox/docs/config/overview)

---

**Happy Testing! 🧪✨**