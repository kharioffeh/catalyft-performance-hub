#!/bin/bash

# ARIA Testing Helper Script
# This script helps automate and verify ARIA feature testing

echo "🤖 ARIA Testing Helper v1.0"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env file exists
check_env() {
    echo -n "Checking .env file... "
    if [ -f .env ]; then
        if grep -q "OPENAI_API_KEY" .env; then
            echo -e "${GREEN}✓${NC}"
        else
            echo -e "${RED}✗ Missing OPENAI_API_KEY${NC}"
            exit 1
        fi
    else
        echo -e "${RED}✗ .env file not found${NC}"
        echo "Creating .env template..."
        cat > .env << EOF
OPENAI_API_KEY=your_key_here
OPENAI_ARIA_KEY=your_aria_key_here
EOF
        echo "Please add your API keys to .env file"
        exit 1
    fi
}

# Check dependencies
check_dependencies() {
    echo "Checking dependencies..."
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}Installing dependencies...${NC}"
        npm install --legacy-peer-deps
    fi
    
    # Check for required packages
    packages=("openai" "react-native-voice" "react-native-vision-camera" "react-native-gifted-chat")
    for package in "${packages[@]}"; do
        if [ -d "node_modules/$package" ]; then
            echo -e "  $package: ${GREEN}✓${NC}"
        else
            echo -e "  $package: ${RED}✗${NC}"
        fi
    done
}

# Run type checking
run_typescript_check() {
    echo -n "Running TypeScript check... "
    if npx tsc --noEmit 2>/dev/null; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${YELLOW}⚠ Some type errors found${NC}"
    fi
}

# Check for console.logs
check_console_logs() {
    echo -n "Checking for console.logs... "
    count=$(grep -r "console.log" src/services/ai src/screens/aria src/components/aria --include="*.ts" --include="*.tsx" | wc -l)
    if [ $count -eq 0 ]; then
        echo -e "${GREEN}✓ Clean${NC}"
    else
        echo -e "${YELLOW}⚠ Found $count console.log statements${NC}"
    fi
}

# Start Metro bundler
start_metro() {
    echo "Starting Metro bundler..."
    npx react-native start --reset-cache &
    METRO_PID=$!
    echo "Metro PID: $METRO_PID"
    sleep 5
}

# Run iOS simulator
run_ios() {
    echo "Starting iOS app..."
    npx react-native run-ios --simulator="iPhone 14"
}

# Run Android emulator
run_android() {
    echo "Starting Android app..."
    npx react-native run-android
}

# Generate test data
generate_test_data() {
    echo "Generating test data..."
    cat > test-data.json << EOF
{
  "testUser": {
    "id": "test-user-123",
    "name": "Test User",
    "goals": {
      "primary": {
        "type": "muscle-gain",
        "target": 10
      },
      "weeklyWorkouts": 4
    },
    "preferences": {
      "workoutTime": "morning",
      "workoutDuration": 60,
      "equipment": ["dumbbells", "barbell", "bench"],
      "experienceLevel": "intermediate",
      "communicationStyle": "balanced"
    }
  },
  "testMessages": [
    "What should I eat for breakfast?",
    "Generate a chest and triceps workout",
    "I just finished my workout, what should I eat?",
    "How can I improve my bench press?",
    "Show me my progress this month"
  ]
}
EOF
    echo -e "${GREEN}✓ Test data generated${NC}"
}

# Menu
show_menu() {
    echo ""
    echo "What would you like to test?"
    echo "1) Run all checks"
    echo "2) iOS Simulator"
    echo "3) Android Emulator"
    echo "4) Generate test data"
    echo "5) TypeScript check only"
    echo "6) Exit"
    read -p "Enter choice [1-6]: " choice
    
    case $choice in
        1)
            check_env
            check_dependencies
            run_typescript_check
            check_console_logs
            ;;
        2)
            start_metro
            run_ios
            ;;
        3)
            start_metro
            run_android
            ;;
        4)
            generate_test_data
            ;;
        5)
            run_typescript_check
            ;;
        6)
            echo "Exiting..."
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid option${NC}"
            ;;
    esac
}

# Main execution
echo ""
check_env
echo ""

while true; do
    show_menu
done