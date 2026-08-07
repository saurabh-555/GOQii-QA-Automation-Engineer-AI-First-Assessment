# Task 3 — Automation Challenge (Playwright + TypeScript)

**Site under test:** [https://www.saucedemo.com](https://www.saucedemo.com)
**Flow automated:** Login → Search Product → Add Product to Cart → Verify Cart → Logout

## To run the test
npm install
npx playwright install chromium
npm test

## Why saucedemo.com

It ships with fixed, documented demo credentials (no signup/CAPTCHA needed), a stable
DOM with `data-test` / predictable class hooks, and includes a locked-out-user account
that's useful for a quick negative-path test alongside the main flow.

## Assumption called out (as requested in the assessment instructions)

saucedemo.com does **not** have a native search box — its inventory page is a fixed
product list with only a sort dropdown. To satisfy the "Search Product" step in the
required flow, `InventoryPage.searchProduct()` implements search as a filter over the
rendered product list, matching by product name (`locator.filter({ hasText })`). This
is called out in code comments in `pages/InventoryPage.ts` as well. If a site with a
real search input is preferred, `automationexercise.com` is a drop-in alternative, but
it requires account signup before login (no fixed demo user), which adds setup
complexity out of scope for a 3-hour assessment.

## Project structure

```
goqii-playwright-ts/
├── pages/
│   ├── BasePage.ts        # shared navigation helper, extended by all page objects
│   ├── LoginPage.ts        # login form + error assertions
│   ├── InventoryPage.ts    # product list, search/filter, add-to-cart, cart badge, logout
│   └── CartPage.ts         # cart contents assertions
├── tests/
│   └── e2e-flow.spec.ts    # main flow + a bonus negative-path test
├── utils/
│   └── testData.ts         # test users and target product, kept out of test logic
├── playwright.config.ts    # base URL, HTML reporter, screenshots/traces on failure
├── package.json
├── tsconfig.json
└── README.md
```

Design choices:
- **Page Object Model** — one class per page, locators kept private, only intention-revealing
  methods (`login()`, `addProductToCart()`, `expectCartCount()`) are exposed to tests.
- **Reusable methods** — `searchProduct()` / `addProductToCart()` both key off product name,
  so the same methods work for any product without duplicating locator logic.
- **Assertions** live in the page objects as `expect...()` methods so test files read like
  a checklist of business steps, and assertion logic isn't duplicated across specs.
- **Reporting** — HTML report is generated every run (`playwright-report/`), auto-opens on
  failure locally. `list` reporter gives readable console output too.
- **Screenshots on failure** — configured via `use.screenshot: 'only-on-failure'`, plus
  `trace: 'retain-on-failure'` for step-by-step debugging and `video: 'on-first-retry'`.

## Setup

Requires Node.js 18+.

```bash
npm install
npx playwright install chromium
```

## Running the tests

```bash
npm test              # headless run, all tests
npm run test:headed   # headed (visible browser) run
npm run report        # open the last HTML report
```

A single test can be run directly:

```bash
npx playwright test -g "user can log in, find a product"
```

## CI/CD Integration

This repository includes a GitHub Actions workflow at `.github/workflows/ci.yml` that:

- installs Node.js and dependencies
- installs the Chromium browser for Playwright
- runs the test suite with `npm test`
- uploads the HTML report and test result artifacts on every run

The workflow triggers on `push` and `pull_request` to `main`/`master`.

## Test coverage in this file

1. **Happy path** — `standard_user` logs in, finds "Sauce Labs Backpack" via the
   search/filter helper, adds it to the cart, confirms the cart badge shows `1`,
   opens the cart and confirms the product name and item count, then logs out and
   confirms the login button reappears.
2. **Bonus negative path** — `locked_out_user` attempts login and is asserted to see
   the "locked out" error message, reusing the same `LoginPage` object.


