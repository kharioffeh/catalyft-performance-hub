import { element, by, waitFor, device } from 'detox';

export class E2EHelpers {
  /**
   * Wait for authentication to complete and dashboard to appear
   */
  static async waitForAuth(timeout = 10000) {
    await waitFor(element(by.id('dashboard-container')))
      .toBeVisible()
      .withTimeout(timeout);
  }

  /**
   * Navigate to a specific tab and verify container is visible
   */
  static async navigateToTab(tabName: string) {
    await element(by.id(`tab-${tabName}`)).tap();
    await this.waitForElement(`${tabName.toLowerCase()}-container`);
  }

  /**
   * Wait for an element to be visible with default timeout
   */
  static async waitForElement(testID: string, timeout = 5000) {
    await waitFor(element(by.id(testID)))
      .toBeVisible()
      .withTimeout(timeout);
  }

  /**
   * Fill in lift entry form with provided details
   */
  static async fillLiftEntry(exercise: string, weight: string, reps: string, sets?: string) {
    await element(by.id('lift-exercise-input')).typeText(exercise);
    await element(by.id('lift-weight-input')).typeText(weight);
    await element(by.id('lift-reps-input')).typeText(reps);
    if (sets) {
      await element(by.id('lift-sets-input')).typeText(sets);
    }
  }

  /**
   * Add a meal entry with basic nutrition information
   */
  static async addMealEntry(name: string, calories: string, protein?: string) {
    await element(by.id('meal-name-input')).typeText(name);
    await element(by.id('meal-calories-input')).typeText(calories);
    if (protein) {
      await element(by.id('meal-protein-input')).typeText(protein);
    }
  }

  /**
   * Complete a full workout logging cycle
   */
  static async logWorkoutSet(weight: string, reps: string) {
    await element(by.id('log-set-button')).tap();
    await element(by.id('set-weight-input')).typeText(weight);
    await element(by.id('set-reps-input')).typeText(reps);
    await element(by.id('save-set-button')).tap();
  }

  /**
   * Simulate magic link deep link authentication
   */
  static async authenticateViaMagicLink(token = 'test-magic-token', email = 'test@example.com') {
    await device.openURL({ url: `catalyft://auth/magic-link?token=${token}&email=${email}` });
    await this.waitForElement('magic-link-processing');
    await this.waitForAuth();
  }

  /**
   * Toggle offline mode in settings
   */
  static async toggleOfflineMode(enable = true) {
    await this.navigateToTab('Settings');
    
    // Find and tap offline mode toggle
    const toggleButton = element(by.id('offline-toggle'));
    await waitFor(toggleButton).toBeVisible().withTimeout(3000);
    
    // Check current state and toggle if needed
    const offlineState = await toggleButton.getAttributes();
    const isCurrentlyEnabled = (offlineState as any).value === 'true' || (offlineState as any).value === true;
    
    if (isCurrentlyEnabled !== enable) {
      await toggleButton.tap();
    }
    
    // Verify the toggle worked
    if (enable) {
      await this.waitForElement('offline-mode-active');
    } else {
      await this.waitForElement('offline-mode-inactive');
    }
  }

  /**
   * Perform refresh action on current screen
   */
  static async refreshCurrentScreen() {
    // Try to find refresh control on current screen
    const possibleRefreshControls = [
      'dashboard-refresh-control',
      'analytics-refresh-control',
      'training-refresh-control',
      'nutrition-refresh-control'
    ];

    for (const refreshId of possibleRefreshControls) {
      try {
        const refreshControl = element(by.id(refreshId));
        await refreshControl.swipe('down', 'fast');
        return; // Successfully found and used refresh control
      } catch (error) {
        // Continue to next refresh control
        continue;
      }
    }
  }

  /**
   * Verify chart elements are visible and interactive
   */
  static async verifyChartInteraction(chartTestID: string, interactionTestID: string) {
    await this.waitForElement(chartTestID);
    await element(by.id(chartTestID)).tap();
    await this.waitForElement(interactionTestID);
  }

  /**
   * Handle alerts and modals by accepting or dismissing
   */
  static async handleAlert(action: 'accept' | 'dismiss' = 'accept') {
    // Wait a bit for alert to appear
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      if (action === 'accept') {
        await element(by.text('OK')).tap();
      } else {
        await element(by.text('Cancel')).tap();
      }
    } catch (error) {
      // Alert might not be present or have different button text
      console.log('No alert found or different button text');
    }
  }

  /**
   * Simulate barcode scanning with mock data
   */
  static async performBarcodeScanning() {
    await element(by.id('barcode-scanner-button')).tap();
    await this.waitForElement('barcode-scanner-modal');
    
    // Simulate successful scan
    await element(by.id('mock-barcode-scan')).tap();
    await this.waitForElement('scanning-animation');
    await this.waitForElement('product-recognition-result', 5000);
  }

  /**
   * Send ARIA chat message and wait for response
   */
  static async sendARIAChatMessage(message: string) {
    await element(by.id('aria-chat-input')).typeText(message);
    await element(by.id('aria-send-button')).tap();
    
    // Wait for message to appear
    await this.waitForElement('chat-message-user');
    
    // Wait for ARIA typing indicator
    await this.waitForElement('aria-typing-indicator', 3000);
    
    // Wait for ARIA response
    await this.waitForElement('chat-message-aria', 15000);
  }

  /**
   * Schedule a workout session in calendar
   */
  static async scheduleWorkoutSession(name: string, type: 'strength' | 'cardio' | 'hiit' = 'strength') {
    await element(by.id('calendar-add-session')).tap();
    await this.waitForElement('session-schedule-modal');
    
    await element(by.id(`workout-type-${type}`)).tap();
    await element(by.id('session-name-input')).typeText(name);
    await element(by.id('schedule-today-button')).tap();
    await element(by.id('schedule-confirm')).tap();
  }

  /**
   * Complete a full session from start to finish
   */
  static async completeWorkoutSession(sessionTestID: string) {
    // Start session
    await element(by.id(sessionTestID)).tap();
    await element(by.id('session-start-button')).tap();
    await this.waitForElement('live-session-container');
    
    // Log some activity
    await this.logWorkoutSet('135', '10');
    
    // Finish session
    await element(by.id('session-finish-button')).tap();
    await element(by.id('session-finish-confirm')).tap();
    await this.waitForElement('session-summary-modal');
    await element(by.id('save-session-summary')).tap();
  }

  /**
   * Verify offline queue status
   */
  static async verifyOfflineQueue(expectedCount: number) {
    await this.navigateToTab('Settings');
    await element(by.id('offline-queue-status')).tap();
    
    if (expectedCount === 0) {
      await this.waitForElement('no-actions-queued');
    } else {
      for (let i = 1; i <= expectedCount; i++) {
        await this.waitForElement(`queued-action-${i}`);
      }
    }
  }

  /**
   * Wait for sync completion after reconnecting
   */
  static async waitForSyncCompletion(timeout = 10000) {
    await this.waitForElement('sync-in-progress');
    await this.waitForElement('sync-completed', timeout);
  }

  /**
   * Clear all form inputs (useful for cleanup)
   */
  static async clearInput(testID: string) {
    await element(by.id(testID)).clearText();
  }

  /**
   * Scroll to bottom of current screen
   */
  static async scrollToBottom() {
    const possibleScrollViews = [
      'dashboard-container',
      'analytics-container',
      'training-container',
      'nutrition-container',
      'settings-container'
    ];

    for (const scrollId of possibleScrollViews) {
      try {
        await element(by.id(scrollId)).scrollTo('bottom');
        return;
      } catch (error) {
        continue;
      }
    }
  }

  /**
   * Take screenshot for debugging (useful in CI)
   */
  static async takeScreenshot(name: string) {
    await device.takeScreenshot(name);
  }

  /**
   * Restart app (useful for testing app state persistence)
   */
  static async restartApp() {
    await device.terminateApp();
    await device.launchApp({ newInstance: true });
  }

  /**
   * Generic wait with custom timeout
   */
  static async wait(milliseconds: number) {
    await new Promise(resolve => setTimeout(resolve, milliseconds));
  }
}

// Export individual helper functions for convenience
export const {
  waitForAuth,
  navigateToTab,
  waitForElement,
  fillLiftEntry,
  addMealEntry,
  logWorkoutSet,
  authenticateViaMagicLink,
  toggleOfflineMode,
  refreshCurrentScreen,
  verifyChartInteraction,
  handleAlert,
  performBarcodeScanning,
  sendARIAChatMessage,
  scheduleWorkoutSession,
  completeWorkoutSession,
  verifyOfflineQueue,
  waitForSyncCompletion,
  clearInput,
  scrollToBottom,
  takeScreenshot,
  restartApp,
  wait
} = E2EHelpers;