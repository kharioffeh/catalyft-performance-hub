import { device, element, by, expect } from 'detox';
import { E2EHelpers } from './helpers';

describe('Catalyft App E2E Flows', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('Authentication & Onboarding Flow', () => {
    it('should handle web sign-up → magic-link deep-link → mobile landing logged-in', async () => {
      // Note: This test simulates the flow where user signs up on web and opens mobile app via magic link
      
      // 1. Simulate opening app via magic link deep link
      await device.openURL({ url: 'catalyft://auth/magic-link?token=test-magic-token&email=test@example.com' });
      
      // 2. Verify magic link processing screen appears
      await expect(element(by.id('magic-link-processing'))).toBeVisible();
      await expect(element(by.text('Verifying your account...'))).toBeVisible();
      
      // 3. Wait for authentication to complete and redirect to dashboard
      await waitFor(element(by.id('dashboard-container')))
        .toBeVisible()
        .withTimeout(10000);
      
      // 4. Verify user is logged in on dashboard
      await expect(element(by.id('dashboard-welcome-text'))).toBeVisible();
      await expect(element(by.id('user-profile-avatar'))).toBeVisible();
      
      // 5. Verify premium status indicator (if applicable)
      await expect(element(by.id('premium-status-badge'))).toExist();
    });

    it('should verify premium flag check after Stripe webhook', async () => {
      // Simulate premium user state after successful Stripe payment
      
      // 1. Navigate to settings to check premium status
      await element(by.id('tab-Settings')).tap();
      await expect(element(by.id('settings-container'))).toBeVisible();
      
      // 2. Tap on subscription/premium section
      await element(by.id('premium-subscription-section')).tap();
      
      // 3. Verify premium features are unlocked
      await expect(element(by.id('premium-status-active'))).toBeVisible();
      await expect(element(by.text('Premium Active'))).toBeVisible();
      
      // 4. Verify premium-only features are accessible
      await expect(element(by.id('advanced-analytics-feature'))).toBeVisible();
      await expect(element(by.id('custom-programs-feature'))).toBeVisible();
    });
  });

  describe('Dashboard & Metrics Flow', () => {
    it('should load dashboard with demo metrics from Supabase', async () => {
      // 1. Navigate to dashboard
      await element(by.id('tab-Dashboard')).tap();
      await expect(element(by.id('dashboard-container'))).toBeVisible();
      
      // 2. Wait for metrics to load
      await waitFor(element(by.id('health-metrics-container')))
        .toBeVisible()
        .withTimeout(5000);
      
      // 3. Verify strain metric
      await expect(element(by.id('strain-metric-card'))).toBeVisible();
      await expect(element(by.id('strain-value'))).toBeVisible();
      
      // 4. Verify recovery metric
      await expect(element(by.id('recovery-metric-card'))).toBeVisible();
      await expect(element(by.id('recovery-value'))).toBeVisible();
      
      // 5. Verify sleep metric
      await expect(element(by.id('sleep-metric-card'))).toBeVisible();
      await expect(element(by.id('sleep-value'))).toBeVisible();
      
      // 6. Verify HRV metric
      await expect(element(by.id('hrv-metric-card'))).toBeVisible();
      await expect(element(by.id('hrv-value'))).toBeVisible();
      
      // 7. Test refresh functionality
      await element(by.id('dashboard-refresh-control')).swipe('down', 'fast');
      await waitFor(element(by.id('health-metrics-container')))
        .toBeVisible()
        .withTimeout(3000);
    });
  });

  describe('Lift Logger CRUD Flow', () => {
    it('should complete create/edit/delete cycle for lift entries', async () => {
      // 1. Navigate to Training screen
      await element(by.id('tab-Training')).tap();
      await expect(element(by.id('training-container'))).toBeVisible();
      
      // 2. CREATE: Add new lift entry
      await element(by.id('lift-create-button')).tap();
      await expect(element(by.id('lift-create-modal'))).toBeVisible();
      
      // Fill in lift details
      await element(by.id('lift-exercise-input')).typeText('Bench Press');
      await element(by.id('lift-weight-input')).typeText('185');
      await element(by.id('lift-reps-input')).typeText('8');
      await element(by.id('lift-sets-input')).typeText('3');
      
      // Save the lift
      await element(by.id('lift-save-button')).tap();
      
      // Verify lift appears in list
      await expect(element(by.id('lift-entry-bench-press'))).toBeVisible();
      await expect(element(by.text('Bench Press'))).toBeVisible();
      await expect(element(by.text('185 lbs × 8 reps × 3 sets'))).toBeVisible();
      
      // 3. EDIT: Modify the lift entry
      await element(by.id('lift-entry-bench-press')).longPress();
      await element(by.id('lift-edit-option')).tap();
      
      await expect(element(by.id('lift-edit-modal'))).toBeVisible();
      
      // Update weight
      await element(by.id('lift-weight-input')).clearText();
      await element(by.id('lift-weight-input')).typeText('190');
      
      // Save changes
      await element(by.id('lift-save-button')).tap();
      
      // Verify updated values
      await expect(element(by.text('190 lbs × 8 reps × 3 sets'))).toBeVisible();
      
      // 4. DELETE: Remove the lift entry
      await element(by.id('lift-entry-bench-press')).longPress();
      await element(by.id('lift-delete-option')).tap();
      
      // Confirm deletion
      await element(by.id('lift-delete-confirm')).tap();
      
      // Verify lift is removed
      await expect(element(by.id('lift-entry-bench-press'))).not.toExist();
    });
  });

  describe('Calendar Session Flow', () => {
    it('should schedule → start → finish workout session', async () => {
      // 1. Navigate to calendar (via Training screen for now)
      await element(by.id('tab-Training')).tap();
      await element(by.id('calendar-view-button')).tap();
      
      await expect(element(by.id('calendar-container'))).toBeVisible();
      
      // 2. SCHEDULE: Create new session
      await element(by.id('calendar-add-session')).tap();
      await expect(element(by.id('session-schedule-modal'))).toBeVisible();
      
      // Select workout type
      await element(by.id('workout-type-strength')).tap();
      
      // Set session details
      await element(by.id('session-name-input')).typeText('Upper Body Strength');
      await element(by.id('session-duration-60min')).tap();
      
      // Schedule for today
      await element(by.id('schedule-today-button')).tap();
      await element(by.id('schedule-confirm')).tap();
      
      // Verify session appears in calendar
      await expect(element(by.id('session-upper-body-strength'))).toBeVisible();
      
      // 3. START: Begin the session
      await element(by.id('session-upper-body-strength')).tap();
      await element(by.id('session-start-button')).tap();
      
      // Verify live session screen
      await expect(element(by.id('live-session-container'))).toBeVisible();
      await expect(element(by.id('session-timer'))).toBeVisible();
      await expect(element(by.id('current-exercise-display'))).toBeVisible();
      
      // Log some exercises during session
      await element(by.id('log-set-button')).tap();
      await element(by.id('set-weight-input')).typeText('135');
      await element(by.id('set-reps-input')).typeText('10');
      await element(by.id('save-set-button')).tap();
      
      // 4. FINISH: Complete the session
      await element(by.id('session-finish-button')).tap();
      await element(by.id('session-finish-confirm')).tap();
      
      // Verify session summary
      await expect(element(by.id('session-summary-modal'))).toBeVisible();
      await expect(element(by.id('session-duration-display'))).toBeVisible();
      await expect(element(by.id('session-exercises-completed'))).toBeVisible();
      
      // Save session
      await element(by.id('save-session-summary')).tap();
      
      // Verify back to calendar with completed session
      await expect(element(by.id('session-upper-body-strength-completed'))).toBeVisible();
    });
  });

  describe('Analytics Charts Flow', () => {
    it('should render tonnage and heatmap charts', async () => {
      // 1. Navigate to Analytics screen
      await element(by.id('tab-Analytics')).tap();
      await expect(element(by.id('analytics-container'))).toBeVisible();
      
      // 2. Wait for charts to load
      await waitFor(element(by.id('analytics-charts-container')))
        .toBeVisible()
        .withTimeout(5000);
      
      // 3. Verify tonnage chart
      await expect(element(by.id('tonnage-chart'))).toBeVisible();
      await expect(element(by.id('tonnage-chart-title'))).toBeVisible();
      await expect(element(by.text('Weekly Tonnage'))).toBeVisible();
      
      // Test chart interaction
      await element(by.id('tonnage-chart')).tap();
      await expect(element(by.id('tonnage-detail-tooltip'))).toBeVisible();
      
      // 4. Verify heatmap chart
      await element(by.id('analytics-scroll-view')).scrollTo('bottom');
      await expect(element(by.id('muscle-heatmap-chart'))).toBeVisible();
      await expect(element(by.id('heatmap-chart-title'))).toBeVisible();
      await expect(element(by.text('Muscle Activation Heatmap'))).toBeVisible();
      
      // Test heatmap interaction
      await element(by.id('muscle-group-chest')).tap();
      await expect(element(by.id('muscle-detail-popup'))).toBeVisible();
      
      // 5. Test period switching
      await element(by.id('analytics-period-30d')).tap();
      await waitFor(element(by.id('tonnage-chart')))
        .toBeVisible()
        .withTimeout(3000);
      
      // Verify charts updated for new period
      await expect(element(by.text('30 Day'))).toBeVisible();
    });
  });

  describe('Nutrition Scanner Flow', () => {
    it('should mock barcode photo → macro parsing', async () => {
      // 1. Navigate to Nutrition screen
      await element(by.id('tab-Nutrition')).tap();
      await expect(element(by.id('nutrition-container'))).toBeVisible();
      
      // 2. Open barcode scanner
      await element(by.id('barcode-scanner-button')).tap();
      await expect(element(by.id('barcode-scanner-modal'))).toBeVisible();
      
      // 3. Simulate barcode scan (mock camera)
      await element(by.id('mock-barcode-scan')).tap();
      
      // 4. Verify scanning animation/feedback
      await expect(element(by.id('scanning-animation'))).toBeVisible();
      await expect(element(by.text('Scanning...'))).toBeVisible();
      
      // 5. Wait for mock product recognition
      await waitFor(element(by.id('product-recognition-result')))
        .toBeVisible()
        .withTimeout(3000);
      
      // 6. Verify parsed macro information
      await expect(element(by.id('product-name-display'))).toBeVisible();
      await expect(element(by.text('Protein Bar - Chocolate'))).toBeVisible();
      
      // Verify macro breakdown
      await expect(element(by.id('nutrition-calories'))).toBeVisible();
      await expect(element(by.id('nutrition-protein'))).toBeVisible();
      await expect(element(by.id('nutrition-carbs'))).toBeVisible();
      await expect(element(by.id('nutrition-fat'))).toBeVisible();
      
      // 7. Add to food log
      await element(by.id('add-to-log-button')).tap();
      
      // 8. Verify food appears in today's log
      await expect(element(by.id('nutrition-container'))).toBeVisible();
      await expect(element(by.id('meal-entry-protein-bar'))).toBeVisible();
      
      // 9. Verify macros updated in daily totals
      await expect(element(by.id('daily-macros-updated'))).toBeVisible();
    });
  });

  describe('ARIA Chat & Program Builder Flow', () => {
    it('should send chat prompt → receive program builder response', async () => {
      // 1. Navigate to Training screen where ARIA chat is accessible
      await element(by.id('tab-Training')).tap();
      await expect(element(by.id('training-container'))).toBeVisible();
      
      // 2. Open ARIA chat interface
      await element(by.id('aria-chat-button')).tap();
      await expect(element(by.id('aria-chat-modal'))).toBeVisible();
      
      // 3. Send program builder prompt
      const prompt = "Create a 4-week strength program for intermediate lifter focusing on bench, squat, deadlift";
      await element(by.id('aria-chat-input')).typeText(prompt);
      await element(by.id('aria-send-button')).tap();
      
      // 4. Verify message sent
      await expect(element(by.id('chat-message-user'))).toBeVisible();
      await expect(element(by.text(prompt))).toBeVisible();
      
      // 5. Wait for ARIA response
      await waitFor(element(by.id('aria-typing-indicator')))
        .toBeVisible()
        .withTimeout(2000);
      
      await waitFor(element(by.id('chat-message-aria')))
        .toBeVisible()
        .withTimeout(10000);
      
      // 6. Verify program builder response is visible
      await expect(element(by.id('program-builder-response'))).toBeVisible();
      await expect(element(by.text('4-Week Strength Program'))).toBeVisible();
      
      // Verify program structure elements
      await expect(element(by.id('program-week-1'))).toBeVisible();
      await expect(element(by.id('program-week-2'))).toBeVisible();
      await expect(element(by.id('program-exercises-list'))).toBeVisible();
      
      // 7. Test accepting the generated program
      await element(by.id('accept-program-button')).tap();
      await expect(element(by.id('program-save-confirmation'))).toBeVisible();
      
      // 8. Verify program appears in training programs list
      await element(by.id('aria-chat-close')).tap();
      await expect(element(by.id('program-4-week-strength'))).toBeVisible();
    });
  });

  describe('Offline Mode & Sync Flow', () => {
    it('should toggle offline → queue actions → replay on reconnect', async () => {
      // 1. Navigate to Settings to enable offline mode
      await element(by.id('tab-Settings')).tap();
      await expect(element(by.id('settings-container'))).toBeVisible();
      
      // 2. Toggle offline mode ON
      await element(by.id('offline-mode-toggle')).tap();
      await expect(element(by.id('offline-mode-active'))).toBeVisible();
      await expect(element(by.text('Offline Mode Active'))).toBeVisible();
      
      // 3. Perform actions while offline (should be queued)
      
      // Navigate to Training and log a workout
      await element(by.id('tab-Training')).tap();
      await element(by.id('lift-create-button')).tap();
      
      // Log exercise while offline
      await element(by.id('lift-exercise-input')).typeText('Squat');
      await element(by.id('lift-weight-input')).typeText('225');
      await element(by.id('lift-reps-input')).typeText('5');
      await element(by.id('lift-save-button')).tap();
      
      // Verify offline indicator and action queued
      await expect(element(by.id('offline-action-queued'))).toBeVisible();
      await expect(element(by.text('Action queued for sync'))).toBeVisible();
      
      // Add nutrition entry while offline
      await element(by.id('tab-Nutrition')).tap();
      await element(by.id('quick-add-meal')).tap();
      await element(by.id('meal-name-input')).typeText('Chicken Breast');
      await element(by.id('meal-calories-input')).typeText('165');
      await element(by.id('save-meal-button')).tap();
      
      // Verify second action queued
      await expect(element(by.text('2 actions queued'))).toBeVisible();
      
      // 4. Check action queue in settings
      await element(by.id('tab-Settings')).tap();
      await element(by.id('offline-queue-status')).tap();
      
      await expect(element(by.id('queued-action-1'))).toBeVisible();
      await expect(element(by.id('queued-action-2'))).toBeVisible();
      await expect(element(by.text('Squat workout entry'))).toBeVisible();
      await expect(element(by.text('Chicken Breast meal entry'))).toBeVisible();
      
      // 5. Toggle offline mode OFF (reconnect)
      await element(by.id('offline-mode-toggle')).tap();
      await expect(element(by.id('offline-mode-inactive'))).toBeVisible();
      
      // 6. Verify sync process starts
      await expect(element(by.id('sync-in-progress'))).toBeVisible();
      await expect(element(by.text('Syncing queued actions...'))).toBeVisible();
      
      // Wait for sync completion
      await waitFor(element(by.id('sync-completed')))
        .toBeVisible()
        .withTimeout(8000);
      
      // 7. Verify actions were replayed successfully
      await expect(element(by.text('All actions synced successfully'))).toBeVisible();
      
      // Verify data appears in respective screens
      await element(by.id('tab-Training')).tap();
      await expect(element(by.id('lift-entry-squat'))).toBeVisible();
      
      await element(by.id('tab-Nutrition')).tap();
      await expect(element(by.id('meal-entry-chicken-breast'))).toBeVisible();
      
      // 8. Verify action queue is cleared
      await element(by.id('tab-Settings')).tap();
      await expect(element(by.text('No actions queued'))).toBeVisible();
    });
  });

  describe('Cross-Screen Integration Flow', () => {
    it('should test complete user journey across all major features', async () => {
      // This test combines multiple features in a realistic user journey
      
      // 1. Start on Dashboard - check daily status
      await element(by.id('tab-Dashboard')).tap();
      await expect(element(by.id('dashboard-container'))).toBeVisible();
      
      // 2. Check today's recommended workout
      await expect(element(by.id('recommended-workout-card'))).toBeVisible();
      await element(by.id('recommended-workout-card')).tap();
      
      // 3. Start the recommended workout
      await element(by.id('start-workout-button')).tap();
      await expect(element(by.id('live-session-container'))).toBeVisible();
      
      // 4. Log some exercises
      await element(by.id('log-set-button')).tap();
      await element(by.id('set-weight-input')).typeText('155');
      await element(by.id('set-reps-input')).typeText('12');
      await element(by.id('save-set-button')).tap();
      
      // 5. Finish workout
      await element(by.id('session-finish-button')).tap();
      await element(by.id('session-finish-confirm')).tap();
      await element(by.id('save-session-summary')).tap();
      
      // 6. Log post-workout nutrition
      await element(by.id('tab-Nutrition')).tap();
      await element(by.id('quick-add-meal')).tap();
      await element(by.id('meal-name-input')).typeText('Protein Shake');
      await element(by.id('meal-protein-input')).typeText('25');
      await element(by.id('save-meal-button')).tap();
      
      // 7. Check updated analytics
      await element(by.id('tab-Analytics')).tap();
      await element(by.id('analytics-refresh-control')).swipe('down', 'fast');
      
      // Verify workout data appears in charts
      await waitFor(element(by.id('tonnage-chart')))
        .toBeVisible()
        .withTimeout(3000);
      
      // 8. Return to dashboard to see updated metrics
      await element(by.id('tab-Dashboard')).tap();
      await element(by.id('dashboard-refresh-control')).swipe('down', 'fast');
      
      // Verify workout completion reflected in today's stats
      await expect(element(by.id('workouts-completed-today'))).toHaveText('1');
      await expect(element(by.id('calories-burned-updated'))).toBeVisible();
    });
  });
});