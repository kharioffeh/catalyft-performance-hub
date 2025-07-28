# Catalyft Mobile

A React Native mobile application built with Expo, TypeScript, ESLint, and Prettier.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start the development server
npm start

# Run on specific platforms
npm run android
npm run ios
npm run web
```

## 🛠 Tech Stack

- **React Native** - Mobile app framework
- **Expo** - Development platform and build service
- **TypeScript** - Type-safe JavaScript
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **EAS Build** - Cloud build service

## 📁 Project Structure

```
mobile/
├── src/
│   ├── components/     # Reusable UI components
│   ├── screens/        # Screen components
│   ├── hooks/          # Custom React hooks
│   ├── utils/          # Utility functions
│   ├── types/          # TypeScript type definitions
│   ├── services/       # API and external services
│   └── App.tsx         # Main app component
├── assets/             # Images, fonts, and other assets
├── eas.json           # EAS build configuration
├── app.json           # Expo app configuration
├── metro.config.js    # Metro bundler configuration
├── tsconfig.json      # TypeScript configuration
├── .eslintrc.js       # ESLint configuration
└── .prettierrc.js     # Prettier configuration
```

## 🔧 Development Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator
- `npm run web` - Run in web browser
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check if code is formatted
- `npm run type-check` - Run TypeScript type checking

## 📱 App Configuration

- **App Name**: mobile
- **Slug**: catalyft-mobile
- **Scheme**: exp.catalyft
- **Bundle ID**: Follows Expo convention

## 🏗 Building

This project is configured with EAS Build for cloud builds:

```bash
# Build for development
eas build --profile development

# Build for preview
eas build --profile preview

# Build for production
eas build --profile production
```

## 🎯 Absolute Imports

The project is configured to support absolute imports from the `src/` directory:

```typescript
// Instead of relative imports
import Component from '../../../components/Component';

// Use absolute imports
import Component from 'src/components/Component';
```

## 🔍 Code Quality

The project includes:

- **ESLint** with React Native and TypeScript rules
- **Prettier** for consistent code formatting
- **TypeScript** for type safety
- Pre-configured rules for React Native best practices

## 📄 License

Private project - All rights reserved.
