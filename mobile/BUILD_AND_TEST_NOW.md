# 🚀 BUILD & TEST YOUR APP NOW!

## 📱 For Your iPhone Testing

### Option 1: TestFlight (Recommended - Easiest)
**Requirements**: Apple Developer Account ($99/year)

```bash
# Build for iOS
cd mobile
eas build --platform ios --profile preview

# This will:
# 1. Ask for Apple ID credentials
# 2. Create provisioning profiles
# 3. Build the app (~20 minutes)
# 4. Give you a link to download the IPA
```

**Then:**
1. EAS will automatically submit to TestFlight
2. You'll get an email when it's ready (~30 mins)
3. Install TestFlight app on your iPhone
4. Accept the test invitation
5. Install and test your app!

### Option 2: Development Build (Free - No Apple Account)
```bash
# Build for iOS Simulator (Mac only)
cd mobile
eas build --platform ios --profile development

# Then run on simulator
npx expo run:ios
```

### Option 3: Expo Go (Instant - No Build)
```bash
# Test immediately without building
cd mobile
npx expo start

# Then:
# 1. Install "Expo Go" from App Store on your iPhone
# 2. Scan the QR code with your iPhone camera
# 3. Open in Expo Go
```

## 🤖 For Android Testing

### Build APK Now:
```bash
cd mobile
eas build --platform android --profile preview

# Takes ~15 minutes
# Downloads APK directly
# No Google account needed!
```

## 🎯 QUICK START - Do This Now!

### Step 1: Install EAS CLI
```bash
npm install -g eas-cli
```

### Step 2: Login to Expo
```bash
eas login
# Enter your Expo account credentials
# (Create free account at expo.dev if needed)
```

### Step 3: Configure Your Project
```bash
cd mobile
eas build:configure
```

### Step 4: Build Both Platforms
```bash
# Build both iOS and Android at once
eas build --platform all --profile preview
```

## 📲 Testing on Your iPhone (Step by Step)

### If You Have Apple Developer Account:
1. Run: `eas build --platform ios --profile preview`
2. When prompted, enter Apple ID
3. Wait for build (~20 minutes)
4. EAS uploads to TestFlight automatically
5. Check email for TestFlight invitation
6. Open TestFlight on iPhone → Install app

### If No Apple Developer Account:
1. **Use Expo Go** (fastest):
   ```bash
   npx expo start
   ```
   - Install Expo Go from App Store
   - Scan QR code
   - Test immediately!

2. **Or wait** and get Apple Developer account later

## ⚡ One-Command Quick Build

```bash
# Run this automated script
cd mobile
./scripts/setup-eas.sh

# Choose:
# 1 for Android
# 2 for iOS  
# 3 for Both
```

## 📊 Build Status & Download

### Check Build Progress:
```bash
eas build:list

# Or visit:
# https://expo.dev/accounts/[your-username]/projects/catalyft-mobile/builds
```

### Download When Ready:
```bash
# Android APK
eas build:download --platform android

# iOS IPA
eas build:download --platform ios
```

## 🔧 Troubleshooting

### iOS Build Issues:
- **"No bundle identifier"**: Already fixed! (com.catalyft.mobile)
- **"No Apple Team"**: Need Apple Developer account
- **"Provisioning profile"**: EAS handles this automatically

### Android Build Issues:
- **"Package name exists"**: Change in app.json if needed
- **Build fails**: Run with `--clear-cache`

## 📱 Your iPhone Test Options Ranked:

1. **Expo Go** ⭐⭐⭐⭐⭐
   - Instant (2 minutes)
   - Free
   - Great for development
   ```bash
   npx expo start
   ```

2. **TestFlight** ⭐⭐⭐⭐
   - Professional (1 hour total)
   - Needs Apple account
   - Best for beta testing
   ```bash
   eas build --platform ios --profile preview
   ```

3. **Direct Install** ⭐⭐⭐
   - Requires jailbreak or enterprise cert
   - Not recommended

## 🚀 START NOW!

### For Immediate iPhone Testing:
```bash
cd mobile
npx expo start
# Scan QR with Expo Go app
```

### For Production-Ready Builds:
```bash
cd mobile
eas build --platform all --profile preview
```

## ✅ What Happens Next:

1. **Android**: Get APK in 15 minutes → Install on any Android
2. **iOS with TestFlight**: Get build in 20 mins → TestFlight in 30 mins
3. **iOS with Expo Go**: Test immediately on your iPhone

## 📞 Support:

- Build stuck? Check: https://expo.dev/accounts/[username]/projects
- iOS issues? Check: https://developer.apple.com
- Need help? Expo Discord: https://chat.expo.dev

---

**🎉 Your app is configured and ready! Start building now!**