# E2E Testing Guide for Catalyft Performance Hub

This guide provides comprehensive instructions for setting up and running end-to-end (E2E) tests for the Catalyft Performance Hub mobile application using Detox.

## 📋 Prerequisites

### For iOS Testing
- macOS machine (for local testing)
- Xcode with iOS Simulator
- Node.js 18+
- iOS Simulator (iPhone 14 or iPhone 15)

### For Android Testing  
- Android SDK with API level 32-34
- Android Emulator or Physical Device
- Java 17+
- Node.js 18+

### GitHub Actions (Cloud Testing)
- Repository with GitHub Actions enabled
- No additional setup required - everything runs in the cloud!

## 🚀 Quick Start

### GitHub Actions (Recommended)
The easiest way to run E2E tests is through GitHub Actions, which automatically tests both iOS and Android:

1. **Push to main branch or create a pull request** - tests run automatically
2. **Manual trigger**: Go to Actions tab → E2E Tests → Run workflow
3. **View results**: Check the workflow status for detailed logs

### Local Testing (Advanced)

```bash
# Navigate to mobile directory
cd mobile

# Install dependencies
npm install --legacy-peer-deps

# Validate E2E setup
npm run detox:validate

# iOS Testing
npm run detox:build:ios
npm run detox:test:ios

# Android Testing  
npm run detox:build:android
npm run detox:test:android
```

## 🔧 Test Configuration

### Detox Configuration (`.detoxrc.js`)
The configuration supports multiple environments:
- `ios.sim.debug` - iOS Simulator Debug
- `android.emu.debug` - Android Emulator Debug
- `android.att.debug` - Android Attached Device Debug

### Jest Configuration (`e2e/jest.config.js`)
- TypeScript support with `ts-jest`
- 120-second test timeout
- Single worker for deterministic testing
- Comprehensive transform patterns for React Native

## 📱 Test Structure

### Main Test Suite (`e2e/flows.e2e.ts`)
Comprehensive E2E tests covering:

1. **Authentication & Onboarding**
   - Magic link deep-linking
   - Premium flag verification
   
2. **Dashboard & Metrics**
   - Demo data loading from Supabase
   - Health metrics display
   
3. **Training Features**
   - Lift logger CRUD operations
   - Calendar scheduling
   - Session management
   
4. **Analytics**
   - Tonnage charts
   - Heatmap visualization
   
5. **Nutrition**
   - Barcode scanning simulation
   - Macro parsing
   
6. **AI Features**
   - ARIA chat interactions
   - Program builder responses
   
7. **Offline Mode**
   - Action queue management
   - Sync on reconnect

### Test Helpers (`e2e/helpers.ts`)
Reusable helper functions for common operations:
- Navigation utilities
- Form interactions
- Authentication flows
- Data verification

## 🏷️ Test IDs Reference

Components are tagged with `testID` props for reliable element selection:

### Dashboard Screen
- `dashboard-container` - Main container
- `dashboard-welcome-text` - Welcome message
- `user-profile-avatar` - Profile avatar
- `health-metrics-container` - Metrics container
- `strain-metric-card` - Strain metric
- `recovery-metric-card` - Recovery metric

### Training Screen
- `training-container` - Main container
- `lift-create-button` - Create lift entry
- `calendar-view-button` - Calendar access
- `start-workout-button` - Start session
- `aria-chat-button` - AI chat

### Analytics Screen
- `analytics-container` - Main container
- `tonnage-chart` - Tonnage visualization
- `analytics-period-week` - Week selector

### Settings Screen
- `settings-container` - Main container
- `offline-setting` - Offline mode toggle

## 🔍 Troubleshooting

### Recent Fixes (January 2025)

#### ✅ Fixed: TypeScript Configuration Error
**Error**: `TS5023: Unknown compiler option 'compilerOptions'`  
**Solution**: Flattened Jest `ts-jest` configuration to remove nested `compilerOptions`

#### ✅ Fixed: Android Build Conflicts  
**Error**: `6 files found with path 'META-INF/LICENSE.md'`  
**Solution**: Added packaging options to handle duplicate files in `build.gradle`

#### ✅ Fixed: Android Emulator Libraries
**Error**: `libpulse.so.0: cannot open shared object file`  
**Solution**: Install required libraries (`libpulse0`, `libnss3`, `libnspr4`, `libxss1`, `libasound2t64`)

#### ✅ Fixed: Dynamic Android API Support
**Issue**: Hard-coded API levels causing failures  
**Solution**: Dynamic detection and fallback for API levels 32-34

### Common Issues

#### Simulator/Emulator Not Starting
```bash
# iOS - Reset simulator
xcrun simctl shutdown all
xcrun simctl erase all

# Android - Recreate emulator
avdmanager delete avd -n test_emulator
avdmanager create avd -n test_emulator -k "system-images;android-33;google_apis;x86_64"
```

#### Build Failures
```bash
# Clean builds
cd mobile
rm -rf node_modules ios android
npm install --legacy-peer-deps
npx expo prebuild --clean
```

#### Test Timeouts
- Increase timeout in `jest.config.js`
- Check device performance
- Verify app is properly built

## 🚀 CI/CD Integration

### GitHub Actions
The repository includes a comprehensive GitHub Actions workflow (`.github/workflows/e2e-tests.yml`) that:

- **iOS Testing**: Runs on macOS runners with Xcode
- **Android Testing**: Runs on Ubuntu with Android SDK
- **Parallel Execution**: Tests both platforms simultaneously  
- **Artifact Collection**: Saves screenshots and logs on failure
- **Result Summary**: Provides clear pass/fail status

### Workflow Triggers
- Push to `main` or `develop` branches
- Pull requests to `main`
- Manual workflow dispatch

## 📝 Writing New Tests

### 1. Add Test ID to Component
```tsx
<TouchableOpacity testID="my-new-button" onPress={handlePress}>
  <Text>My Button</Text>
</TouchableOpacity>
```

### 2. Create Test Helper (if needed)
```typescript
// e2e/helpers.ts
static async performNewAction() {
  await element(by.id('my-new-button')).tap();
  await this.waitForElement('result-container');
}
```

### 3. Add Test Case
```typescript
// e2e/flows.e2e.ts
it('should perform new action successfully', async () => {
  await E2EHelpers.navigateToTab('MyTab');
  await E2EHelpers.performNewAction();
  await expect(element(by.id('success-message'))).toBeVisible();
});
```

## 📊 Test Reporting

### Artifacts
- Screenshots saved to `mobile/artifacts/`
- Test logs available in GitHub Actions
- Video recordings (when configured)

### Metrics
- Test execution time
- Pass/fail rates
- Device performance data

## 🔄 Continuous Improvement

### Current Status
- ✅ Core authentication flows
- ✅ Navigation testing
- ✅ Basic CRUD operations
- ✅ Cross-platform compatibility
- 🔄 Advanced gesture testing
- 🔄 Performance benchmarks
- 🔄 Visual regression testing

### Upcoming Features
- Integration with performance monitoring
- Automated accessibility testing
- Cross-browser web testing
- Load testing scenarios

---

## 📞 Support

For issues with E2E testing:
1. Check the troubleshooting section above
2. Review GitHub Actions logs for detailed error messages  
3. Validate setup with `npm run detox:validate`
4. Ensure all prerequisites are installed

**Happy Testing!** 🧪

<!-- Trigger comprehensive E2E test run with all fixes - Wed Jan  8 11:45:00 UTC 2025 -->
