# Detox E2E Testing Setup

## Overview
This project is configured with Detox for end-to-end testing of the React Native mobile app. The setup includes smoke tests for core app functionality.

## Prerequisites for Expo Managed Workflow

Since this is an Expo managed workflow, you need to either:

1. **Use Development Build (Recommended)**:
   ```bash
   npm install -g @expo/cli
   npx expo install expo-dev-client
   npx expo run:ios  # This will create development build
   npx expo run:android  # This will create development build
   ```

2. **Or Eject to Bare Workflow**:
   ```bash
   npx expo eject
   ```

## Setup Requirements

### iOS Setup
1. Ensure Xcode is installed
2. Install iOS Simulator
3. Install iPhone 14 simulator

### Android Setup  
1. Install Android Studio
2. Create AVD with name "Pixel_7_API_34"
3. Ensure ANDROID_HOME is set

## Running Tests

### Building the App for Testing
```bash
# For iOS
npm run build:e2e:ios

# For Android  
npm run build:e2e:android
```

### Running E2E Tests
```bash
# iOS Simulator
npm run test:e2e

# Android Emulator
npm run test:e2e:android
```

## Test Structure

The smoke test (`e2e/firstSmoke.e2e.js`) covers:
- App launch verification
- Sign-in flow (placeholder for when implemented)
- Dashboard verification with "My Sessions" (placeholder)
- Calendar navigation (placeholder)

## Current Limitations

Since the app is still in development, some test scenarios are placeholders:
- Sign-in components need to be implemented with proper test IDs
- Dashboard with "My Sessions" needs to be implemented  
- Calendar navigation needs to be implemented

## Test ID Guidelines

When implementing components, add `testID` props for Detox:

```jsx
// Example button
<Button testID="signInButton" title="Sign In" onPress={handleSignIn} />

// Example text input
<TextInput testID="emailInput" placeholder="Email" />

// Example view
<View testID="dashboard">
  <Text testID="mySessionsText">My Sessions</Text>
</View>
```

## Troubleshooting

1. **Build failures**: Ensure development build is created first
2. **Simulator/Emulator issues**: Restart simulators and ensure they match config names
3. **Test timeout**: Increase timeout in Jest config if needed
4. **Missing native modules**: Run `npx expo run:ios/android` to rebuild with latest dependencies