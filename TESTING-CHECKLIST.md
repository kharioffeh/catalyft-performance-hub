# 🧪 E2E Testing Execution Checklist

Follow this step-by-step checklist to execute the Catalyft app E2E tests.

## 📋 Pre-Testing Setup

### 1. System Requirements Check
- [ ] **macOS** (for iOS testing) or **Windows/Linux** (for Android only)
- [ ] **Node.js 16+** installed (`node --version`)
- [ ] **Expo CLI** installed (`npm install -g @expo/cli`)
- [ ] **iOS Simulator** (Xcode) or **Android Emulator** running

### 2. Project Setup
```bash
# Navigate to mobile directory
cd mobile

# Install dependencies
npm install

# Validate E2E setup
npm run detox:validate
```

**Expected Output:** ✅ All checks passed! E2E setup is ready.

## 🍎 iOS Testing

### Step 1: Prepare iOS Simulator
```bash
# List available simulators
xcrun simctl list devices available

# Boot iPhone 14 (or your preferred simulator)
xcrun simctl boot "iPhone 14"
```

### Step 2: Build iOS App
```bash
# Build the app for testing
npm run detox:build:ios
```

**Expected:** App builds successfully without errors. Look for:
- ✅ Build succeeded
- ✅ `.app` file created in `ios/build/Build/Products/`

### Step 3: Run E2E Tests
```bash
# Run the full test suite
npm run detox:test:ios
```

**Expected Test Results:**
```
✅ Authentication & Onboarding Flow
  ✅ should handle web sign-up → magic-link deep-link → mobile landing logged-in
  ✅ should verify premium flag check after Stripe webhook

✅ Dashboard & Metrics Flow  
  ✅ should load dashboard with demo metrics from Supabase

✅ Lift Logger CRUD Flow
  ✅ should complete create/edit/delete cycle for lift entries

✅ Calendar Session Flow
  ✅ should schedule → start → finish workout session

✅ Analytics Charts Flow
  ✅ should render tonnage and heatmap charts

✅ Nutrition Scanner Flow  
  ✅ should mock barcode photo → macro parsing

✅ ARIA Chat & Program Builder Flow
  ✅ should send chat prompt → receive program builder response

✅ Offline Mode & Sync Flow
  ✅ should toggle offline → queue actions → replay on reconnect

✅ Cross-Screen Integration Flow
  ✅ should test complete user journey across all major features
```

## 🤖 Android Testing

### Step 1: Prepare Android Emulator
```bash
# List available AVDs
emulator -list-avds

# Start Pixel 7 emulator (or your preferred AVD)
emulator -avd Pixel_7_API_34
```

### Step 2: Build Android App
```bash
# Build the app for testing
npm run detox:build:android
```

**Expected:** App builds successfully. Look for:
- ✅ Build succeeded
- ✅ `.apk` file created in `android/app/build/outputs/apk/`

### Step 3: Run E2E Tests
```bash
# Run the full test suite
npm run detox:test:android
```

## 🛠️ Troubleshooting Common Issues

### Build Failures

#### iOS Build Issues
```bash
# Clean iOS build
cd ios && xcodebuild clean && cd ..

# Reset Metro cache
npx expo start --clear

# Rebuild
npm run detox:build:ios
```

#### Android Build Issues
```bash
# Clean Android build
cd android && ./gradlew clean && cd ..

# Reset Metro cache
npx expo start --clear

# Rebuild
npm run detox:build:android
```

### Test Execution Issues

#### Tests Fail to Start
```bash
# Run with verbose logging
detox test --configuration ios.sim.debug --loglevel verbose

# Check if simulator is running
xcrun simctl list devices | grep Booted
```

#### App Doesn't Launch
```bash
# Verify app binary exists
ls -la ios/build/Build/Products/Debug-iphonesimulator/

# Try launching app manually
detox build --configuration ios.sim.debug
```

#### Individual Test Failures
```bash
# Run specific test suite
detox test --configuration ios.sim.debug --grep "Dashboard"

# Run with screenshots on failure
detox test --configuration ios.sim.debug --take-screenshots failing
```

## 📊 Test Results Analysis

### Understanding Test Output

#### ✅ Successful Test
```
✓ should load dashboard with demo metrics from Supabase (15032ms)
```

#### ❌ Failed Test
```
✗ should complete create/edit/delete cycle for lift entries (5000ms)
  
  Error: Test Failed
    Element not found: lift-create-button
    
  at Object.it (/path/to/test/file.js:123:45)
```

### Common Failure Patterns

1. **Element Not Found**
   - Check if `testID` is correctly added to component
   - Verify element is actually rendered
   - Check timing - element might not be loaded yet

2. **Timeout Errors**
   - Increase timeout for slow operations
   - Check if app is responding
   - Verify network/API calls aren't hanging

3. **Navigation Failures**
   - Ensure tab navigation is working
   - Check if screens are properly mounted
   - Verify route names match navigation setup

## ✅ Validation Checklist

After running tests, verify:

- [ ] **All 10 test cases pass** (9 main flows + 1 integration test)
- [ ] **No timeout errors** (tests complete within expected time)
- [ ] **Screenshots captured** (if any tests failed)
- [ ] **Test artifacts generated** in `mobile/artifacts/` directory
- [ ] **Performance acceptable** (tests complete in reasonable time)

## 📱 Manual Verification

If tests pass, manually verify key flows:

1. **App launches** without crashes
2. **Navigation works** between all tabs
3. **Test IDs are visible** (enable debug mode if needed)
4. **Core features function** as expected
5. **No UI regressions** from added test IDs

## 🚀 Next Steps

### If All Tests Pass ✅
1. **Commit the test suite** to version control
2. **Set up CI/CD pipeline** with test automation
3. **Create test data fixtures** for consistent results
4. **Document any test-specific setup** requirements

### If Tests Fail ❌
1. **Review failure logs** in detail
2. **Check test ID implementation** in components
3. **Verify app state** matches test expectations
4. **Update tests** if app behavior has changed
5. **Fix app bugs** if tests reveal issues

## 🆘 Getting Help

If you encounter issues:

1. **Check logs** in `mobile/artifacts/`
2. **Review Detox documentation** at https://wix.github.io/Detox/
3. **Examine test failures** with verbose logging
4. **Verify environment setup** (simulators, dependencies)
5. **Check for version compatibility** issues

---

**Happy Testing! 🧪** Remember that E2E tests help ensure your app works correctly for real users.