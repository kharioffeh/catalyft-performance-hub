# Firebase CI Configuration

The Firebase configuration files in this repository are **dummy files for CI/CD purposes only**.

## Files:
- `firebase-config/GoogleService-Info.plist` - Dummy iOS Firebase config
- `firebase-config/google-services.json` - Dummy Android Firebase config

## Important:
- These files allow the CI/CD pipeline to build successfully
- They do NOT contain real Firebase credentials
- In production, these should be replaced with real Firebase configuration files
- Real Firebase config files should NEVER be committed to the repository

## For Local Development:
1. Download your real Firebase config files from Firebase Console
2. Replace the dummy files with your real ones locally
3. DO NOT commit the real files (they're in .gitignore)

## For Production Deployment:
- Real Firebase config files should be injected during the build process
- Use environment variables or secure file storage in your CI/CD system