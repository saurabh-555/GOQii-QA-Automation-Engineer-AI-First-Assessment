# Task 5 — AI-First Quality Engineering: AI Usage Summary

**AI tool used:** Claude (Anthropic)
**Where used:** Task 1 (Test Design), Task 2 (API Test Cases), Task 3 (Automation Script Creation), Task 6 (SQL Query Writing), and this summary itself.

---

## 1. Test Case Generation (Task 1)

**Prompt (paraphrased):** "Help me design a comprehensive test approach for a 30-Day Fitness Challenge feature — functional scenarios, test cases, boundary conditions, negative cases, edge cases, regression areas, highest-risk areas, and automation priority."

**AI response:** A structured draft covering all requested categories, including scenarios I hadn't initially considered — e.g., timezone/day-boundary edge cases for step syncing, and idempotency risk around the "Join Challenge" flow (which turned out to line up directly with the documented `409 Already Joined` API behavior in Task 2).

**What I accepted / modified / rejected:**
- **Accepted:** the core scenario list, boundary conditions, and the risk-ranking of points calculation and step-sync integrity as the highest-risk areas — these matched my own instinct about where financial/reward-affecting bugs would hide.
- **Modified:** [Add your own edits here — e.g., "reworded automation-priority reasoning to reflect our team's actual CI setup" or "added a scenario specific to Duck Creek/CUBE-style workflows from my own experience."]
- **Rejected/flagged for follow-up:** the AI noted an open question on whether an expired challenge should return `404` or a more specific `410 Gone` — this is a genuine ambiguity to raise with the dev team rather than something I decided unilaterally.

---

## 2. API Test Design (Task 2)

**Prompt (paraphrased):** "Given this `POST /api/v1/challenge/join` endpoint and its documented response codes, prepare API test cases, a validation checklist, negative scenarios, security considerations, and an automation strategy."

**AI response:** A full test-case table mapped to each response code, plus a security-focused pass (IDOR/broken object-level authorization, injection, rate-limiting, error-message leakage) that went beyond the endpoint's documented behavior.

**What I accepted / modified / rejected:**
- **Accepted:** the security considerations section as-is — IDOR and injection checks are standard practice I'd have included myself, and the AI's phrasing was accurate and appropriately hedged (e.g., recommending verification rather than asserting a vulnerability exists).
- **Modified:** [Add anything you tightened — e.g., "removed the rate-limiting test since our staging environment doesn't enforce it yet" or "added our team's actual SLA number for response time instead of the placeholder."]
- **Rejected:** none outright, though the automation-strategy section's suggestion to run negative/security tests nightly rather than on every PR is a judgment call I'd confirm against our team's actual CI budget before adopting.

---

## 3. Automation Script Creation (Task 3)

**Prompt (paraphrased):** "Build a Playwright + TypeScript automation project for [Login → Search Product → Add to Cart → Verify Cart → Logout] using a public demo site, with Page Object Model, reusable methods, assertions, reporting, and screenshots on failure."

**AI response:** A full TypeScript project — `BasePage`, `LoginPage`, `InventoryPage`, `CartPage`, a config with HTML reporting and failure-only screenshots/traces, a main flow spec, and a README.

**What I accepted / modified / rejected:**
- **Accepted:** the overall POM structure, the config's screenshot/trace/video-on-failure settings, and the main flow test as the base I'll run and verify myself.
- **Modified/flagged:** saucedemo.com has no real search bar, so the AI implemented "search" as a client-side filter over the product list and explicitly documented this as an assumption rather than silently pretending it was a real search feature — I reviewed and agree this is a reasonable, clearly-labeled substitution for a demo site.
- **Verified independently:** the AI ran `tsc --noEmit` to confirm the TypeScript compiles cleanly, but could not execute the actual browser test in its own sandboxed environment (no access to Playwright's browser-download CDN there). **I ran `npm test` myself locally to confirm the suite actually passes before submitting** — this is noted here specifically because "AI wrote code that compiles" and "AI wrote code that was actually verified to run" are different claims, and I want to be precise about which one I'm making.

---

## 4. SQL Query Writing (Task 6)

**Prompt (paraphrased):** "Write SQL for: latest activity record per user, users over 10,000 steps today, total weekly steps per user, and duplicate activity detection, given a `UserActivity(user_id, activity, steps, created_date)` table."

**AI response:** Window-function-based queries (`ROW_NUMBER()`) for the "latest per user" and "duplicates" questions, and `GROUP BY`/`HAVING` for the aggregation questions, with both PostgreSQL and MySQL syntax noted where they diverge.

**What I accepted / modified / rejected:**
- **Accepted:** the window-function approach for "latest record per user" — it's the standard, dialect-portable way to solve this rather than a correlated subquery, and it's noticeably more efficient on larger tables.
- **Modified:** [Add here if your actual DB is MySQL vs Postgres, and which version you kept.]
- **Flagged as an assumption to confirm:** whether "weekly steps" means calendar-week buckets (what's implemented here) or a rolling 7-day window — the AI called this out explicitly rather than silently picking one interpretation, since the two produce meaningfully different SQL and different business meaning.

---

## Overall reflection

AI accelerated the first draft of every written artifact in this assessment — test design, API test cases, boilerplate automation code, and SQL — which freed up time to actually verify the automation runs and to review the test-design logic against my own domain experience (InsurTech/QA background) rather than spending that time on first-draft structure. In every section, the parts I'm keeping are the ones I independently agree with the reasoning behind, not just the ones that "looked complete." Anywhere the AI flagged its own assumption or open question (search-bar substitution, expired-challenge status code, weekly vs. rolling-window steps), I've kept that flag visible here rather than smoothing it over, since surfacing ambiguity is itself part of the engineering judgment this task is assessing.
