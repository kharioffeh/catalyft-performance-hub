# 🧪 End-to-End (E2E) Testing Guide

This guide covers the comprehensive E2E testing setup for the Catalyft Performance Hub mobile application using Detox.

## 🎯 Current Status

✅ **Setup Complete**: All E2E test files, configurations, and GitHub Actions are in place  
✅ **Validation Passing**: `npm run detox:validate` confirms proper setup  
✅ **iOS Ready**: iOS testing workflow configured with macOS runners  
✅ **Android Improved**: Latest fixes for META-INF duplicate file issues  
🔄 **In Progress**: Cloud-based testing via GitHub Actions

## 🚀 Quick Start

### Local Validation
```bash
cd mobile
npm run detox:validate
```

### GitHub Actions (Recommended for Windows users)
The E2E tests automatically run on:
- Push to `main` or `develop` branches
- Pull requests to `main`
- Manual workflow dispatch

## 📁 Test Structure

### Core E2E Flows
Our E2E test suite covers these critical user journeys:

1. **Authentication & Onboarding**
   - Web sign-up → magic-link deep-link → mobile landing logged-in
   - Web Stripe checkout webhook stub → mobile premium flag check

2. **Dashboard & Health Metrics**
   - Dashboard loads demo metrics from Supabase
   - Health metrics display (Strain, Recovery, Sleep, HRV)

3. **Training Workflows**
   - Lift logger create / edit / delete cycle
   - Calendar schedule → start → finish session

4. **Analytics & Visualization**
   - Analytics screen: tonnage + heatmap charts render
   - Performance metrics visualization

5. **Nutrition Tracking**
   - Nutrition scanner: mock barcode photo → macro parsing

6. **AI Integration**
   - ARIA chat prompt → program builder response visible

7. **Offline Functionality**
   - Offline mode toggle → action queue replay on reconnect

### File Structure
```
mobile/
├── e2e/
│   ├── flows.e2e.ts          # Main test suite
│   ├── helpers.ts            # Test helper functions
│   ├── jest.config.js        # Jest configuration
│   ├── setup.js              # Test setup
│   └── init.js               # Detox initialization
├── .detoxrc.js               # Detox configuration
└── scripts/
    └── validate-e2e-setup.js # Setup validation
```

## 🔧 Configuration

### GitHub Actions Workflow
- **iOS**: Tests run on `macos-13` with iPhone simulators
- **Android**: Tests run on `ubuntu-latest` with Android emulators
- **Timeout**: 60 minutes per platform
- **Artifacts**: Test screenshots and logs uploaded on failure

### Latest Improvements (January 2025)
- ✅ Fixed META-INF/LICENSE.md duplicate file issues in Android builds
- ✅ Simplified Android build process (main APK only)
- ✅ Improved error handling and logging
- ✅ Better emulator stability and package management
- ✅ Updated to use `gradle.properties` for packaging options

## 🎮 Test Commands

```bash
# Validate setup
npm run detox:validate

# iOS Testing
npm run detox:build:ios
npm run detox:test:ios

# Android Testing  
npm run detox:build:android
npm run detox:test:android

# Legacy commands (also available)
npm run test:e2e              # iOS default
npm run test:e2e:android      # Android
```

## 🆔 Test IDs Reference

All interactive elements have `testID` props for reliable testing:

### Navigation
- `tab-Dashboard`, `tab-Training`, `tab-Analytics`, `tab-Nutrition`

### Dashboard Screen
- `dashboard-container`, `dashboard-welcome-text`, `user-profile-avatar`
- `health-metrics-container`, `strain-metric-card`, `recovery-metric-card`
- `sleep-metric-card`, `hrv-metric-card`

### Training Screen
- `training-container`, `lift-create-button`, `calendar-view-button`
- `start-workout-button`, `aria-chat-button`

### Analytics Screen
- `analytics-container`, `tonnage-chart`, `analytics-charts-container`
- `analytics-period-week`, `analytics-period-month`, `analytics-period-year`

### Nutrition Screen
- `nutrition-container`, `barcode-scanner-button`, `quick-add-meal`

### Settings Screen
- `settings-container`, `offline-setting`, `{item.id}-toggle`

## 🛠️ Troubleshooting

### Common Issues

#### Android Build Errors
**Issue**: `META-INF/LICENSE.md` duplicate files  
**Solution**: Latest workflow uses `gradle.properties` approach (now fixed)

#### iOS Simulator Issues
**Issue**: `applesimutils: command not found`  
**Solution**: Workflow automatically installs via Homebrew

#### Jest/TypeScript Errors
**Issue**: Cannot parse `.e2e.ts` files  
**Solution**: Configured with `ts-jest` preset (now working)

### GitHub Actions Debugging
Check the workflow logs for:
1. **Setup validation**: `npm run detox:validate` output
2. **Build logs**: iOS/Android build process details
3. **Test execution**: Detox test runner output
4. **Artifacts**: Screenshots and logs for failed tests

### Manual Debugging Commands
```bash
# Check Detox installation
cd mobile && npx detox doctor

# Validate configuration
npm run detox:validate

# Check test file syntax
npx tsc --noEmit e2e/flows.e2e.ts

# List available simulators (iOS)
xcrun simctl list devices available

# Check Android emulator (if running locally)
adb devices
```

## 📊 GitHub Actions Status

The E2E tests run automatically and provide:
- ✅ **iOS Test Results**: macOS runner with iPhone simulators
- ✅ **Android Test Results**: Ubuntu runner with Android emulators  
- 📋 **Test Summary**: Combined results with pass/fail status
- 📎 **Artifacts**: Screenshots and logs for debugging failures

## 🔄 Recent Updates

**Latest Changes (January 2025):**
- Improved Android build reliability
- Fixed META-INF duplicate file conflicts
- Enhanced error handling and logging
- Simplified build process for better stability
- Updated documentation with current status

## 🎯 Next Steps

1. **Monitor GitHub Actions**: Check workflow runs for both iOS and Android
2. **Iterate on Failures**: Address any remaining platform-specific issues
3. **Expand Tests**: Add more specific test scenarios as needed
4. **Performance**: Optimize test execution time
5. **Device Coverage**: Consider additional device/OS combinations

## 💡 For Windows Users

Since you're on a Windows PC with an iPhone:
- **iOS Testing**: Use GitHub Actions (macOS runners required)
- **Android Testing**: Use GitHub Actions (easier) or set up local Android emulator
- **Recommended**: Rely on cloud-based GitHub Actions for both platforms

The current setup provides comprehensive E2E testing without requiring local iOS development tools on Windows!

---

*For questions or issues, check the GitHub Actions workflow logs or the troubleshooting section above.*
