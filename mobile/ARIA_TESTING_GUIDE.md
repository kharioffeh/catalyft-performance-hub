# ARIA AI Fitness Coach - Testing Guide

## 🚀 Initial Setup

### Prerequisites
1. **Environment Variables** (.env file):
```bash
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_ARIA_KEY=your_aria_specific_key_here
```

2. **Install Dependencies**:
```bash
cd /workspace/mobile
npm install --legacy-peer-deps
npx pod-install  # iOS only
```

3. **Camera/Microphone Permissions** (iOS):
Add to `ios/Info.plist`:
```xml
<key>NSCameraUsageDescription</key>
<string>ARIA needs camera access to analyze your exercise form</string>
<key>NSMicrophoneUsageDescription</key>
<string>ARIA needs microphone access for voice commands</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>ARIA needs photo library access for meal analysis</string>
```

4. **Camera/Microphone Permissions** (Android):
Add to `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
```

## 📱 Testing Procedures

### 1. **Chat Interface Testing** (`AriaChatScreen`)

#### Test Cases:
- [ ] **Initial Load**
  - Launch app and navigate to ARIA chat
  - Verify welcome message appears with user's name
  - Check gradient header renders correctly

- [ ] **Quick Actions**
  - Test at different times of day:
    - Morning (5-10am): Should show "Plan today's workout", "Breakfast ideas"
    - Afternoon (2-5pm): Should show "Pre-workout meal", "Energy boost"
    - Evening (5-9pm): Should show "Today's training", "Dinner suggestions"
  - Tap each quick action and verify it sends the correct message

- [ ] **Text Messaging**
  - Send: "What should I eat for breakfast?"
  - Verify streaming response appears character by character
  - Check typing indicator shows during response
  - Ensure response is contextually relevant

- [ ] **Voice Input**
  - Tap microphone button
  - Say: "I just did 10 reps of bench press at 185 pounds"
  - Verify voice is transcribed correctly
  - Check that ARIA responds appropriately

- [ ] **Rich Message Types**
  - Send: "Generate a chest workout"
  - Verify WorkoutCard component renders
  - Test "Start Workout" button functionality
  - Send: "Suggest a high-protein lunch"
  - Verify MealCard component renders

### 2. **Form Analysis Testing** (`FormAnalyzer`)

#### Test Cases:
- [ ] **Camera Setup**
  - Navigate to Form Analysis
  - Verify camera preview loads
  - Test camera flip (front/back)
  - Toggle overlay grid on/off

- [ ] **Video Recording**
  - Start recording (red button)
  - Perform 5-10 seconds of an exercise
  - Stop recording
  - Verify video saves and plays back

- [ ] **Playback Controls**
  - Test play/pause functionality
  - Adjust playback speed (0.5x, 1x, 1.5x, 2x)
  - Use slider to seek through video
  - Verify time display updates correctly

- [ ] **AI Analysis**
  - Tap "Analyze Form" button
  - Wait for analysis (loading indicator should show)
  - Verify form score appears (0-100)
  - Check that issues are categorized by severity
  - Test "Jump to timestamp" for specific issues

- [ ] **Mock Data Testing** (if API unavailable):
  ```javascript
  // Temporarily modify analyzeForm() in FormAnalyzer.tsx:
  const mockAnalysis = {
    overallScore: 75,
    issues: [
      { severity: 'major', bodyPart: 'Back', issue: 'Rounding during lift', correction: 'Keep spine neutral' },
      { severity: 'minor', bodyPart: 'Knees', issue: 'Slight cave', correction: 'Push knees out' }
    ],
    goodPoints: ['Good bar path', 'Proper breathing'],
    recommendations: ['Work on hip mobility', 'Strengthen core']
  };
  ```

### 3. **Meal Analysis Testing** (`MealAnalysisScreen`)

#### Test Cases:
- [ ] **Photo Capture**
  - Tap "Take Photo" button
  - Verify camera opens with guide overlay
  - Take photo of a meal
  - Confirm photo preview appears

- [ ] **Gallery Selection**
  - Tap "Choose from Gallery"
  - Select a food photo
  - Verify it loads for analysis

- [ ] **AI Analysis**
  - Verify "Analyzing your meal..." loader appears
  - Check that foods are detected with confidence scores
  - Verify nutritional breakdown (calories, protein, carbs, fats)
  - Test health score display (1-10)

- [ ] **Edit Mode**
  - Tap edit icon
  - Adjust food quantities
  - Remove a food item
  - Verify totals recalculate correctly

- [ ] **Meal Logging**
  - Add optional notes
  - Tap "Log Meal"
  - Verify success message appears

### 4. **Workout Generator Testing** (`WorkoutGeneratorScreen`)

#### Test Cases:
- [ ] **Parameter Selection**
  - Set duration slider (15-120 minutes)
  - Select workout type (strength/cardio/hybrid)
  - Choose intensity level
  - Select muscle groups (for strength)
  - Pick available equipment

- [ ] **Advanced Options**
  - Tap "Advanced Options"
  - Add exercises to avoid
  - Enter special notes
  - Verify inputs are captured

- [ ] **Generation**
  - Tap "Generate Workout"
  - Verify loading state appears
  - Check that workout plan renders with exercises
  - Test "Start Workout" functionality
  - Try "Save to Library"

### 5. **Progress Dashboard Testing** (`InsightsDashboard`)

#### Test Cases:
- [ ] **Chart Rendering**
  - Verify strength progress line chart loads
  - Test timeframe selector (week/month/year)
  - Check body composition progress chart
  - Verify consistency bar chart displays

- [ ] **Quick Stats**
  - Verify all 4 stat cards show data
  - Pull down to refresh
  - Check that data updates

- [ ] **Achievements**
  - Scroll horizontally through achievements
  - Verify badge icons and descriptions

- [ ] **AI Insights**
  - Check that insight cards render
  - Verify trend indicators (up/stable/down)
  - Test prediction cards if available
  - Tap recommendations to expand

### 6. **Voice Assistant Testing**

#### Test Voice Commands:
```javascript
// Test these voice commands in chat:
"Hey ARIA, what's my workout for today?"
"I'm feeling tired, should I still workout?"
"How many calories do I have left today?"
"Show me how to do Romanian deadlifts"
"Am I on track for my weight loss goal?"
"I just finished my workout"
"What's a good post-workout meal?"
```

### 7. **Error Handling Testing**

- [ ] **No Internet Connection**
  - Turn on airplane mode
  - Try to send a chat message
  - Verify offline error message appears
  - Check that local features still work

- [ ] **API Rate Limiting**
  - Send multiple rapid requests
  - Verify rate limit message appears
  - Check graceful degradation

- [ ] **Invalid Input**
  - Upload non-food image for meal analysis
  - Enter invalid workout parameters
  - Verify appropriate error messages

### 8. **Performance Testing**

- [ ] **Memory Usage**
  - Monitor app memory while recording video
  - Check for memory leaks during chat streaming
  - Verify smooth scrolling in dashboard

- [ ] **Load Times**
  - Measure initial screen load times
  - Test image analysis speed
  - Check chat response latency

## 🔧 Debugging Tips

### Enable Debug Logs:
```javascript
// In src/services/ai/openai.ts
const DEBUG = true;

if (DEBUG) {
  console.log('Context:', context);
  console.log('Response:', response);
}
```

### Test with Mock Data:
```javascript
// In src/services/ai/openai.ts
const USE_MOCK_DATA = true;

if (USE_MOCK_DATA) {
  return mockResponses[endpoint];
}
```

### Common Issues:

1. **Camera not working**:
   - Check permissions in device settings
   - Restart the app
   - Try on physical device (not simulator)

2. **Voice recognition fails**:
   - Check microphone permissions
   - Test in quiet environment
   - Verify language settings (en-US)

3. **API errors**:
   - Verify API keys in .env
   - Check OpenAI account credits
   - Monitor rate limits

4. **Chart rendering issues**:
   - Clear app cache
   - Check data format
   - Verify react-native-svg installation

## 📊 Test Coverage Checklist

### Core Features:
- [ ] Chat messaging (text) - 10 test messages
- [ ] Voice input - 5 voice commands
- [ ] Workout generation - 3 different configurations
- [ ] Form analysis - 2 different exercises
- [ ] Meal analysis - 3 different meals
- [ ] Progress dashboard - All chart types
- [ ] Quick actions - All time-based options

### Edge Cases:
- [ ] Empty states (no workouts, no meals)
- [ ] Maximum input lengths
- [ ] Special characters in text
- [ ] Rapid user interactions
- [ ] Background/foreground transitions
- [ ] Device rotation (if supported)
- [ ] Low battery mode

### Platform-Specific:
- [ ] iOS - Test on iPhone 12 or newer
- [ ] Android - Test on Pixel 5 or newer
- [ ] iPad - Verify responsive layout
- [ ] Android Tablet - Check scaling

## 🎯 Success Criteria

✅ All core features functioning without crashes
✅ API responses under 3 seconds
✅ Smooth animations (60 FPS)
✅ Proper error messages for all failure cases
✅ Data persists between app sessions
✅ Voice commands recognized 80%+ accuracy
✅ Form analysis provides actionable feedback
✅ Meal analysis within 20% accuracy of actual nutrition

## 📝 Test Report Template

```markdown
**Date**: [Date]
**Tester**: [Name]
**Device**: [Model, OS Version]
**Build**: [Version/Commit]

### Results:
- Chat Interface: ✅/❌
- Form Analysis: ✅/❌
- Meal Analysis: ✅/❌
- Workout Generator: ✅/❌
- Progress Dashboard: ✅/❌
- Voice Commands: ✅/❌

### Issues Found:
1. [Issue description, steps to reproduce]

### Notes:
[Any additional observations]
```

## 🚨 Critical Test Scenarios

1. **First-Time User Experience**
   - Fresh install, no data
   - Onboarding flow
   - Initial AI interaction

2. **Power User Flow**
   - Heavy daily usage
   - Multiple workouts per day
   - Extensive chat history

3. **Recovery Testing**
   - Force quit during video recording
   - Network disconnection during API call
   - Low storage space

## 💡 Testing Pro Tips

1. **Use Charles Proxy** to monitor API calls
2. **Enable React Native Debugger** for state inspection
3. **Use Flipper** for network and database debugging
4. **Test on minimum supported OS versions**
5. **Verify accessibility with VoiceOver/TalkBack**

---

**Remember**: Test like a real user would use the app, not like a developer! 🎯