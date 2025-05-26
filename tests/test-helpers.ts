
import { Page } from '@playwright/test';

export class TestHelpers {
  constructor(private page: Page) {}

  async login(email: string = 'test@example.com', password: string = 'testpassword') {
    await this.page.goto('/');
    await this.page.fill('input[type="email"]', email);
    await this.page.fill('input[type="password"]', password);
    await this.page.click('button[type="submit"]');
    await this.page.waitForURL(/\/(dashboard|calendar)/);
  }

  async waitForCalendar() {
    await this.page.waitForSelector('.fc-view');
    await this.page.waitForTimeout(1000); // Wait for calendar to fully render
  }

  async createTestEvent(title: string, date: string) {
    // This would depend on your event creation UI
    await this.page.click('[data-testid="add-event-button"]');
    await this.page.fill('input[name="title"]', title);
    await this.page.fill('input[name="date"]', date);
    await this.page.click('button[type="submit"]');
  }
}
