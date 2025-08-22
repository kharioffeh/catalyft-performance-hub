# Apple Watch / HealthKit Integration Setup Guide

## 📱 Prerequisites

- macOS development machine
- Xcode 14.0 or later
- Physical iPhone (iOS 13.0+)
- Apple Developer Account (for device testing)
- Apple Watch (optional but recommended)

## 🚀 Quick Setup

Run the automated setup script:

```bash
cd /workspace/mobile
chmod +x scripts/setup-healthkit.sh
./scripts/setup-healthkit.sh
```

## 📋 Manual Setup Steps

### 1. Install Dependencies

```bash
cd /workspace/mobile
npm install react-native-health --save --legacy-peer-deps
npm install react-native-permissions --save --legacy-peer-deps
```

### 2. iOS Configuration

```bash
cd ios
pod install
```

### 3. Configure Xcode Project

1. Open `/workspace/mobile/ios/Catalyft.xcworkspace` in Xcode
2. Select the Catalyft project in the navigator
3. Go to **Signing & Capabilities** tab
4. Click **+ Capability**
5. Add **HealthKit** capability
6. Enable these options:
   - ✅ Background Delivery
   - ✅ Clinical Health Records (optional)

### 4. Configure App Entitlements

The entitlements file should be automatically created at `ios/Catalyft/Catalyft.entitlements`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.developer.healthkit</key>
    <true/>
    <key>com.apple.developer.healthkit.access</key>
    <array>
        <string>health-records</string>
    </array>
    <key>com.apple.developer.healthkit.background-delivery</key>
    <true/>
</dict>
</plist>
```

### 5. Update Info.plist

Ensure these keys are in `ios/Catalyft/Info.plist`:

```xml
<key>NSHealthShareUsageDescription</key>
<string>Catalyft needs access to read your health data to sync workouts, heart rate, sleep, and recovery metrics from your Apple Watch and other health devices.</string>
<key>NSHealthUpdateUsageDescription</key>
<string>Catalyft needs permission to save your workouts and fitness data to Apple Health so it syncs with your Apple Watch and other health apps.</string>
```

## 🧪 Testing

### Device Requirements

⚠️ **Important**: HealthKit is NOT available on iOS Simulator. You must test on a physical device.

### Testing Checklist

#### Initial Setup
- [ ] App launches without crashes
- [ ] HealthKit permission prompt appears on first launch
- [ ] All requested permissions are listed correctly
- [ ] User can grant/deny permissions

#### Data Reading
- [ ] Steps data syncs correctly
- [ ] Heart rate data appears in real-time
- [ ] Sleep data imports from last night
- [ ] Workouts from Apple Watch appear
- [ ] HRV data is accurate
- [ ] Resting heart rate matches Health app

#### Data Writing
- [ ] Completed workouts export to Health app
- [ ] Workout details (duration, calories, heart rate) are correct
- [ ] Workouts appear on Apple Watch activity rings

#### Background Sync
- [ ] Data syncs when app is in background
- [ ] New Apple Watch workouts appear automatically
- [ ] Battery usage is reasonable

#### Edge Cases
- [ ] App handles permission denial gracefully
- [ ] Works with multiple Apple Watches
- [ ] Handles data conflicts appropriately
- [ ] Old data (>30 days) syncs correctly

## 📊 Data Points Synced

### From Apple Watch to Catalyft:
- ✅ Workouts (all types)
- ✅ Heart Rate (resting, active, variability)
- ✅ Steps & Distance
- ✅ Active/Resting Calories
- ✅ Sleep Analysis
- ✅ Stand Hours
- ✅ Exercise Minutes
- ✅ VO2 Max
- ✅ Blood Oxygen (if available)
- ✅ Body Measurements (weight, body fat %)

### From Catalyft to Apple Watch:
- ✅ Strength Training Workouts
- ✅ Custom Workouts
- ✅ Workout Routes (if GPS)
- ✅ Calories Burned
- ✅ Heart Rate Zones

## 🔧 Troubleshooting

### Common Issues

#### "HealthKit not available"
- Ensure testing on physical device
- Check iOS version (13.0+)
- Verify HealthKit capability is enabled

#### Permissions not appearing
- Delete app and reinstall
- Check Info.plist descriptions
- Reset privacy settings: Settings > General > Reset > Reset Location & Privacy

#### Data not syncing
- Check HealthKit permissions in Settings > Privacy > Health > Catalyft
- Ensure all data types are enabled
- Force quit and reopen app
- Check Apple Watch is paired

#### Background sync not working
- Enable Background App Refresh
- Check battery optimization settings
- Ensure background delivery entitlement

## 🏗️ Build & Deploy

### Development Build
```bash
cd /workspace/mobile
npm run ios -- --device "Your iPhone Name"
```

### Release Build
1. In Xcode, select Generic iOS Device
2. Product > Archive
3. Upload to App Store Connect
4. Ensure HealthKit is listed in app capabilities

## 📝 App Store Requirements

When submitting to App Store:

1. **Privacy Policy**: Must mention HealthKit data usage
2. **App Description**: Clearly state HealthKit integration
3. **Screenshots**: Show health data features
4. **Review Notes**: Explain why each permission is needed

### Sample Review Note:
```
Catalyft integrates with HealthKit to:
- Import workouts for comprehensive fitness tracking
- Monitor heart rate during exercises
- Track sleep for recovery recommendations
- Export completed workouts back to Apple Health
- Provide personalized training based on health metrics

All health data is encrypted and never shared without explicit user consent.
```

## 🔐 Privacy & Security

- All HealthKit data stays on device by default
- Sync to cloud only with user permission
- Implement encryption for any transmitted health data
- Follow Apple's HealthKit guidelines
- Never use health data for advertising

## 📚 Additional Resources

- [Apple HealthKit Documentation](https://developer.apple.com/documentation/healthkit)
- [HealthKit Best Practices](https://developer.apple.com/design/human-interface-guidelines/healthkit)
- [React Native Health Library](https://github.com/agencyenterprise/react-native-health)

## ✅ Final Checklist Before Release

- [ ] All permissions have clear descriptions
- [ ] Background sync is optimized for battery
- [ ] Error handling for all HealthKit operations
- [ ] Privacy policy updated
- [ ] Tested on multiple iOS versions
- [ ] Tested with/without Apple Watch
- [ ] App Store metadata includes HealthKit
- [ ] Crash reporting excludes health data