# 🔧 Fix Expo Go Connection Error

## Quick Fixes (Try in Order):

### 1. ✅ Use Tunnel Mode (MOST RELIABLE)
```bash
# Stop current server (Ctrl+C)
# Then run with tunnel:
npx expo start --tunnel
```
This bypasses local network issues completely!

### 2. 📱 Make Sure Phone & Computer on SAME WiFi
- Check your phone is on the same WiFi network as your computer
- Disable VPN on both devices if active
- Turn off mobile data on your phone

### 3. 🔄 Clear and Restart
```bash
# Stop server (Ctrl+C)
# Clear cache and restart:
npx expo start --clear
```

### 4. 🌐 Use Different Connection Method
When the QR code appears, press:
- `s` → Switch to Tunnel mode
- `a` → Open Android
- `i` → Open iOS simulator

### 5. 🔌 Try Different Port
```bash
npx expo start --port 19000
```

## 🚀 RECOMMENDED FIX:

```bash
# This usually works best:
npx expo start --tunnel --clear
```

Then:
1. Wait for "Tunnel ready" message
2. Scan the NEW QR code
3. Should connect immediately!

## 📱 Alternative: Build Standalone App Instead

If Expo Go keeps failing, build a real app:

### For Android (15 minutes):
```bash
eas build --platform android --profile preview
```

### For iOS TestFlight (20 minutes):
```bash
eas build --platform ios --profile preview
```

## 🔍 Debugging the Error:

### Check your IP:
```bash
# Your computer's IP should match the exp:// URL
ifconfig | grep inet
```

### Check Metro bundler:
```bash
# Should show "Metro waiting on exp://..."
# If not, restart with:
npx expo start --tunnel
```

### Common Issues:
- **Firewall blocking port 8081** → Use tunnel mode
- **Different networks** → Ensure same WiFi
- **VPN active** → Disable VPN
- **Corporate network** → Use tunnel or build APK/IPA

## ✨ Best Solution for Your iPhone:

```bash
# Run this NOW:
npx expo start --tunnel

# If that fails, build the actual app:
eas build --platform ios --profile preview
```

## 🎯 Why This Happens:

The `exp://10.0.3.133:8081` error means:
- Your phone can't reach your computer's IP
- Port 8081 might be blocked
- Network configuration issue

**Tunnel mode solves all of these!**

---

**TL;DR: Run `npx expo start --tunnel` and it should work!**