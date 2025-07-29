# Apple Watch Integration - Quick Setup Checklist ✅

Use this checklist to quickly set up Apple Watch integration in your React Native iOS app.

## Pre-Integration Checklist

- [ ] **Physical iOS Device**: HealthKit requires a real device, won't work in simulator
- [ ] **Apple Watch**: Paired and working with your iPhone
- [ ] **Apple Developer Account**: Required for HealthKit capability
- [ ] **Xcode 12+**: Latest version recommended
- [ ] **React Native 0.68+**: Modern RN version for best compatibility

## Backend Setup (Complete First)

- [ ] **Database Migration**: Applied HealthKit tables
  ```bash
  supabase db reset
  ```
- [ ] **API Functions**: Deployed sync endpoint
  ```bash
  supabase functions deploy sync-healthkit-data
  ```
- [ ] **Test Backend**: Verify API endpoints work
  ```bash
  tsx scripts/test-apple-watch-integration.ts
  ```

## Dependencies Installation

- [ ] **Install NPM packages**:
  ```bash
  npm install react-native-health @react-native-async-storage/async-storage react-native-background-job
  ```
- [ ] **Install iOS Pods**:
  ```bash
  cd ios && pod install && cd ..
  ```

## iOS Configuration

### Xcode Project Setup
- [ ] **Open Project**: `ios/YourApp.xcworkspace` in Xcode
- [ ] **Add HealthKit Capability**: Signing & Capabilities → + Capability → HealthKit
- [ ] **Verify Entitlements**: Check `YourApp.entitlements` file exists and has HealthKit keys

### Info.plist Configuration
- [ ] **Usage Descriptions**: Added `NSHealthShareUsageDescription` and `NSHealthUpdateUsageDescription`
- [ ] **Background Modes**: Added `background-fetch` and `background-processing`
- [ ] **Device Capabilities**: Added `healthkit` requirement
- [ ] **Background Tasks**: Added `BGTaskSchedulerPermittedIdentifiers`

### Podfile Update
- [ ] **HealthKit Pod**: Added `react-native-health` pod
- [ ] **Pod Install**: Ran `pod install` after updating

## Code Integration

### Service Files (Already Created)
- [ ] **HealthKitService.ts**: Core HealthKit integration ✅
- [ ] **BackgroundTaskManager.ts**: Background sync management ✅
- [ ] **useHealthKitSync.ts**: React hook for components ✅
- [ ] **useUnifiedWearableData.ts**: Unified data access ✅

### App Integration
- [ ] **Update App.tsx**: Initialize HealthKit on app start
- [ ] **Permission Screen**: Create UI for requesting HealthKit permissions
- [ ] **Navigation**: Add HealthKit permission flow to your app navigation

## Testing Checklist

### Basic Functionality
- [ ] **Build Success**: App builds without errors
  ```bash
  npx react-native run-ios --device
  ```
- [ ] **Permission Request**: HealthKit permission dialog appears
- [ ] **Permission Grant**: Successfully grant HealthKit permissions
- [ ] **Connection Status**: App shows "Apple Watch Connected" in UI

### Data Sync Testing
- [ ] **Activity Data**: Perform some activity, verify data syncs
- [ ] **Workout Data**: Record a workout, check if it appears in app
- [ ] **Calorie Balance**: Nutrition page shows Apple Watch as data source
- [ ] **Background Sync**: App syncs when brought to foreground

### Edge Cases
- [ ] **No Permissions**: App handles denied permissions gracefully
- [ ] **No Apple Watch**: App works without Apple Watch connected
- [ ] **Network Errors**: Sync handles API failures properly
- [ ] **Priority System**: WHOOP data takes priority over Apple Watch (if both connected)

## Production Readiness

### App Store Preparation
- [ ] **HealthKit Capability**: Enabled in App Store Connect
- [ ] **Privacy Policy**: Updated to include HealthKit data usage
- [ ] **Review Notes**: Added explanation of HealthKit usage for App Store review
- [ ] **Testing**: Tested on multiple devices and iOS versions

### Performance Optimization
- [ ] **Background Refresh**: Verified iOS Background App Refresh is enabled
- [ ] **Sync Frequency**: Configured appropriate sync intervals (15+ minutes)
- [ ] **Error Handling**: Implemented retry logic and graceful failures
- [ ] **User Feedback**: Added loading states and sync status indicators

## Quick Verification Commands

```bash
# Test all components
npm run test-healthkit

# Clean and rebuild if issues
cd ios && rm -rf build && pod deintegrate && pod install && cd ..
npx react-native start --reset-cache
npx react-native run-ios --device

# Check iOS logs for HealthKit activity
xcrun simctl spawn booted log stream --predicate 'processImagePath contains "YourApp"'
```

## Files Created/Modified

### New Files ✅
- `src/services/HealthKitService.ts` - Core HealthKit integration
- `src/services/BackgroundTaskManager.ts` - Background sync management
- `src/hooks/useHealthKitSync.ts` - React hook for HealthKit
- `src/hooks/useUnifiedWearableData.ts` - Unified wearable data access
- `ios/YourApp/YourApp.entitlements` - HealthKit entitlements
- `supabase/migrations/*-healthkit-tables.sql` - Database schema
- `supabase/functions/sync-healthkit-data/index.ts` - API endpoint

### Modified Files ✅
- `src/App.tsx` - HealthKit initialization
- `src/pages/Nutrition.tsx` - Apple Watch data display
- `src/components/nutrition/WearableConnectionBanner.tsx` - Connection status
- `src/components/nutrition/CalorieBalanceCard.tsx` - Data source indicator
- `ios/YourApp/Info.plist` - Permissions and background modes
- `ios/Podfile` - HealthKit dependency

## Common Issues & Quick Fixes

| Issue | Quick Fix |
|-------|-----------|
| "HealthKit not available" | Test on physical device, not simulator |
| Build errors | Clean: `rm -rf ios/build && pod install` |
| No data syncing | Check API endpoint deployed, user authenticated |
| Permissions denied | Delete app, reinstall to reset permissions |
| Background sync not working | Enable Background App Refresh in iOS Settings |

## Success Indicators

When everything is working correctly, you should see:

✅ **App Build**: Builds and runs without errors  
✅ **Permission Flow**: HealthKit permission dialog appears and works  
✅ **Connection Status**: "Apple Watch Connected" shows in wearable banner  
✅ **Data Source**: Calorie balance card shows "Apple Watch" badge  
✅ **Sync Activity**: Console logs show HealthKit sync activity  
✅ **Real Data**: Activity rings and workout data appear in nutrition page  

## Next Steps After Setup

1. **User Testing**: Test with real users and Apple Watch activity
2. **Analytics**: Monitor HealthKit adoption and usage patterns
3. **Feedback Loop**: Collect user feedback on Apple Watch features
4. **Advanced Features**: Consider heart rate zones, sleep tracking, etc.
5. **Maintenance**: Regular updates for new HealthKit capabilities

---

**🎉 Congratulations!** Your Apple Watch integration is now ready for production use!

The app now supports:
- **Automatic activity tracking** from Apple Watch
- **Smart data prioritization** (WHOOP > Apple Watch > estimates)
- **Background sync** for seamless user experience
- **Visual data source indicators** so users know where their data comes from
- **Graceful fallbacks** when devices aren't connected

Users with Apple Watches will now get significantly more accurate calorie tracking! 🍎⌚