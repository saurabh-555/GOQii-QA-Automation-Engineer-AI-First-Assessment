import { Page } from '@playwright/test';

/**
 * BasePage centralizes behaviour shared by every page object:
 * navigation and a reusable wait helper. Concrete pages extend this
 * instead of repeating boilerplate.
 */
export class BasePage {
  constructor(protected readonly page: Page) {}

  async goto(path: string = '/') {
    await this.page.goto(path);
  }

  protected async waitForVisible(locatorText: string) {
    await this.page.getByText(locatorText).waitFor({ state: 'visible' });
  }
}
