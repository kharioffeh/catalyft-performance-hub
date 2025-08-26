# Android Firebase Setup Instructions

## 🤖 Place Your Firebase Android Config File Here

### File Needed:
**`google-services.json`**

### How to get this file:
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click the Android app (or add one)
4. Download `google-services.json`
5. **Place it in THIS directory** (`/workspace/mobile/android/app/`)

### Directory Structure Should Be:
```
mobile/
  android/
    app/
      google-services.json  <-- Place file here
      README_FIREBASE_SETUP.md (this file)
```

### Important:
- This file contains your Firebase configuration
- It's specific to your Android app
- Package name must match what's in Firebase Console
- Don't commit this file to public repos (it's already in .gitignore)

### After Adding the File:
The file will be automatically detected during the Android build process.

### Package Name:
Make sure your package name in Firebase matches:
- `com.catalyft.fitness` (or your chosen package name)