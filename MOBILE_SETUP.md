# Mobile Development Setup

This project supports mobile development through Capacitor. Follow the steps below to run the app on mobile devices.

## Prerequisites

- Node.js and npm installed
- For iOS: Mac with Xcode installed
- For Android: Android Studio installed

## Setup Instructions

1. **Export to GitHub**: Use the "Export to Github" button in Lovable
2. **Clone and install dependencies**:
   ```bash
   git clone [your-repo-url]
   cd [your-repo-name]
   npm install
   ```

3. **Add mobile platforms**:
   ```bash
   # For iOS
   npx cap add ios
   
   # For Android  
   npx cap add android
   ```

4. **Update platform dependencies**:
   ```bash
   # For iOS
   npx cap update ios
   
   # For Android
   npx cap update android
   ```

5. **Build the project**:
   ```bash
   npm run build
   ```

6. **Sync with native platforms**:
   ```bash
   npx cap sync
   ```

7. **Run on device/emulator**:
   ```bash
   # For iOS (requires Mac with Xcode)
   npx cap run ios
   
   # For Android
   npx cap run android
   ```

## Feed Card Animations

The Feed Card component includes different animations for web and mobile:

### Web (Framer Motion)
- **Tap Animation**: Buttons scale to 1.3x when tapped using `whileTap={{ scale: 1.3 }}`
- **Count Fade**: Reaction counts fade in smoothly when updated using `initial={{ opacity: 0 }} animate={{ opacity: 1 }}`

### Mobile (React Native Animatable)
- **Pulse Animation**: Buttons pulse when tapped using `ref.current.animate('pulse', 500)`
- **Fade In**: Counts fade in using `animation="fadeIn" duration={300}`

## Testing Animations

1. **Web**: Open Storybook and navigate to "Feed/FeedScreen → WithReactions" story
2. **Mobile**: Use the `FeedCard.native.tsx` component in React Native context

## Hot Reload

The Capacitor configuration includes hot reload from the Lovable preview URL, allowing you to see changes in real-time during development.

## Learn More

For more detailed information about mobile development with Capacitor, visit: https://lovable.dev/blogs/mobile-development-guide