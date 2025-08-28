# 🔥 Firebase Complete Setup Guide

## ✅ What's Already Done

1. **Firebase SDK Installed** ✅
   - `@react-native-firebase/app`
   - `@react-native-firebase/analytics`
   - `@react-native-firebase/crashlytics`
   - `@react-native-firebase/perf`

2. **Configuration Files Setup** ✅
   - `app.json` updated with Firebase paths
   - Firebase service created at `src/config/firebase.ts`
   - Error boundary integrated
   - App.tsx updated to initialize Firebase

3. **Directories Created** ✅
   - `ios/` - For GoogleService-Info.plist
   - `android/app/` - For google-services.json

## 📋 What You Need to Do

### Step 1: Complete Firebase Console Setup

1. **Go back to Firebase Console** where you were (Step 3)
2. **Click "Continue to console"** (you can skip the SDK setup instructions)

### Step 2: Download Configuration Files

#### For iOS:
1. In Firebase Console → Project Settings → Your iOS app
2. Download `GoogleService-Info.plist`
3. Place it in `/workspace/mobile/ios/`

#### For Android:
1. In Firebase Console → Project Settings → Your Android app
2. Download `google-services.json`
3. Place it in `/workspace/mobile/android/app/`

### Step 3: Enable Firebase Services

In Firebase Console, enable these services:

1. **Analytics** (Should be enabled)
   - No additional setup needed

2. **Crashlytics**
   - Go to: Build → Crashlytics
   - Click "Get started"
   - Click "Enable Crashlytics"

3. **Performance Monitoring**
   - Go to: Build → Performance
   - Click "Get started"

4. **Authentication** (Optional but recommended)
   - Go to: Build → Authentication
   - Click "Get started"
   - Enable "Email/Password" provider

### Step 4: Add Environment Variables

Create or update `/workspace/mobile/.env`:

```bash
# Firebase Web Config (from Firebase Console → Project Settings → General)
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abcdef
FIREBASE_MEASUREMENT_ID=G-XXXXXXXXX
```

### Step 5: Build the App

For Expo managed workflow:
```bash
# Development build
npx expo prebuild

# iOS (if on Mac)
npx expo run:ios

# Android
npx expo run:android
```

For production builds:
```bash
# Using EAS Build
eas build --platform all
```

## 🧪 Testing Firebase Integration

### 1. Check Console Logs
When you run the app, you should see:
```
✅ Firebase initialized successfully
✅ Firebase services initialized successfully
```

### 2. Test Analytics
Navigate through the app and check Firebase Console:
- Go to Analytics → Dashboard
- You should see real-time users (may take a few minutes)

### 3. Test Crashlytics
To test crash reporting:
```javascript
// Add this temporary test button
import crashlytics from '@react-native-firebase/crashlytics';

// In any component
<Button 
  title="Test Crash" 
  onPress={() => crashlytics().crash()} 
/>
```

### 4. Check Performance
- Go to Firebase Console → Performance
- You should see app start traces

## 🎯 Verification Checklist

- [ ] GoogleService-Info.plist placed in `ios/`
- [ ] google-services.json placed in `android/app/`
- [ ] Environment variables added to `.env`
- [ ] App builds successfully
- [ ] Console shows Firebase initialized
- [ ] Analytics events appear in Firebase Console
- [ ] Crashlytics is receiving data
- [ ] Performance monitoring is active

## 🚨 Troubleshooting

### If Firebase doesn't initialize:
1. Check that config files are in the correct directories
2. Ensure bundle ID/package name matches Firebase Console
3. Try cleaning and rebuilding:
   ```bash
   # iOS
   cd ios && pod cache clean --all && pod install
   
   # Android
   cd android && ./gradlew clean
   ```

### If Analytics not showing:
- Analytics can take 24 hours for first data
- Use DebugView for real-time testing:
  - iOS: Add `-FIRAnalyticsDebugEnabled` to scheme
  - Android: `adb shell setprop debug.firebase.analytics.app com.catalyft.mobile`

### If Crashlytics not working:
1. Force a test crash (not in development mode)
2. Restart the app
3. Check Firebase Console after 5 minutes

## 📱 Platform-Specific Notes

### iOS Additional Setup (if needed):
```bash
cd ios
pod install
```

### Android Additional Setup (if needed):
No additional steps required - the google-services plugin is auto-configured.

## ✅ Success Indicators

You'll know Firebase is working when:
1. ✅ No errors in console about Firebase
2. ✅ Analytics shows active users
3. ✅ Crashlytics dashboard is active
4. ✅ Performance shows app metrics
5. ✅ Events are being tracked

## 🎉 Firebase Setup Complete!

Your app now has:
- 📊 Analytics tracking
- 🐛 Crash reporting
- ⚡ Performance monitoring
- 🎯 Event tracking
- 📈 User properties
- 🔥 Full Firebase integration