# iOS Firebase Setup Instructions

## 📱 Place Your Firebase iOS Config File Here

### File Needed:
**`GoogleService-Info.plist`**

### How to get this file:
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click the iOS app (or add one)
4. Download `GoogleService-Info.plist`
5. **Place it in THIS directory** (`/workspace/mobile/ios/`)

### Directory Structure Should Be:
```
mobile/
  ios/
    GoogleService-Info.plist  <-- Place file here
    README_FIREBASE_SETUP.md (this file)
```

### Important:
- This file contains your Firebase configuration
- It's specific to your iOS app
- Don't commit this file to public repos (it's already in .gitignore)

### After Adding the File:
If you're using React Native CLI:
```bash
cd ios
pod install
```

For Expo managed workflow, the file will be automatically included during build.