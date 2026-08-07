# Task 1 — Test Design: 30-Day Fitness Challenge

**Feature under test:** Join challenge → Sync steps → Earn points → Leaderboard → Redeem points → Share achievements

## 1. Functional Test Scenarios

| # | Scenario |
|---|----------|
| 1 | User can view and browse available 30-day challenges |
| 2 | User can join an open challenge |
| 3 | User cannot join a challenge that has already ended |
| 4 | Steps sync correctly from a connected wearable device |
| 5 | Steps sync correctly from mobile phone sensor (no wearable paired) |
| 6 | Points are awarded once daily goal is met |
| 7 | Points are NOT awarded if daily goal is not met |
| 8 | Leaderboard reflects correct ranking based on points/steps |
| 9 | Leaderboard updates in near real-time (or within defined SLA) after sync |
| 10 | User can redeem accumulated points in the rewards store |
| 11 | User cannot redeem more points than they've earned |
| 12 | User can share an achievement (e.g., milestone, badge) to a social channel |
| 13 | Challenge progress persists correctly across app restarts / re-login |
| 14 | Multiple simultaneous device syncs (phone + wearable) don't double-count steps |
| 15 | User can leave/withdraw from a challenge they've joined |

## 2. Test Cases (sample, expandable)

| ID | Title | Precondition | Steps | Expected Result |
|----|-------|--------------|-------|------------------|
| TC-01 | Join challenge — happy path | User logged in, challenge open | 1. Navigate to challenge 2. Tap "Join" | User is enrolled; challenge appears in "My Challenges"; join confirmation shown |
| TC-02 | Join challenge — already joined | User already joined this challenge | 1. Tap "Join" again | System blocks re-join; shows "Already joined" message (maps to API 409) |
| TC-03 | Sync steps — goal met | User joined, daily goal = 10,000 | 1. Sync 10,000+ steps | Points awarded for the day; progress bar/UI updates |
| TC-04 | Sync steps — goal not met | User joined | 1. Sync 5,000 steps | No points awarded; partial progress shown accurately |
| TC-05 | Leaderboard ranking | Multiple users with varying points | 1. Open leaderboard | Users ranked correctly, highest points first; ties handled per defined rule |
| TC-06 | Redeem points — sufficient balance | User has ≥ reward cost in points | 1. Select reward 2. Redeem | Points deducted correctly; reward confirmation shown; balance updates |
| TC-07 | Redeem points — insufficient balance | User has < reward cost | 1. Select reward 2. Attempt redeem | Redemption blocked; clear error shown; no point deduction |
| TC-08 | Share achievement | User has earned a badge/milestone | 1. Tap Share 2. Choose channel | Share sheet opens with correct content; no crash if share is cancelled |
| TC-09 | Challenge completion | User completes all 30 days | 1. Meet goal on day 30 | Challenge marked complete; completion badge/reward granted |
| TC-10 | Withdraw from challenge | User joined, mid-challenge | 1. Tap "Leave Challenge" | User removed from leaderboard; progress/points handling matches defined business rule (kept vs. forfeited) |

## 3. Boundary Conditions

- Daily step goal exactly at threshold (e.g., exactly 10,000 steps) — must award points, not just `> threshold`.
- Last second of the day (23:59:59) — steps synced right at day rollover; must count for the correct day, not roll into the next.
- First day of the challenge vs. day 30 (challenge start/end boundaries).
- Points balance boundary: redeeming a reward that costs exactly the user's current balance (should succeed, leaving 0).
- Leaderboard with exactly 1 participant, and with a very large number of participants (pagination boundary).
- Maximum steps in a day (e.g., 0 and unrealistically high values like 200,000 — see negative/edge below).

## 4. Negative Test Cases

- Join a challenge with an invalid/expired `challengeId`.
- Join while unauthenticated / with an expired session token.
- Sync steps with a negative step count or non-numeric payload.
- Sync steps for a future date.
- Redeem a reward with insufficient points.
- Redeem a reward that has been discontinued/out of stock mid-transaction.
- Attempt to join the same challenge twice in rapid succession (race condition / double-tap).
- Share an achievement with no network connectivity.
- Attempt any action right after the challenge has expired.

## 5. Edge Cases

- User has multiple wearables paired — which source's step count wins, and is there de-duplication?
- Device clock skew between mobile and wearable causing steps to log on the "wrong" day.
- User travels across time zones mid-challenge (which timezone defines "daily" boundaries?).
- App is backgrounded/killed mid-sync — does the sync resume, restart, or silently fail?
- Poor/intermittent connectivity during step sync — retry behavior and data loss.
- Extremely large leaderboards (thousands of participants) — performance and pagination.
- Points earned right as a promotional multiplier/event starts or ends.
- User uninstalls and reinstalls the app mid-challenge — does progress restore correctly from the backend?

## 6. Regression Areas

- Authentication/session handling (touches nearly every flow above).
- Points/wallet balance calculation (shared with rewards store, likely used elsewhere in the app).
- Notification system (goal achieved, leaderboard rank change, challenge ending soon).
- Device sync/integration layer (wearable SDKs, mobile sensor permissions).
- Rewards store inventory and fulfillment.
- Social share integrations (external SDKs are a common source of regressions after OS updates).

## 7. Highest Risk Areas

1. **Points calculation & wallet balance** — direct financial/reward impact if wrong; must be tested for correctness and race conditions (concurrent syncs, concurrent redemptions).
2. **Step sync data integrity** — double-counting or data loss directly affects fairness of the leaderboard and rewards, which affects user trust.
3. **Leaderboard correctness at scale** — ranking bugs are highly visible to all users simultaneously.
4. **Idempotency of "Join Challenge"** — the API's `409 Already Joined` suggests this is already a known risk; duplicate joins/enrollments must be prevented under concurrent requests.
5. **Cross-timezone / day-boundary logic** — subtle bugs here silently corrupt "daily goal" tracking, which is the core mechanic of the whole feature.

## 8. What Should Be Automated First

Priority order, with reasoning:

1. **Join Challenge API (all response codes: 200/401/404/409/500)** — fast, stable, high-value; covered in Task 2, and is the single highest-risk integration point (idempotency).
2. **Core E2E happy path** — Login → Join → Sync steps (meet goal) → Points awarded → Leaderboard reflects it → Logout. This is the feature's primary user journey and the highest-value regression guard.
3. **Points/reward balance calculations** — redeem with sufficient and insufficient balance; financial correctness must never regress silently.
4. **Boundary conditions around the daily goal threshold** — since this logic is easy to get subtly wrong (`>=` vs `>`) and hard to catch via manual testing alone.
5. **Leaderboard ranking with seeded/mocked data** — deterministic test data makes this cheap to automate and very effective at catching sorting/tie-break regressions.

Lower priority for automation (better suited to exploratory/manual first): social share flows (heavy external SDK dependency, high flakiness/low ROI to automate early), and true wearable-hardware sync (better covered via mocked API-level tests than automating an actual physical device).
