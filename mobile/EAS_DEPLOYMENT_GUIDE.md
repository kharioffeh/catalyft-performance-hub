# 🚀 EAS Build - Immediate Deployment Guide

## ✅ EAS Build is NOW CONFIGURED and READY!

### 🎯 Quick Start - Get Your APK in 15 Minutes

```bash
# Step 1: Install EAS CLI (if not installed)
npm install -g eas-cli

# Step 2: Login to Expo
eas login
# (Enter your Expo account credentials)

# Step 3: Build Android APK for Testing
cd mobile
eas build --platform android --profile preview

# That's it! Your APK will be ready in ~15 minutes
```

## 📱 Build Commands Ready to Use

### For Testing (Immediate)
```bash
# Android APK (no Google Play account needed)
eas build --platform android --profile preview

# iOS (requires Apple Developer account $99/year)
eas build --platform ios --profile preview
```

### For Production (App Stores)
```bash
# Android App Bundle for Google Play
eas build --platform android --profile production

# iOS for App Store
eas build --platform ios --profile production
```

## 🔧 What's Already Configured

✅ **eas.json** - Build profiles configured
✅ **app.json** - Bundle IDs and versions set
✅ **Build Scripts** - Production scripts ready
✅ **Native Projects** - Generated via prebuild

### Your App Details:
- **App Name**: Catalyft
- **Android Package**: `com.catalyft.mobile`
- **iOS Bundle ID**: `com.catalyft.mobile`
- **Version**: 1.0.0

## 📋 Step-by-Step Instructions

### 1️⃣ First-Time Setup (5 minutes)
```bash
# Navigate to mobile directory
cd mobile

# Run the automated setup script
./scripts/setup-eas.sh
```

This script will:
- Install EAS CLI
- Log you into Expo
- Configure your project
- Start your first build

### 2️⃣ Manual Build Process

#### For Android (Recommended First)
```bash
# Login to Expo
eas login

# Start Android build
eas build --platform android --profile preview

# Wait for build (~15 minutes)
# You'll get a URL to download the APK
```

#### For iOS (Requires Apple Developer Account)
```bash
# Start iOS build
eas build --platform ios --profile preview

# Follow prompts to configure Apple credentials
# Wait for build (~20 minutes)
```

### 3️⃣ Download and Test
```bash
# Check build status
eas build:list

# Download latest Android build
eas build:download --platform android

# Download latest iOS build
eas build:download --platform ios
```

## 🔍 Build Status URLs

After starting a build, you'll get:
1. **Build Details URL** - Watch build progress in real-time
2. **Download URL** - Get your APK/IPA when ready
3. **QR Code** - Install directly on device (Android)

## 📲 Installing on Devices

### Android
1. Download the APK from the build URL
2. Transfer to your Android device
3. Enable "Install from Unknown Sources"
4. Install and run!

### iOS
1. For testing: Use TestFlight
2. Upload IPA to App Store Connect
3. Add testers in TestFlight
4. Install via TestFlight app

## ⚠️ Important Notes

### What You Need:
- **Expo Account** (free) - Create at [expo.dev](https://expo.dev)
- **For iOS**: Apple Developer Account ($99/year)
- **For Production**: Google Play Console account ($25 one-time)

### Environment Variables
Currently NOT configured in the app:
- Supabase credentials
- API keys (Ably, OpenAI, Nutritionix)
- Google Fit client ID

**The app will build and run but API features won't work without these.**

## 🚨 Troubleshooting

### Build Fails?
```bash
# Clear cache and retry
eas build:clear-cache
eas build --platform android --profile preview --clear-cache
```

### Login Issues?
```bash
# Logout and login again
eas logout
eas login
```

### Need to Update App Details?
Edit `app.json` to change:
- App name
- Bundle identifiers
- Version numbers

## 📊 Build Times

- **Android APK**: ~10-15 minutes
- **iOS**: ~15-25 minutes
- **Both platforms**: Run in parallel, ~25 minutes total

## 🎉 You're Ready!

Run this command NOW to get your first APK:
```bash
cd mobile && eas build --platform android --profile preview
```

Within 15 minutes, you'll have a working APK to test on real devices!

---

**Support**: 
- [EAS Build Docs](https://docs.expo.dev/build/introduction/)
- [Expo Discord](https://chat.expo.dev)
- [Build Troubleshooting](https://docs.expo.dev/build-reference/troubleshooting/)