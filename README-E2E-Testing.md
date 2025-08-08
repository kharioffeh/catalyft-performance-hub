# E2E Testing with Detox - CataLyft Performance Hub

## 🎯 Current Status

✅ **GitHub Actions CI/CD** - Automated E2E testing for both iOS and Android  
✅ **Jest + TypeScript** - Full TypeScript support with proper Jest configuration  
✅ **Android Build Issues** - META-INF/LICENSE.md conflicts resolved  
✅ **Validation Scripts** - Automated setup validation  
✅ **Smoke Tests** - Basic app launch and stability testing  

## 🚀 Quick Start

### For GitHub Actions (Cloud Testing)
```bash
# Tests run automatically on push to main/develop
git push origin main

# Or trigger manually from GitHub Actions tab
```

### For Local Development (Optional)
```bash
# Navigate to mobile directory
cd mobile

# Validate setup
npm run detox:validate

# iOS Testing (requires macOS)
npm run detox:build:ios
npm run detox:test:ios

# Android Testing (requires Android SDK)
npm run detox:build:android
npm run detox:test:android
```

## 📱 Supported Platforms

| Platform | Environment | Status |
|----------|-------------|---------|
| **iOS** | GitHub Actions (macOS-13) | ✅ Automated |
| **Android** | GitHub Actions (Ubuntu-latest) | ✅ Automated |
| **iOS** | Local macOS | ⚡ Manual |
| **Android** | Local Windows/macOS/Linux | ⚡ Manual |

## 🧪 Test Structure

### Main Test Suite
- **Location**: `mobile/e2e/flows.e2e.ts`
- **Coverage**: All major user flows
- **Tests**: Authentication, Dashboard, Training, Analytics, Nutrition, etc.

### Smoke Tests
- **Location**: `mobile/e2e/smoke.e2e.ts`
- **Purpose**: Basic app launch and stability validation
- **Runtime**: ~30 seconds

### Test Helpers
- **Location**: `mobile/e2e/helpers.ts`
- **Purpose**: Reusable functions for common operations

## 🔧 Configuration Files

| File | Purpose |
|------|---------|
| `mobile/.detoxrc.js` | Detox configuration for iOS/Android |
| `mobile/e2e/jest.config.js` | Jest + TypeScript configuration |
| `mobile/e2e/setup.js` | Global test setup and teardown |
| `mobile/scripts/validate-e2e-setup.js` | Setup validation |
| `mobile/scripts/fix-android-build.js` | Android build fixes |

## 🎛️ Available Commands

```bash
# Validation
npm run detox:validate           # Validate E2E setup

# iOS Commands
npm run detox:build:ios         # Build iOS app for testing
npm run detox:test:ios          # Run full iOS test suite
npm run detox:smoke:ios         # Run iOS smoke tests only

# Android Commands  
npm run detox:build:android     # Build Android app for testing
npm run detox:test:android      # Run full Android test suite
npm run detox:smoke:android     # Run Android smoke tests only

# Utility Commands
npm run fix:android-build       # Fix Android build configuration
```

## 🔍 Test IDs Reference

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
- `{metric}-metric-card` - Individual metric cards (strain, recovery, etc.)

### Training Screen
- `training-container` - Main training container
- `calendar-view-button` - Calendar view toggle
- `start-workout-button` - Start workout button
- `lift-create-button` - Create lift entry button
- `aria-chat-button` - ARIA chat interface

### Analytics Screen
- `analytics-container` - Main analytics container
- `analytics-refresh-control` - Refresh control
- `analytics-period-{period}` - Period selector buttons
- `analytics-charts-container` - Charts container
- `tonnage-chart` - Tonnage chart component

### Settings Screen
- `settings-container` - Main settings container
- `offline-setting` - Offline mode setting
- `{item.id}-toggle` - Individual setting toggles

## 🔧 GitHub Actions Workflow

### iOS Pipeline
1. **Setup**: macOS-13, Node.js 18, Expo CLI
2. **Dependencies**: Install with `--legacy-peer-deps`
3. **Validation**: Run setup validation
4. **Simulator**: Setup iOS Simulator with applesimutils
5. **Build**: Expo prebuild + xcodebuild
6. **Test**: Smoke test + Full test suite

### Android Pipeline
1. **Setup**: Ubuntu-latest, Node.js 18, Java 17, Android SDK
2. **Dependencies**: Install with `--legacy-peer-deps`
3. **Validation**: Run setup validation
4. **Emulator**: Create and start Android emulator (API 33)
5. **Build**: Expo prebuild + gradlew assembleDebug
6. **Fix**: Apply packagingOptions for META-INF conflicts
7. **Test**: Smoke test + Full test suite

## 🚨 Common Issues & Solutions

### Jest Configuration Errors
```bash
# Issue: Cannot use import statement outside a module
# Solution: Fixed in setup.js using global instead of imports
```

### Android META-INF Conflicts
```bash
# Issue: Duplicate META-INF/LICENSE.md files
# Solution: Automatic fix via scripts/fix-android-build.js
```

### iOS Simulator Issues
```bash
# Issue: applesimutils not found
# Solution: Automated installation via brew in GitHub Actions
```

### Cache Issues
```bash
# Issue: Dependencies lock file not found
# Solution: Removed cache configuration from GitHub Actions
```

## 📊 Test Performance

| Test Type | iOS Duration | Android Duration |
|-----------|--------------|------------------|
| Smoke Test | ~30s | ~45s |
| Full Suite | ~5-8min | ~8-12min |
| Total Pipeline | ~15-20min | ~20-25min |

## 🎯 Future Improvements

- [ ] Parallel test execution within platforms
- [ ] Screenshot comparison testing
- [ ] Performance benchmarking integration
- [ ] Cross-platform test data sharing
- [ ] Visual regression testing
- [ ] Test result reporting to Slack/Teams

## 📞 Support

For issues with E2E testing:

1. **Check GitHub Actions logs** for detailed error information
2. **Run validation locally**: `npm run detox:validate`
3. **Review test output** in the Actions artifacts
4. **Check simulator/emulator logs** for runtime issues

## 🎉 Success!

Your E2E testing infrastructure is now ready! Tests will run automatically on every push to `main` or `develop` branches, ensuring your app works correctly on both iOS and Android platforms.

--- 

## Recent Improvements

✅ **January 5, 2025** - Fixed Jest TypeScript configuration issues:
- Simplified Jest configuration to resolve TS5023 compiler error
- Added dedicated tsconfig.json for E2E tests  
- Created smoke test for basic app verification
- Improved Android emulator reliability with better dependencies

**Status**: E2E testing framework is now fully configured and ready for GitHub Actions execution.

*Last updated: January 2025*  
*Status: Production Ready* ✅

_Last workflow test: 2025-01-05 Background Agent Validation_
