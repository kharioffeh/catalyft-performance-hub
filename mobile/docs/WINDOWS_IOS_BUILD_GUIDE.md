# Building iOS/Apple Watch App from Windows

## 🎯 Overview

Since iOS apps can only be compiled on macOS, Windows developers have several options:

## Option 1: Expo EAS Build (Recommended) ✅

### Pros:
- Build in the cloud (no Mac needed)
- Free tier available
- Handles certificates automatically
- Direct TestFlight upload

### Setup Steps:

1. **Install EAS CLI**
```bash
npm install -g eas-cli
```

2. **Create Expo Account** (free)
- Visit https://expo.dev
- Sign up for free account

3. **Login to EAS**
```bash
eas login
```

4. **Configure Project**
```bash
cd /workspace/mobile
eas build:configure
```

5. **Setup Apple Developer Account** ($99/year)
- Required for device testing
- Visit https://developer.apple.com

6. **Configure Credentials**
```bash
eas credentials
```
Choose "Managed by Expo" for easiest setup

7. **Build for iOS**
```bash
# Development build (for testing)
eas build --platform ios --profile development

# Production build (for App Store)
eas build --platform ios --profile production
```

8. **Wait for Build** (~20-40 minutes)
- You'll get an email when ready
- Download the .ipa file

9. **Install on iPhone**
- Use TestFlight (recommended)
- Or use Apple Configurator 2

### Cost:
- Free: 30 builds/month
- Priority: $29/month (faster builds)
- Production: $99/month (more builds)

## Option 2: Mac in Cloud 🖥️

### Services:

#### MacStadium
- **Cost**: $79/month
- **Pros**: Full Mac access, Xcode included
- **Best for**: Regular development

#### MacInCloud
- **Cost**: $20/month (pay-as-you-go)
- **Pros**: Cheaper, hourly billing available
- **Best for**: Occasional builds

#### AWS EC2 Mac
- **Cost**: ~$25/day
- **Pros**: Enterprise-grade, scalable
- **Best for**: CI/CD pipelines

### Setup for Cloud Mac:
1. Sign up for service
2. Remote desktop to Mac
3. Install Xcode
4. Clone your repo
5. Build normally as on Mac

## Option 3: GitHub Actions CI/CD 🚀

Create `.github/workflows/ios.yml`:

```yaml
name: iOS Build

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: macos-latest

    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: |
        npm install
        cd ios && pod install
        
    - name: Build iOS
      run: |
        xcodebuild -workspace ios/Catalyft.xcworkspace \
          -scheme Catalyft \
          -configuration Release \
          -sdk iphoneos \
          -derivedDataPath ios/build
          
    - name: Upload IPA
      uses: actions/upload-artifact@v3
      with:
        name: app-release
        path: ios/build/Build/Products/Release-iphoneos/Catalyft.app
```

### Cost:
- Free: 2,000 minutes/month
- Pro: $4/month for 3,000 minutes

## Option 4: React Native for Windows (No iOS) ❌

If you only need Windows/Android:
```bash
npx react-native-windows-init --overwrite
```

But this won't help with Apple Watch integration.

## 📱 Testing Your iOS Build

### Using TestFlight (Recommended):

1. **Upload to App Store Connect**
```bash
eas submit --platform ios
```

2. **Add TestFlight Testers**
- Internal: Up to 100 testers
- External: Up to 10,000 testers

3. **Install TestFlight** on iPhone
- Download from App Store
- Accept invite
- Install app

### Direct Installation:

1. **Using Apple Configurator 2** (needs Mac access)
2. **Using third-party tools**:
   - Diawi.com
   - InstallOnAir.com

## 🔧 Windows Development Workflow

### Recommended Setup:

1. **Develop on Windows**
   - Use VS Code
   - Test on Android emulator
   - Write all code locally

2. **Build with EAS**
   - Push code to GitHub
   - Run `eas build`
   - Test on iPhone via TestFlight

3. **Debug Issues**
   - Use Expo Go for quick tests
   - Check EAS build logs
   - Use Mac in Cloud if needed

### Local Testing Options:

1. **Android Development** (works on Windows)
```bash
npm run android
```

2. **Web Development** (limited features)
```bash
npm run web
```

3. **Expo Go** (limited HealthKit support)
```bash
expo start
```

## 📋 HealthKit Specific Setup

### Configure in app.json:
```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSHealthShareUsageDescription": "...",
        "NSHealthUpdateUsageDescription": "..."
      },
      "entitlements": {
        "com.apple.developer.healthkit": true
      }
    }
  }
}
```

### Testing HealthKit:
- ⚠️ Must use physical iPhone
- ❌ Won't work in Expo Go
- ✅ Works in development builds
- ✅ Works in TestFlight/production

## 💰 Total Costs

### Minimum (EAS Free Tier):
- Apple Developer: $99/year
- EAS: Free (30 builds/month)
- **Total**: $99/year

### Recommended (EAS Priority):
- Apple Developer: $99/year
- EAS Priority: $29/month
- **Total**: $447/year

### Professional (Cloud Mac):
- Apple Developer: $99/year
- MacInCloud: $20/month
- **Total**: $339/year

## 🚀 Quick Start Commands

```bash
# 1. Install tools
npm install -g eas-cli

# 2. Login
eas login

# 3. Configure
eas build:configure

# 4. Build
eas build --platform ios --profile development

# 5. Submit to TestFlight
eas submit --platform ios
```

## 📞 Support Resources

- **Expo Discord**: https://chat.expo.dev
- **EAS Documentation**: https://docs.expo.dev/eas
- **Apple Developer Forums**: https://developer.apple.com/forums
- **Stack Overflow**: Tag with `expo` and `eas-build`

## ✅ Checklist

- [ ] Expo account created
- [ ] Apple Developer account ($99)
- [ ] EAS CLI installed
- [ ] Project configured for EAS
- [ ] First build submitted
- [ ] TestFlight configured
- [ ] App tested on physical iPhone
- [ ] HealthKit permissions working
- [ ] Apple Watch data syncing

## 🎯 Recommendation

For Windows developers, **EAS Build** is the best option because:
1. No Mac purchase needed
2. Automatic certificate management
3. CI/CD built-in
4. Direct TestFlight upload
5. Free tier available

The workflow becomes:
1. Code on Windows
2. Push to Git
3. Build with EAS
4. Test via TestFlight

This gives you 95% of Mac development capabilities without owning a Mac!