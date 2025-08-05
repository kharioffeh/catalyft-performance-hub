# 🪟 Windows PC E2E Testing Guide

Since you have a Windows PC and want to test both iOS and Android, here are your options:

## 🎯 **Recommended Approach: Hybrid Testing**

### Step 1: Local Android Testing (Windows)
### Step 2: Cloud iOS Testing (GitHub Actions)

---

## 🤖 **Local Android Testing Setup**

### Prerequisites
1. **Install Android Studio**
   - Download from: https://developer.android.com/studio
   - Install Android SDK and Android Virtual Device (AVD)

2. **Install Node.js 18+**
   - Download from: https://nodejs.org/

3. **Install Expo CLI**
   ```bash
   npm install -g @expo/cli
   ```

### Android Setup Steps

#### 1. Setup Android Studio
```bash
# After installing Android Studio, setup environment variables
# Add to your Windows environment variables:
ANDROID_HOME=C:\Users\%USERNAME%\AppData\Local\Android\Sdk
Path=%Path%;%ANDROID_HOME%\emulator;%ANDROID_HOME%\tools;%ANDROID_HOME%\platform-tools
```

#### 2. Create Android Virtual Device (AVD)
```bash
# Open Android Studio > Tools > AVD Manager
# Create new AVD with:
# - Device: Pixel 7
# - System Image: Android 14 (API 34) with Google APIs
# - AVD Name: Pixel_7_API_34
```

#### 3. Test Android E2E
```bash
# Navigate to mobile directory
cd mobile

# Install dependencies
npm install

# Validate setup
npm run detox:validate

# Start Android emulator
emulator -avd Pixel_7_API_34

# Build Android app
npm run detox:build:android

# Run Android E2E tests
npm run detox:test:android
```

---

## 🍎 **Cloud iOS Testing (GitHub Actions)**

Since you can't run iOS Simulator on Windows, use GitHub Actions:

### Setup GitHub Actions (Already configured!)

1. **Commit and push your code** to GitHub
2. **GitHub Actions will automatically**:
   - Run iOS tests on macOS runners
   - Run Android tests on Ubuntu runners
   - Provide detailed test results

### Manual Trigger
```bash
# Go to your GitHub repository
# Navigate to: Actions tab
# Select: "E2E Tests" workflow  
# Click: "Run workflow" button
```

### View Results
- ✅ **Success**: All tests passed
- ❌ **Failure**: Check logs and download artifacts
- 📊 **Summary**: View test results in GitHub

---

## 📱 **Alternative: Expo Go Testing (Limited)**

### What you CAN do with Expo Go:
- ✅ **Manual testing** of app functionality
- ✅ **Visual verification** of UI components
- ✅ **Basic navigation testing**

### What you CANNOT do with Expo Go:
- ❌ **Run Detox E2E tests** (requires native build)
- ❌ **Test native features** fully
- ❌ **Automated testing workflows**

### Manual Testing with Expo Go:
```bash
# Start Expo development server
cd mobile
npx expo start

# Scan QR code with Expo Go app on your iPhone
# Manually test the flows that E2E tests cover:
# 1. Dashboard metrics loading
# 2. Navigation between screens  
# 3. Lift logger functionality
# 4. Analytics charts
# 5. Nutrition features
# 6. Settings and offline mode
```

---

## 🚀 **Recommended Workflow**

### Daily Development:
1. **Code on Windows**
2. **Test Android locally** (`npm run detox:test:android`)
3. **Manual test on iPhone** (Expo Go)
4. **Push to GitHub** for full iOS E2E testing

### Before Releases:
1. **Run full test suite** via GitHub Actions
2. **Download test artifacts** if failures occur
3. **Fix issues** and re-run tests
4. **Deploy** when all tests pass

---

## 🛠️ **Windows-Specific Setup Commands**

### Install Required Tools:
```powershell
# Install Chocolatey (Windows package manager)
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install Node.js
choco install nodejs

# Install Android Studio
choco install androidstudio

# Install Git (if not already installed)
choco install git
```

### Setup Android SDK:
```bash
# Add to Windows PATH (System Environment Variables):
ANDROID_HOME=C:\Users\%USERNAME%\AppData\Local\Android\Sdk
ANDROID_SDK_ROOT=%ANDROID_HOME%
Path=%Path%;%ANDROID_HOME%\emulator;%ANDROID_HOME%\tools;%ANDROID_HOME%\platform-tools

# Verify installation
adb version
emulator -list-avds
```

---

## 📊 **Testing Strategy Comparison**

| Method | iOS Support | Android Support | Setup Complexity | Cost |
|--------|-------------|-----------------|------------------|------|
| **Local Windows** | ❌ No | ✅ Yes | 🟡 Medium | Free |
| **GitHub Actions** | ✅ Yes | ✅ Yes | 🟢 Easy | Free* |
| **Expo Go Manual** | 🟡 Limited | 🟡 Limited | 🟢 Easy | Free |
| **Cloud Services** | ✅ Yes | ✅ Yes | 🟡 Medium | Paid |

*Free for public repos, limited minutes for private repos

---

## 🎯 **My Recommendation for You:**

### **Start with this order:**

1. **Immediate**: Use GitHub Actions (already set up!)
   ```bash
   git add .
   git commit -m "Add E2E test suite"
   git push origin main
   # Go to GitHub Actions tab and watch tests run
   ```

2. **For daily development**: Set up local Android testing
   - Install Android Studio
   - Create Pixel 7 AVD
   - Run `npm run detox:test:android`

3. **For iOS manual testing**: Use Expo Go on your iPhone
   - Run `npx expo start`
   - Scan QR code
   - Manually verify functionality

### **Benefits of this approach:**
- ✅ **Complete coverage**: Both iOS and Android tested
- ✅ **Cost effective**: All free tools
- ✅ **CI/CD ready**: Automated testing on every push
- ✅ **Windows compatible**: Works with your current setup

Would you like me to help you set up any specific part of this workflow?