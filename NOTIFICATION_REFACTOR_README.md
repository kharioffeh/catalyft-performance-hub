# Notification Components Refactor

This document describes the refactored notification components that provide a modern, organized notification experience.

## Components Overview

### 1. NotificationCenterScreen.tsx
A comprehensive notification center that displays notifications organized by category with swipe-to-dismiss functionality.

**Features:**
- **Card List Layout**: Notifications displayed as individual cards for better readability
- **Category Organization**: Grouped by type (Training, Health, Social, etc.)
- **Icons per Category**: Visual indicators for each notification type with color coding
- **Swipe to Dismiss**: Left swipe gesture to dismiss notifications
- **Unread Indicators**: Clear visual feedback for unread notifications
- **Timestamps**: Relative time display (e.g., "2 hours ago")
- **Mark All Read**: Bulk action to mark all notifications as read

**Key Props:**
- Uses `useNotifications` hook for data
- Integrates with `react-swipeable` for touch gestures
- Responsive design with proper mobile support

### 2. NotificationSettingsScreen.tsx
A comprehensive settings screen with toggles organized by functional categories.

**Features:**
- **Section Headers**: Organized into Training, Nutrition, and Social categories
- **Toggle Controls**: Individual switches for each notification type
- **Category Grouping**: Logical organization of related settings
- **Global Controls**: Master toggles for overall notification experience
- **Delivery Preferences**: Email vs Push notification options
- **Visual Hierarchy**: Clear separation between different setting types

**Categories:**
- **Training & Recovery**: Workout reminders, recovery alerts, performance summaries
- **Nutrition & Wellness**: Meal tracking, hydration reminders, meal planning
- **Social & Community**: Friend connections, achievements, challenges

## Usage

### Basic Implementation

```tsx
import { NotificationCenterScreen } from '@/components/NotificationCenterScreen';
import { NotificationSettingsScreen } from '@/components/NotificationSettingsScreen';

// In your component
<NotificationCenterScreen />
<NotificationSettingsScreen />
```

### Demo Component

Use the `NotificationDemo` component to showcase both screens:

```tsx
import { NotificationDemo } from '@/components/NotificationDemo';

// Renders both components with tab navigation
<NotificationDemo />
```

## Dependencies

The components require the following dependencies:

- `react-swipeable` - For swipe gesture handling
- `@/hooks/useNotifications` - For notification data
- `@/hooks/useNotificationPreferences` - For settings data
- `@/components/ui/*` - UI components (Card, Switch, Badge, etc.)
- `lucide-react` - For icons
- `date-fns` - For time formatting

## Data Structure

### Notifications
```typescript
interface Notification {
  id: string;
  type: 'digest' | 'reminder' | 'system' | 'daily_summary' | 'missed_workout' | 'abnormal_readiness';
  title: string;
  body: string;
  read: boolean;
  created_at: string;
  meta?: Record<string, any>;
}
```

### Notification Preferences
```typescript
interface NotificationPreferences {
  daily_summary: boolean;
  missed_workout: boolean;
  abnormal_readiness: boolean;
}
```

## Styling

The components use Tailwind CSS classes and follow the existing design system:

- **Color Coding**: Each category has distinct colors for visual separation
- **Responsive Design**: Mobile-first approach with proper breakpoints
- **Accessibility**: Proper ARIA labels and keyboard navigation support
- **Dark Mode**: Compatible with existing theme system

## Customization

### Adding New Categories

To add new notification categories, update the `notificationCategories` array in `NotificationCenterScreen.tsx`:

```typescript
{
  key: 'new_category',
  label: 'New Category',
  icon: <NewIcon className="h-5 w-5" />,
  badgeVariant: 'default',
  color: 'bg-new-color/10 border-new-color/20'
}
```

### Adding New Settings

To add new notification settings, update the `notificationSettings` array in `NotificationSettingsScreen.tsx`:

```typescript
{
  key: 'new_setting',
  label: 'New Setting',
  description: 'Description of the new setting',
  icon: <NewIcon className="h-5 w-5" />,
  category: 'training' // or 'nutrition', 'social'
}
```

## Mobile Support

- **Touch Gestures**: Full support for swipe gestures using `react-swipeable`
- **Responsive Layout**: Adapts to different screen sizes
- **Touch Targets**: Proper sizing for mobile interaction
- **Performance**: Optimized for smooth animations and interactions

## Future Enhancements

Potential improvements for future iterations:

1. **Notification History**: View dismissed notifications
2. **Custom Categories**: User-defined notification groupings
3. **Smart Filtering**: AI-powered notification prioritization
4. **Bulk Actions**: Select multiple notifications for batch operations
5. **Notification Templates**: Customizable notification formats
6. **Analytics**: Track notification engagement and effectiveness

## Testing

The components can be tested using the demo page:

1. Navigate to the demo component
2. Switch between tabs to test both screens
3. Test swipe gestures on mobile devices
4. Verify toggle functionality in settings
5. Check responsive behavior across different screen sizes

## Integration Notes

- Components are designed to work with existing notification infrastructure
- Uses existing hooks and data structures for consistency
- Follows established patterns for UI components
- Maintains backward compatibility with existing notification system