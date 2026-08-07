import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  private readonly cartItem: Locator;
  private readonly cartItemName: Locator;

  constructor(page: Page) {
    super(page);
    this.cartItem = page.locator('.cart_item');
    this.cartItemName = page.locator('.inventory_item_name');
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/cart\.html/);
  }

  async expectProductInCart(productName: string) {
    await expect(this.cartItemName).toContainText(productName);
  }

  async expectItemCount(count: number) {
    await expect(this.cartItem).toHaveCount(count);
  }
}
