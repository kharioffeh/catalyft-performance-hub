#!/bin/bash

echo "🍎 Setting up Apple HealthKit integration for Catalyft..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo -e "${RED}❌ This script must be run on macOS to configure iOS/HealthKit${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 Installing required npm packages...${NC}"
cd /workspace/mobile

# Install HealthKit and related packages
npm install react-native-health --save --legacy-peer-deps
npm install react-native-permissions --save --legacy-peer-deps

echo -e "${GREEN}✅ NPM packages installed${NC}"

# Navigate to iOS directory
cd ios

echo -e "${YELLOW}🔧 Installing CocoaPods dependencies...${NC}"
pod install

echo -e "${GREEN}✅ Pods installed${NC}"

# Create HealthKit entitlements file
echo -e "${YELLOW}📝 Creating HealthKit entitlements...${NC}"

cat > Catalyft/Catalyft.entitlements << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.developer.healthkit</key>
    <true/>
    <key>com.apple.developer.healthkit.access</key>
    <array>
        <string>health-records</string>
    </array>
    <key>com.apple.developer.healthkit.background-delivery</key>
    <true/>
</dict>
</plist>
EOF

echo -e "${GREEN}✅ Entitlements file created${NC}"

# Instructions for manual steps
echo -e "\n${YELLOW}⚠️  Manual steps required in Xcode:${NC}"
echo -e "1. Open ${GREEN}Catalyft.xcworkspace${NC} in Xcode"
echo -e "2. Select your project in the navigator"
echo -e "3. Go to ${GREEN}Signing & Capabilities${NC} tab"
echo -e "4. Click ${GREEN}+ Capability${NC}"
echo -e "5. Add ${GREEN}HealthKit${NC} capability"
echo -e "6. Check the following options:"
echo -e "   ✓ Clinical Health Records (if needed)"
echo -e "   ✓ Background Delivery"
echo -e "7. Ensure your ${GREEN}Bundle Identifier${NC} matches your Apple Developer account"
echo -e "8. Select your ${GREEN}Development Team${NC}"

echo -e "\n${YELLOW}📱 Testing on device:${NC}"
echo -e "- HealthKit is ${RED}NOT available${NC} on iOS Simulator"
echo -e "- You must test on a ${GREEN}physical iPhone${NC} or ${GREEN}Apple Watch${NC}"
echo -e "- Ensure your device is paired with Xcode"

echo -e "\n${GREEN}✅ HealthKit setup complete!${NC}"
echo -e "Run ${GREEN}npm run ios${NC} to build the app"