import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * NOTE / ASSUMPTION:
 * saucedemo.com does not have a native product search box. To satisfy the
 * "Search Product" step in the assessment flow, search is implemented as a
 * client-side filter over the visible inventory list (matching product
 * name text), which is a common, documented substitution for demo sites
 * that lack a real search feature. This assumption is called out again in
 * the README.
 */
export class InventoryPage extends BasePage {
  private readonly inventoryItem: Locator;
  private readonly itemName: Locator;
  private readonly cartBadge: Locator;
  private readonly cartLink: Locator;
  private readonly burgerMenuButton: Locator;
  private readonly logoutLink: Locator;

  constructor(page: Page) {
    super(page);
    this.inventoryItem = page.locator('.inventory_item');
    this.itemName = page.locator('.inventory_item_name');
    this.cartBadge = page.locator('.shopping_cart_badge');
    this.cartLink = page.locator('.shopping_cart_link');
    this.burgerMenuButton = page.locator('#react-burger-menu-btn');
    this.logoutLink = page.locator('#logout_sidebar_link');
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/inventory\.html/);
  }

  /** Simulated "search" - filters the rendered product list by name. */
  async searchProduct(productName: string): Promise<Locator> {
    const matches = this.inventoryItem.filter({ hasText: productName });
    await expect(matches.first()).toBeVisible();
    return matches.first();
  }

  async addProductToCart(productName: string) {
    const product = this.inventoryItem.filter({ hasText: productName }).first();
    await product.getByRole('button', { name: /add to cart/i }).click();
  }

  async expectCartCount(count: number) {
    if (count === 0) {
      await expect(this.cartBadge).toHaveCount(0);
    } else {
      await expect(this.cartBadge).toHaveText(String(count));
    }
  }

  async openCart() {
    await this.cartLink.click();
  }

  async logout() {
    await this.burgerMenuButton.click();
    await this.logoutLink.click();
  }
}
