import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { TEST_USER, LOCKED_OUT_USER, TARGET_PRODUCT } from '../utils/testData';

/**
 * Task 3 - Automation Challenge
 * Site: https://www.saucedemo.com
 * Flow under test: Login -> Search Product -> Add Product to Cart -> Verify Cart -> Logout
 */
test.describe('Sauce Demo - Purchase flow', () => {
  test('user can log in, find a product, add it to cart, verify it, and log out', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);

    await test.step('Login', async () => {
      await loginPage.open();
      await loginPage.login(TEST_USER.username, TEST_USER.password);
      await inventoryPage.expectLoaded();
    });

    await test.step('Search product', async () => {
      const product = await inventoryPage.searchProduct(TARGET_PRODUCT);
      await expect(product).toContainText(TARGET_PRODUCT);
    });

    await test.step('Add product to cart', async () => {
      await inventoryPage.addProductToCart(TARGET_PRODUCT);
      await inventoryPage.expectCartCount(1);
    });

    await test.step('Verify cart', async () => {
      await inventoryPage.openCart();
      await cartPage.expectLoaded();
      await cartPage.expectItemCount(1);
      await cartPage.expectProductInCart(TARGET_PRODUCT);
    });

    await test.step('Logout', async () => {
      await inventoryPage.logout();
      await expect(page).toHaveURL('https://www.saucedemo.com/');
      await expect(page.locator('#login-button')).toBeVisible();
    });
  });

  // Bonus: a negative-path test to show broader coverage, reusing the same POM.
  test('locked out user cannot log in', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.login(LOCKED_OUT_USER.username, LOCKED_OUT_USER.password);
    await loginPage.expectLoginError('locked out');
  });
});
