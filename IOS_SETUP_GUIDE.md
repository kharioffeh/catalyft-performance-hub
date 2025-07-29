# iOS Apple Watch Integration Setup Guide

This guide will walk you through setting up Apple Watch/HealthKit integration in your React Native iOS app, enabling automatic calorie tracking and activity monitoring.

## Prerequisites

- iOS 12.4+ device or simulator
- Xcode 12+
- React Native 0.68+
- Apple Developer Account (for device testing)
- Physical iOS device with Apple Watch (HealthKit doesn't work in simulator)

## Step 1: Install Dependencies

### 1.1 Add Required NPM Packages

```bash
# Core HealthKit integration
npm install react-native-health

# Additional dependencies for background sync
npm install @react-native-async-storage/async-storage
npm install react-native-background-job

# Install iOS pods
cd ios && pod install && cd ..
```

### 1.2 Update package.json Scripts

Add these helpful scripts to your `package.json`:

```json
{
  "scripts": {
    "ios": "react-native run-ios",
    "ios:device": "react-native run-ios --device",
    "pods": "cd ios && pod install && cd ..",
    "test-healthkit": "tsx scripts/test-apple-watch-integration.ts"
  }
}
```

## Step 2: Configure iOS Project in Xcode

### 2.1 Open iOS Project

1. Open `ios/YourApp.xcworkspace` in Xcode (not .xcodeproj)
2. Select your app target in the project navigator

### 2.2 Add HealthKit Capability

1. Go to **Signing & Capabilities** tab
2. Click **+ Capability**
3. Add **HealthKit**
4. Ensure the capability appears in your target

### 2.3 Configure Entitlements

Create or update `ios/YourApp/YourApp.entitlements`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>com.apple.developer.healthkit</key>
	<true/>
	<key>com.apple.developer.healthkit.background-delivery</key>
	<true/>
</dict>
</plist>
```

### 2.4 Add to Build Settings

1. In Xcode, select your target
2. Go to **Build Settings**
3. Search for "Code Signing Entitlements"
4. Set the value to: `YourApp/YourApp.entitlements`

## Step 3: Configure Info.plist

Update `ios/YourApp/Info.plist` with HealthKit usage descriptions:

```xml
<!-- Add these keys to your existing Info.plist -->

<!-- HealthKit Permissions -->
<key>NSHealthShareUsageDescription</key>
<string>This app reads health data from Apple Watch to provide accurate calorie tracking, activity monitoring, and personalized fitness insights. Your health data is kept secure and private.</string>

<key>NSHealthUpdateUsageDescription</key>
<string>This app writes workout data to Apple Health to keep your health records synchronized and provide comprehensive fitness tracking across all your health apps.</string>

<!-- Background Modes -->
<key>UIBackgroundModes</key>
<array>
	<string>background-fetch</string>
	<string>background-processing</string>
</array>

<!-- Required Device Capabilities -->
<key>UIRequiredDeviceCapabilities</key>
<array>
	<string>armv7</string>
	<string>healthkit</string>
</array>

<!-- Background Task Identifiers -->
<key>BGTaskSchedulerPermittedIdentifiers</key>
<array>
	<string>com.yourapp.healthkit-sync</string>
</array>
```

## Step 4: Update Podfile

Ensure your `ios/Podfile` includes the HealthKit dependency:

```ruby
# Add this line to your Podfile
pod 'react-native-health', :path => '../node_modules/react-native-health'
```

Then run:
```bash
cd ios && pod install && cd ..
```

## Step 5: Integrate HealthKit Service

### 5.1 Update App Component

Replace your main `App.tsx` with the HealthKit-enabled version:

```typescript
import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { healthKitService } from '@/services/HealthKitService';
import { backgroundTaskManager } from '@/services/BackgroundTaskManager';
import MainNavigator from '@/navigation/MainNavigator';

const queryClient = new QueryClient();

const App: React.FC = () => {
  useEffect(() => {
    if (Platform.OS === 'ios') {
      initializeHealthKit();
    }
  }, []);

  const initializeHealthKit = async () => {
    try {
      // Initialize HealthKit service
      const isAvailable = await healthKitService.initialize();
      if (isAvailable) {
        // Initialize background task manager
        await backgroundTaskManager.initialize();
        console.log('HealthKit and background sync initialized');
      }
    } catch (error) {
      console.error('HealthKit initialization error:', error);
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NavigationContainer>
          <MainNavigator />
        </NavigationContainer>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
```

### 5.2 Create HealthKit Permission Screen

Create a component to handle permission requests:

```typescript
// src/components/HealthKitPermissionScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useHealthKitSync } from '@/hooks/useHealthKitSync';

const HealthKitPermissionScreen: React.FC = () => {
  const { requestPermissions, status } = useHealthKitSync();

  const handleRequestPermissions = async () => {
    const success = await requestPermissions();
    
    if (success) {
      Alert.alert(
        'Apple Watch Connected!',
        'Your health data will now sync automatically.',
        [{ text: 'Great!', style: 'default' }]
      );
    } else {
      Alert.alert(
        'Permissions Needed',
        'Please enable HealthKit permissions in Settings > Health > Data Access & Devices.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20, textAlign: 'center' }}>
        Connect Your Apple Watch
      </Text>
      
      <Text style={{ fontSize: 16, marginBottom: 30, textAlign: 'center', color: '#666' }}>
        Get accurate calorie tracking and activity monitoring by connecting your Apple Watch.
      </Text>
      
      <TouchableOpacity
        style={{
          backgroundColor: '#007AFF',
          padding: 15,
          borderRadius: 10,
          alignItems: 'center',
        }}
        onPress={handleRequestPermissions}
      >
        <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
          Connect Apple Watch
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default HealthKitPermissionScreen;
```

## Step 6: Test the Integration

### 6.1 Build and Run

```bash
# Clean and build
npm run pods
npx react-native run-ios --device

# Or for simulator (limited testing)
npx react-native run-ios
```

### 6.2 Test HealthKit Permissions

1. Open the app on a physical iOS device
2. Navigate to the HealthKit permission screen
3. Tap "Connect Apple Watch"
4. Grant permissions in the HealthKit permission dialog
5. Verify the app shows "Apple Watch Connected" status

### 6.3 Test Data Sync

1. Wear your Apple Watch and perform some activity
2. Wait a few minutes for activity rings to update
3. Open your app and check the nutrition page
4. Verify calorie balance shows Apple Watch data source
5. Check console logs for sync activity

### 6.4 Test Background Sync

1. Perform some activity with Apple Watch
2. Put the app in background
3. Bring app back to foreground
4. Check if new activity data appears

## Step 7: Deploy Backend Functions

Make sure your backend API endpoints are deployed:

```bash
# Deploy HealthKit sync endpoint
supabase functions deploy sync-healthkit-data

# Deploy database migrations
supabase db reset  # or push migrations
```

## Step 8: Production Configuration

### 8.1 App Store Configuration

When submitting to App Store, ensure:

1. **App Store Connect**: Enable HealthKit capability
2. **Review Notes**: Explain HealthKit usage for review team
3. **Privacy Policy**: Include HealthKit data handling

### 8.2 Privacy Compliance

- Update privacy policy to include HealthKit data usage
- Ensure data handling complies with Apple's HealthKit guidelines
- Implement proper data retention and deletion policies

## Troubleshooting

### Common Issues

#### ❌ "HealthKit not available"
- **Solution**: Test on physical device, not simulator
- **Check**: Device supports HealthKit (iPhone 5s+, iOS 8+)

#### ❌ Permissions denied repeatedly
- **Solution**: Delete app and reinstall to reset permissions
- **Check**: Info.plist contains usage descriptions

#### ❌ No data syncing
- **Solution**: Check console logs for sync errors
- **Check**: Backend API is deployed and accessible
- **Check**: User is authenticated with Supabase

#### ❌ Build errors
- **Solution**: Clean build folder: `cd ios && rm -rf build && cd ..`
- **Solution**: Reinstall pods: `cd ios && pod deintegrate && pod install`

#### ❌ Background sync not working
- **Solution**: Enable Background App Refresh in iOS Settings
- **Check**: Background modes are configured in Info.plist

### Debug Commands

```bash
# Check iOS device logs
xcrun simctl spawn booted log stream --predicate 'processImagePath contains "YourApp"'

# Reset React Native cache
npx react-native start --reset-cache

# Clean iOS build
cd ios && xcodebuild clean && cd ..
```

### HealthKit Debug

In your app, add debug logging:

```typescript
// Debug HealthKit status
const debugHealthKit = async () => {
  const permissions = await healthKitService.getPermissionStatus();
  console.log('HealthKit permissions:', permissions);
  
  const syncStatus = backgroundTaskManager.getSyncStatus();
  console.log('Sync status:', syncStatus);
};
```

## Testing Checklist

Before going to production, test:

- [ ] HealthKit permissions request works
- [ ] Activity ring data syncs correctly
- [ ] Workout data appears in app
- [ ] Background sync works when app is backgrounded
- [ ] Foreground sync works when app becomes active
- [ ] Data priority system (WHOOP > Apple Watch > estimates)
- [ ] Error handling for network failures
- [ ] Proper handling when HealthKit is denied
- [ ] App works correctly without Apple Watch

## Performance Tips

1. **Batch sync requests** - Don't sync on every HealthKit change
2. **Use debounced sync** - Wait 30 seconds between sync attempts
3. **Limit background sync** - Only sync recent data (1-2 days)
4. **Cache permissions** - Store permission status to avoid repeated checks
5. **Handle errors gracefully** - Don't crash if HealthKit fails

## Security Considerations

1. **Data encryption** - All HealthKit data is encrypted in transit
2. **User consent** - Always request explicit permission
3. **Data minimization** - Only request necessary HealthKit types
4. **Secure storage** - Use Supabase RLS for data protection
5. **Audit logging** - Log sync activities for debugging

## Next Steps

After successful integration:

1. **Monitor analytics** - Track HealthKit adoption rates
2. **User feedback** - Collect feedback on Apple Watch features
3. **Advanced features** - Consider heart rate zones, sleep tracking
4. **Third-party integrations** - Strava, MyFitnessPal sync
5. **Continuous improvement** - Regular updates for new HealthKit features

## Support Resources

- [Apple HealthKit Documentation](https://developer.apple.com/documentation/healthkit)
- [react-native-health GitHub](https://github.com/agencyenterprise/react-native-health)
- [React Native Background Tasks](https://reactnative.dev/docs/appstate)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

## Getting Help

If you encounter issues:

1. Check the troubleshooting section above
2. Run the test script: `npm run test-healthkit`
3. Check device console logs for HealthKit errors
4. Verify backend API endpoints are accessible
5. Test with a fresh app install to reset permissions

Your Apple Watch integration is now ready for production! 🍎⌚