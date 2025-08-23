# CI Pipeline Fix Summary

## Issue
The CI pipeline was failing during `npm ci` with the following error:
- Wrong version of `react-native-voice` being installed (0.3.0 instead of 3.2.4)
- patch-package failing because the patch was for the wrong version
- Deprecated Gradle syntax in the voice package

## Root Cause
1. **Duplicate package entries**: Both `react-native-voice` (deprecated, v0.3.0) and `@react-native-voice/voice` (correct, v3.2.4) were in package.json
2. **Wrong patch version**: The patch file was created for v3.2.4 but CI was installing v0.3.0
3. **Package name confusion**: The old deprecated package was being installed instead of the new one

## Fixes Applied

### 1. Removed duplicate package
```diff
- "react-native-voice": "^0.3.0",
```
Kept only the correct package: `"@react-native-voice/voice": "^3.2.4"`

### 2. Removed patch-package
- Deleted `patches/react-native-voice+3.2.4.patch`
- Removed `patch-package` from devDependencies
- Updated postinstall script to use direct fix script

### 3. Updated fix scripts
- `scripts/fix-voice-gradle.js` - Now checks both possible package locations
- `scripts/check-voice-gradle.sh` - New script to check if fix is needed
- `scripts/ci-prebuild.sh` - Updated to use the check script

### 4. Postinstall script
Changed from:
```json
"postinstall": "patch-package"
```
To:
```json
"postinstall": "node scripts/fix-voice-gradle.js || true"
```

## How It Works Now

1. During `npm install`:
   - Only `@react-native-voice/voice` v3.2.4 is installed
   - Postinstall runs `fix-voice-gradle.js` to fix any Gradle issues
   - Script checks both possible package locations
   - Fails gracefully if package not found

2. During CI prebuild:
   - `check-voice-gradle.sh` checks if the fix is needed
   - Only applies fix if deprecated syntax is found
   - Handles both package name variations

## Testing
To verify the fix works:
```bash
cd mobile
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
npm run android:clean-prebuild
```

## Benefits
- No more version conflicts
- No dependency on patch-package
- Handles both old and new package names
- Fails gracefully if package structure changes
- CI pipeline should now pass all checks