# Navigation Component Usage Guide

## Overview

The `Navigation.tsx` component provides a responsive navigation system that automatically adapts between desktop and mobile layouts:

- **Desktop/Tablet (≥768px)**: Permanent sidebar drawer with all navigation links
- **Mobile (<768px)**: Collapsible drawer (hamburger menu) + bottom tab navigation

## Installation

The required dependencies have been installed:

```bash
npm install @react-navigation/native react-native-screens react-native-safe-area-context @react-navigation/drawer @react-navigation/bottom-tabs --legacy-peer-deps
```

## Features

### Desktop Layout
- Permanent sidebar with all navigation links
- Full navigation menu always visible
- Hover effects and active states
- Icon + label for each navigation item

### Mobile Layout
- **Top Header**: Hamburger menu button and app title
- **Drawer Navigation**: Slide-out drawer with all navigation links
- **Bottom Tabs**: Quick access to 5 main sections (Dashboard, Training, Analytics, Calendar, Athletes)
- **Responsive**: Automatically switches at 768px breakpoint

### Navigation Items
- Dashboard (`/dashboard`) - Home icon
- Training Plan (`/training-plan`) - Dumbbell icon
- Analytics (`/analytics`) - Bar Chart icon
- Calendar (`/calendar`) - Calendar icon
- Athletes (`/athletes`) - Users icon
- Chat (`/chat`) - Message Circle icon
- Settings (`/settings`) - Settings icon

## Usage

### Method 1: Wrap Your Entire App

```tsx
import Navigation from './components/Navigation';
import { BrowserRouter } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Navigation>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/training-plan" element={<TrainingPlan />} />
          {/* ... other routes */}
        </Routes>
      </Navigation>
    </BrowserRouter>
  );
}
```

### Method 2: Wrap Individual Pages

```tsx
import Navigation from '../components/Navigation';

function DashboardPage() {
  return (
    <Navigation>
      <div className="p-6">
        <h1>Dashboard Content</h1>
        {/* Your page content */}
      </div>
    </Navigation>
  );
}
```

### Method 3: Use with Existing Layout

If you already have a layout system, you can integrate the navigation components:

```tsx
import { useIsMobile, navigationUtils } from './components/Navigation';

function MyLayout({ children }) {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen">
      {/* Your existing layout with navigation integration */}
      {children}
    </div>
  );
}
```

## Hooks and Utilities

### useIsMobile Hook

```tsx
import { useIsMobile } from './components/Navigation';

function ResponsiveComponent() {
  const isMobile = useIsMobile();
  
  return (
    <div>
      {isMobile ? (
        <MobileComponent />
      ) : (
        <DesktopComponent />
      )}
    </div>
  );
}
```

### Navigation Utils

```tsx
import { navigationUtils } from './components/Navigation';

// Get all navigation screens
const screens = navigationUtils.getScreens();

// Find screen by path
const screen = navigationUtils.findScreenByPath('/dashboard');

// Check if route is active
const isActive = navigationUtils.isRouteActive('/dashboard', '/dashboard');
```

## Styling

The component uses Tailwind CSS with a dark theme:

- **Primary Color**: Indigo (`#6366f1`)
- **Background**: Gray-900 (`#111827`)
- **Cards**: Gray-800 (`#1f2937`)
- **Borders**: Gray-700 (`#374151`)
- **Text**: Gray-50 (`#f9fafb`) for primary, Gray-400 (`#9ca3af`) for secondary

### Customizing Colors

To customize the theme, update the color values in the component:

```tsx
// In Navigation.tsx
tabBarActiveTintColor: '#your-color', // Change active tab color
drawerActiveTintColor: '#your-color', // Change active drawer color
// etc.
```

## Integration with Existing App

The Navigation component is designed to work with the existing React Router setup. It doesn't replace your routing but provides the UI navigation layer.

### Current App Integration

1. **Add Athletes Route**: Already added to `AppRouter.tsx`
2. **Import Navigation**: Import where needed
3. **Wrap Content**: Use Navigation component as a wrapper

### Example Integration in AppLayout

```tsx
// In AppLayout.tsx or similar
import Navigation from './Navigation';

function AppLayout() {
  return (
    <Navigation>
      <Outlet /> {/* React Router outlet for nested routes */}
    </Navigation>
  );
}
```

## Mobile Behavior

- **Breakpoint**: 768px (Tailwind's `md` breakpoint)
- **Drawer**: Slides in from left on mobile
- **Overlay**: Dark overlay when drawer is open
- **Bottom Tabs**: Fixed position, shows first 5 navigation items
- **Auto-close**: Drawer closes when navigation item is selected

## Accessibility

- Keyboard navigation support
- ARIA labels for screen readers
- Focus management
- Color contrast compliant
- Touch-friendly tap targets (minimum 44px)

## Troubleshooting

### Common Issues

1. **Icons not showing**: Ensure `lucide-react` is installed
2. **Responsive not working**: Check if Tailwind CSS is properly configured
3. **Navigation not updating**: Ensure you're using React Router's navigation hooks

### Dependencies

Make sure these are installed:
- `react-router-dom` (for navigation)
- `lucide-react` (for icons)
- `tailwindcss` (for styling)
- `@react-navigation/*` packages (for navigation structure)

## Performance

- Responsive hooks use `useEffect` with cleanup
- Navigation state is managed efficiently
- Icons are tree-shakeable from Lucide React
- Components are optimized for re-renders